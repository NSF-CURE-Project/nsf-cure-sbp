import type { PayloadRequest } from 'payload'

type RateBucket = {
  timestamps: number[]
}

const RATE_WINDOW_MS = Number(process.env.PROBLEM_ATTEMPT_RATE_WINDOW_MS ?? 60_000)
const RATE_MAX_SUBMISSIONS = Number(process.env.PROBLEM_ATTEMPT_RATE_MAX ?? 20)
const rateBuckets = new Map<string, RateBucket>()

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

export const isProblemAttemptRateLimited = (
  req: PayloadRequest,
  now = Date.now(),
): { blocked: boolean; retryAfterSec: number } => {
  const key = getRateLimitKey(req)
  const bucket = rateBuckets.get(key) ?? { timestamps: [] }
  const minTime = now - RATE_WINDOW_MS
  bucket.timestamps = bucket.timestamps.filter((ts) => ts >= minTime)

  if (bucket.timestamps.length >= RATE_MAX_SUBMISSIONS) {
    const oldestInWindow = bucket.timestamps[0] ?? now
    const retryAfterMs = Math.max(1_000, oldestInWindow + RATE_WINDOW_MS - now)
    rateBuckets.set(key, bucket)
    return { blocked: true, retryAfterSec: Math.ceil(retryAfterMs / 1_000) }
  }

  bucket.timestamps.push(now)
  rateBuckets.set(key, bucket)
  return { blocked: false, retryAfterSec: 0 }
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
