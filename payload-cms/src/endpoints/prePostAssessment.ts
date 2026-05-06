import type { PayloadHandler, PayloadRequest } from 'payload'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes((req.user as { role?: string }).role ?? '')

const round = (value: number, digits = 3) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

const getId = (value: unknown): string | number | null => {
  if (value == null) return null
  if (typeof value === 'object' && 'id' in (value as { id?: unknown })) {
    return ((value as { id?: string | number }).id ?? null) as string | number | null
  }
  return value as string | number | null
}

const stats = (values: number[]) => {
  if (values.length === 0) {
    return { count: 0, mean: null as number | null, median: null as number | null, stdDev: null as number | null }
  }
  const sorted = [...values].sort((a, b) => a - b)
  const sum = sorted.reduce((acc, v) => acc + v, 0)
  const mean = sum / sorted.length
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  const variance =
    sorted.length > 1
      ? sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (sorted.length - 1)
      : 0
  return {
    count: sorted.length,
    mean: round(mean),
    median: round(median),
    stdDev: round(Math.sqrt(variance)),
  }
}

// List endpoint: lightweight summary for the index page.
export const prePostListHandler: PayloadHandler = async (req) => {
  if (!isStaff(req)) return jsonResponse({ error: 'Unauthorized' }, 403)

  const list = await req.payload.find({
    collection: 'pre-post-assessments',
    depth: 1,
    limit: 200,
    sort: '-updatedAt',
    overrideAccess: true,
  })

  return jsonResponse({
    items: (list.docs as Array<{
      id: string | number
      title?: string
      preQuiz?: unknown
      postQuiz?: unknown
      classroom?: unknown
      updatedAt?: string
    }>).map((d) => {
      const preTitle =
        typeof d.preQuiz === 'object' && d.preQuiz !== null && 'title' in (d.preQuiz as { title?: unknown })
          ? ((d.preQuiz as { title?: string }).title ?? null)
          : null
      const postTitle =
        typeof d.postQuiz === 'object' && d.postQuiz !== null && 'title' in (d.postQuiz as { title?: unknown })
          ? ((d.postQuiz as { title?: string }).title ?? null)
          : null
      const classroomTitle =
        typeof d.classroom === 'object' && d.classroom !== null && 'title' in (d.classroom as { title?: unknown })
          ? ((d.classroom as { title?: string }).title ?? null)
          : null
      return {
        id: d.id,
        title: d.title ?? '(untitled)',
        preTitle,
        postTitle,
        classroomTitle,
        updatedAt: d.updatedAt ?? null,
      }
    }),
  })
}

