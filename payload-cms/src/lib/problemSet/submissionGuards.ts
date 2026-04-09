import type { PayloadRequest } from 'payload'

type RateBucket = {
  timestamps: number[]
}

const RATE_WINDOW_MS = Number(process.env.PROBLEM_ATTEMPT_RATE_WINDOW_MS ?? 60_000)
const RATE_MAX_SUBMISSIONS = Number(process.env.PROBLEM_ATTEMPT_RATE_MAX ?? 20)
const rateBuckets = new Map<string, RateBucket>()
const RATE_LIMIT_COLLECTION = 'problem-attempts'
const RATE_LIMIT_FALLBACK_RETRY_SEC = Math.max(1, Math.ceil(RATE_WINDOW_MS / 1000))

export type ProblemAttemptRateLimitResult = {
  blocked: boolean
  retryAfterSec: number
}

const normalizeHeaderValue = (value: string | string[] | null | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

const getHeaderValue = (req: PayloadRequest, key: string): string => {
  const headers = req.headers as unknown
  if (headers && typeof headers === 'object' && 'get' in (headers as { get?: unknown })) {
    const getter = (headers as { get: (name: string) => string | null }).get
    return normalizeHeaderValue(getter(key))
  }

  if (headers && typeof headers === 'object') {
    return normalizeHeaderValue((headers as Record<string, string | string[] | undefined>)[key])
  }

  return ''
}

const extractClientAddress = (req: PayloadRequest): string => {
  const forwardedFor = getHeaderValue(req, 'x-forwarded-for')
  const forwardedIp = forwardedFor.split(',')[0]?.trim()
  if (forwardedIp) return forwardedIp

  const realIp = getHeaderValue(req, 'x-real-ip').trim()
  if (realIp) return realIp

  return 'unknown'
}

const getRateLimitKey = (req: PayloadRequest): string => {
  if (req.user?.id) return `user:${String(req.user.id)}`
  return `ip:${extractClientAddress(req)}`
}

const toIso = (value: number) => new Date(value).toISOString()

const buildWindowWhere = (userId: string, windowStartIso: string) => ({
  user: { equals: userId },
  createdAt: { greater_than_equal: windowStartIso },
})

const getRetryAfterSec = (oldestInWindowMs: number, now: number) => {
  const retryAfterMs = Math.max(1_000, oldestInWindowMs + RATE_WINDOW_MS - now)
  return Math.ceil(retryAfterMs / 1_000)
}

export const isProblemAttemptRateLimited = (
  req: PayloadRequest,
  now = Date.now(),
): ProblemAttemptRateLimitResult => {
  if (!Number.isFinite(RATE_WINDOW_MS) || RATE_WINDOW_MS <= 0) {
    return { blocked: false, retryAfterSec: 0 }
  }
  if (!Number.isFinite(RATE_MAX_SUBMISSIONS) || RATE_MAX_SUBMISSIONS <= 0) {
    return { blocked: false, retryAfterSec: 0 }
  }

  const key = getRateLimitKey(req)
  const bucket = rateBuckets.get(key) ?? { timestamps: [] }
  const minTime = now - RATE_WINDOW_MS
  bucket.timestamps = bucket.timestamps.filter((ts) => ts >= minTime)

  if (bucket.timestamps.length >= RATE_MAX_SUBMISSIONS) {
    const oldestInWindow = bucket.timestamps[0] ?? now
    rateBuckets.set(key, bucket)
    return { blocked: true, retryAfterSec: getRetryAfterSec(oldestInWindow, now) }
  }

  bucket.timestamps.push(now)
  rateBuckets.set(key, bucket)
  return { blocked: false, retryAfterSec: 0 }
}

export const isProblemAttemptRateLimitedDistributed = async (
  req: PayloadRequest,
  now = Date.now(),
): Promise<ProblemAttemptRateLimitResult> => {
  const localResult = isProblemAttemptRateLimited(req, now)
  if (localResult.blocked) return localResult

  const userId = req.user?.id != null ? String(req.user.id) : ''
  if (!userId) return localResult
  if (!req.payload?.count || !req.payload?.find) return localResult
  if (!Number.isFinite(RATE_WINDOW_MS) || RATE_WINDOW_MS <= 0) return localResult
  if (!Number.isFinite(RATE_MAX_SUBMISSIONS) || RATE_MAX_SUBMISSIONS <= 0) return localResult

  const windowStartIso = toIso(now - RATE_WINDOW_MS)
  const where = buildWindowWhere(userId, windowStartIso)

  try {
    const recentCount = await req.payload.count({
      collection: RATE_LIMIT_COLLECTION,
      where,
      overrideAccess: true,
    })
    if (recentCount.totalDocs < RATE_MAX_SUBMISSIONS) return localResult

    const oldest = await req.payload.find({
      collection: RATE_LIMIT_COLLECTION,
      where,
      limit: 1,
      sort: 'createdAt',
      depth: 0,
      overrideAccess: true,
      pagination: false,
    })
    const oldestCreatedAt = oldest.docs?.[0]
      ? Date.parse(String((oldest.docs[0] as { createdAt?: string }).createdAt ?? ''))
      : Number.NaN
    return {
      blocked: true,
      retryAfterSec: Number.isFinite(oldestCreatedAt)
        ? getRetryAfterSec(oldestCreatedAt, now)
        : RATE_LIMIT_FALLBACK_RETRY_SEC,
    }
  } catch {
    // Fail soft to in-memory guard if persistence checks are unavailable.
    return localResult
  }
}

export const getAttemptLimitContext = async (
  req: PayloadRequest,
  data: Record<string, unknown>,
): Promise<{ maxAttempts: number | null; attemptCount: number }> => {
  const problemSetValue = data.problemSet
  const lessonValue = data.lesson
  const userId = req.user?.id != null ? String(req.user.id) : ''

  if (!problemSetValue || !userId) return { maxAttempts: null, attemptCount: 0 }

  const problemSetId =
    typeof problemSetValue === 'string' || typeof problemSetValue === 'number'
      ? String(problemSetValue)
      : typeof problemSetValue === 'object' && problemSetValue !== null && 'id' in problemSetValue
        ? String((problemSetValue as { id?: string | number }).id ?? '')
        : ''
  if (!problemSetId) return { maxAttempts: null, attemptCount: 0 }

  const lessonId =
    typeof lessonValue === 'string' || typeof lessonValue === 'number'
      ? String(lessonValue)
      : typeof lessonValue === 'object' && lessonValue !== null && 'id' in lessonValue
        ? String((lessonValue as { id?: string | number }).id ?? '')
        : ''

  const problemSet = (await req.payload.findByID({
    collection: 'problem-sets',
    id: problemSetId,
    depth: 0,
    overrideAccess: true,
  })) as { maxAttempts?: unknown }

  const maxAttemptsRaw = Number(problemSet.maxAttempts)
  const maxAttempts = Number.isFinite(maxAttemptsRaw) && maxAttemptsRaw > 0 ? Math.trunc(maxAttemptsRaw) : null
  if (maxAttempts == null) return { maxAttempts: null, attemptCount: 0 }

  const attemptCountResult = await req.payload.count({
    collection: 'problem-attempts',
    where: {
      user: { equals: userId },
      problemSet: { equals: problemSetId },
      ...(lessonId ? { lesson: { equals: lessonId } } : {}),
    },
    overrideAccess: true,
  })

  return { maxAttempts, attemptCount: attemptCountResult.totalDocs }
}
