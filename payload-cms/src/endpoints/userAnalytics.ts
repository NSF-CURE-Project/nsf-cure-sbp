import type { PayloadHandler, PayloadRequest, Where } from 'payload'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes((req.user as { role?: string }).role ?? '')

const sumDuration = (docs: Array<{ durationSec?: number | null }>) =>
  docs.reduce((sum, doc) => {
    const d = doc.durationSec
    return sum + (typeof d === 'number' && Number.isFinite(d) && d > 0 ? d : 0)
  }, 0)

const getId = (value: unknown): string | number | null => {
  if (value == null) return null
  if (typeof value === 'object' && 'id' in (value as { id?: unknown })) {
    return ((value as { id?: string | number }).id ?? null) as string | number | null
  }
  return value as string | number | null
}

// Lightweight student list for the picker. Only returns non-sensitive fields.
export const userAnalyticsListHandler: PayloadHandler = async (req) => {
  if (!req?.user) return jsonResponse({ error: 'Unauthorized' }, 401)
  if (!isStaff(req)) return jsonResponse({ error: 'Forbidden' }, 403)

  const url = new URL(req.url ?? 'http://localhost')
  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 200), 500)

  const where: Where | undefined = search
    ? {
        or: [
          { email: { like: search } } as Where,
          { fullName: { like: search } } as Where,
        ],
      }
    : undefined

  const result = await req.payload.find({
    collection: 'accounts',
    where,
    depth: 0,
    limit,
    sort: 'fullName',
    overrideAccess: true,
  })

  return jsonResponse({
    students: result.docs.map((doc) => {
      const d = doc as {
        id: string | number
        email?: string
        fullName?: string | null
        loginCount?: number | null
        lastLoginAt?: string | null
        lastSeenAt?: string | null
        totalActiveSeconds?: number | null
        currentStreak?: number | null
      }
      return {
        id: d.id,
        email: d.email ?? '',
        fullName: d.fullName ?? null,
        loginCount: d.loginCount ?? 0,
        lastLoginAt: d.lastLoginAt ?? null,
        lastSeenAt: d.lastSeenAt ?? null,
        totalActiveSeconds: d.totalActiveSeconds ?? 0,
        currentStreak: d.currentStreak ?? 0,
      }
    }),
    totalDocs: result.totalDocs,
  })
}

export const userAnalyticsDetailHandler: PayloadHandler = async (req) => {
  if (!req?.user) return jsonResponse({ error: 'Unauthorized' }, 401)
  if (!isStaff(req)) return jsonResponse({ error: 'Forbidden' }, 403)

  const url = new URL(req.url ?? 'http://localhost')
  const userId = url.searchParams.get('userId')
  if (!userId) return jsonResponse({ error: 'userId is required' }, 400)

  const account = await req.payload
    .findByID({ collection: 'accounts', id: userId, depth: 1, overrideAccess: true })
    .catch(() => null)
  if (!account) return jsonResponse({ error: 'Account not found' }, 404)

  const [quizAttempts, lessonProgress] = await Promise.all([
    req.payload.find({
      collection: 'quiz-attempts',
      where: { user: { equals: userId } },
      depth: 1,
      limit: 500,
      sort: '-completedAt',
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'lesson-progress',
      where: { user: { equals: userId } },
      depth: 1,
      limit: 1000,
      overrideAccess: true,
    }),
  ])

  const quizDocs = quizAttempts.docs as Array<{
    id: string | number
    quiz?: unknown
    score?: number | null
    maxScore?: number | null
    durationSec?: number | null
    startedAt?: string | null
    completedAt?: string | null
  }>
  const lessonDocs = lessonProgress.docs as Array<{
    id: string | number
    lesson?: unknown
    completed?: boolean
    completedAt?: string | null
  }>

  const a = account as {
    id: string | number
    email?: string
    fullName?: string | null
    loginCount?: number | null
    lastLoginAt?: string | null
    lastSeenAt?: string | null
    totalActiveSeconds?: number | null
    currentStreak?: number | null
    longestStreak?: number | null
    createdAt?: string
    organization?: unknown
    organizationName?: string | null
  }

  const orgRel = a.organization
  const organizationLabel =
    typeof orgRel === 'object' && orgRel !== null && 'name' in (orgRel as { name?: unknown })
      ? ((orgRel as { name?: string }).name ?? null)
      : a.organizationName ?? null

  const totalQuizScore = quizDocs.reduce((sum, d) => sum + (typeof d.score === 'number' ? d.score : 0), 0)
  const totalQuizMax = quizDocs.reduce((sum, d) => sum + (typeof d.maxScore === 'number' ? d.maxScore : 0), 0)

  return jsonResponse({
    account: {
      id: a.id,
      email: a.email ?? '',
      fullName: a.fullName ?? null,
      organizationLabel,
      createdAt: a.createdAt ?? null,
      loginCount: a.loginCount ?? 0,
      lastLoginAt: a.lastLoginAt ?? null,
      lastSeenAt: a.lastSeenAt ?? null,
      totalActiveSeconds: a.totalActiveSeconds ?? 0,
      currentStreak: a.currentStreak ?? 0,
      longestStreak: a.longestStreak ?? 0,
    },
    totals: {
      quizAttemptCount: quizDocs.length,
      quizDurationSec: sumDuration(quizDocs),
      quizAveragePercent:
        totalQuizMax > 0 ? Number(((totalQuizScore / totalQuizMax) * 100).toFixed(1)) : null,
      lessonsCompleted: lessonDocs.filter((d) => Boolean(d.completed)).length,
      lessonsTouched: lessonDocs.length,
    },
    quizAttempts: quizDocs.slice(0, 100).map((d) => ({
      id: d.id,
      quizId: getId(d.quiz),
      quizTitle:
        typeof d.quiz === 'object' && d.quiz !== null && 'title' in (d.quiz as { title?: unknown })
          ? (d.quiz as { title?: string }).title ?? null
          : null,
      score: d.score ?? null,
      maxScore: d.maxScore ?? null,
      durationSec: d.durationSec ?? null,
      startedAt: d.startedAt ?? null,
      completedAt: d.completedAt ?? null,
    })),
  })
}