export const prePostDetailHandler: PayloadHandler = async (req) => {
  if (!isStaff(req)) return jsonResponse({ error: 'Unauthorized' }, 403)

  const url = new URL(req.url ?? 'http://localhost')
  const id = url.searchParams.get('id')
  if (!id) return jsonResponse({ error: 'id is required' }, 400)

  const doc = await req.payload
    .findByID({ collection: 'pre-post-assessments', id, depth: 1, overrideAccess: true })
    .catch(() => null)
  if (!doc) return jsonResponse({ error: 'Pre/post pair not found' }, 404)

  const d = doc as {
    id: string | number
    title?: string
    description?: string
    preQuiz?: unknown
    postQuiz?: unknown
    classroom?: unknown
  }

  const preQuizId = getId(d.preQuiz)
  const postQuizId = getId(d.postQuiz)
  const classroomId = getId(d.classroom)
  if (preQuizId == null || postQuizId == null) {
    return jsonResponse({ error: 'preQuiz and postQuiz must be set' }, 400)
  }

  // If a classroom is set, scope to its members.
  let scopedAccountIds: Set<string> | null = null
  if (classroomId != null) {
    const memberships = await req.payload.find({
      collection: 'classroom-memberships',
      where: { classroom: { equals: String(classroomId) } },
      depth: 0,
      limit: 1000,
      overrideAccess: true,
    })
    scopedAccountIds = new Set(
      (memberships.docs as Array<{ student?: unknown }>)
        .map((m) => getId(m.student))
        .filter((x): x is string | number => x != null)
        .map(String),
    )
  }

  // Fetch ALL attempts for the two quizzes, then pair best (earliest pre, latest post) per student.
  const [pre, post] = await Promise.all([
    req.payload.find({
      collection: 'quiz-attempts',
      where: { quiz: { equals: String(preQuizId) } },
      depth: 0,
      limit: 5000,
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'quiz-attempts',
      where: { quiz: { equals: String(postQuizId) } },
      depth: 0,
      limit: 5000,
      overrideAccess: true,
    }),
  ])

  type Attempt = {
    id: string | number
    user?: unknown
    score?: number | null
    maxScore?: number | null
    durationSec?: number | null
    completedAt?: string | null
    startedAt?: string | null
  }

  const percent = (a: Attempt) =>
    typeof a.score === 'number' && typeof a.maxScore === 'number' && a.maxScore > 0
      ? (a.score / a.maxScore) * 100
      : null

  // Earliest pre per student, latest post per student.
  const preByStudent = new Map<string, { attempt: Attempt; pct: number }>()
  ;(pre.docs as Attempt[]).forEach((a) => {
    const sid = getId(a.user)
    if (sid == null) return
    if (scopedAccountIds && !scopedAccountIds.has(String(sid))) return
    const pct = percent(a)
    if (pct == null) return
    const existing = preByStudent.get(String(sid))
    const aTs = a.completedAt ? new Date(a.completedAt).getTime() : Number.MAX_SAFE_INTEGER
    const eTs = existing?.attempt.completedAt
      ? new Date(existing.attempt.completedAt).getTime()
      : Number.MAX_SAFE_INTEGER
    if (!existing || aTs < eTs) preByStudent.set(String(sid), { attempt: a, pct })
  })

  const postByStudent = new Map<string, { attempt: Attempt; pct: number }>()
  ;(post.docs as Attempt[]).forEach((a) => {
    const sid = getId(a.user)
    if (sid == null) return
    if (scopedAccountIds && !scopedAccountIds.has(String(sid))) return
    const pct = percent(a)
    if (pct == null) return
    const existing = postByStudent.get(String(sid))
    const aTs = a.completedAt ? new Date(a.completedAt).getTime() : 0
    const eTs = existing?.attempt.completedAt ? new Date(existing.attempt.completedAt).getTime() : 0
    if (!existing || aTs > eTs) postByStudent.set(String(sid), { attempt: a, pct })
  })

  // Pair students who have both a pre and post.
  const pairs: Array<{
    studentId: string
    pre: number
    post: number
    delta: number
    normalizedGain: number | null
  }> = []
  preByStudent.forEach((preEntry, sid) => {
    const postEntry = postByStudent.get(sid)
    if (!postEntry) return
    const preP = preEntry.pct
    const postP = postEntry.pct
    const delta = postP - preP
    // Hake's normalized gain: (post - pre) / (100 - pre). Undefined when pre = 100.
    const normalizedGain = preP < 100 ? (postP - preP) / (100 - preP) : null
    pairs.push({ studentId: sid, pre: preP, post: postP, delta, normalizedGain })
  })

  // Hydrate student names for the matched pairs only (cheap when classroom-scoped).
  const studentNames = new Map<string, { fullName: string | null; email: string | null }>()
  if (pairs.length > 0) {
    const accounts = await req.payload.find({
      collection: 'accounts',
      where: { id: { in: pairs.map((p) => p.studentId) } },
      depth: 0,
      limit: pairs.length,
      overrideAccess: true,
    })
    ;(accounts.docs as Array<{ id: string | number; fullName?: string; email?: string }>).forEach((a) => {
      studentNames.set(String(a.id), {
        fullName: a.fullName ?? null,
        email: a.email ?? null,
      })
    })
  }

  const preStats = stats(pairs.map((p) => p.pre))
  const postStats = stats(pairs.map((p) => p.post))
  const deltaStats = stats(pairs.map((p) => p.delta))
  const gainValues = pairs.map((p) => p.normalizedGain).filter((g): g is number => g != null && Number.isFinite(g))
  const gainStats = stats(gainValues)

  // Cohen's d for paired samples (effect size of post-pre).
  const sd = deltaStats.stdDev ?? 0
  const cohensD = sd > 0 && deltaStats.mean != null ? round(deltaStats.mean / sd) : null

  return jsonResponse({
    pair: {
      id: d.id,
      title: d.title ?? '',
      description: d.description ?? null,
      preQuizId,
      postQuizId,
      classroomId,
    },
    summary: {
      preCount: preByStudent.size,
      postCount: postByStudent.size,
      matchedCount: pairs.length,
      preStats,
      postStats,
      deltaStats,
      normalizedGain: gainStats,
      cohensD,
    },
    pairs: pairs
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 200)
      .map((p) => {
        const named = studentNames.get(p.studentId)
        return {
          studentId: p.studentId,
          fullName: named?.fullName ?? null,
          email: named?.email ?? null,
          pre: round(p.pre, 1),
          post: round(p.post, 1),
          delta: round(p.delta, 1),
          normalizedGain: p.normalizedGain == null ? null : round(p.normalizedGain),
        }
      }),
  })
}
