import type { PayloadHandler, PayloadRequest } from 'payload'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes((req.user as { role?: string }).role ?? '')

const round = (value: number, digits = 2) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

type Stats = {
  count: number
  mean: number | null
  median: number | null
  min: number | null
  max: number | null
  range: number | null
  stdDev: number | null
}

const computeStats = (values: number[]): Stats => {
  if (values.length === 0) {
    return { count: 0, mean: null, median: null, min: null, max: null, range: null, stdDev: null }
  }
  const sorted = [...values].sort((a, b) => a - b)
  const sum = sorted.reduce((acc, v) => acc + v, 0)
  const mean = sum / sorted.length
  const mid = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const variance =
    sorted.length > 1
      ? sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (sorted.length - 1)
      : 0
  const stdDev = Math.sqrt(variance)
  return {
    count: sorted.length,
    mean: round(mean),
    median: round(median),
    min: round(min),
    max: round(max),
    range: round(max - min),
    stdDev: round(stdDev),
  }
}

export const quizStatsHandler: PayloadHandler = async (req) => {
  if (!isStaff(req)) return jsonResponse({ error: 'Unauthorized' }, 403)

  const url = new URL(req.url ?? 'http://localhost')
  const quizId = url.searchParams.get('quizId')
  if (!quizId) return jsonResponse({ error: 'quizId is required' }, 400)

  const quiz = await req.payload
    .findByID({ collection: 'quizzes', id: quizId, depth: 0, overrideAccess: true })
    .catch(() => null)
  if (!quiz) return jsonResponse({ error: 'Quiz not found' }, 404)

  const attempts = await req.payload.find({
    collection: 'quiz-attempts',
    where: { quiz: { equals: quizId } },
    depth: 1,
    limit: 1000,
    sort: '-completedAt',
    overrideAccess: true,
  })

  const docs = attempts.docs as Array<{
    id: string | number
    user?: unknown
    score?: number | null
    maxScore?: number | null
    durationSec?: number | null
    startedAt?: string | null
    completedAt?: string | null
  }>

  // Score percent uses score/maxScore so quizzes with different point totals
  // are still comparable.
  const scorePercents: number[] = []
  const rawScores: number[] = []
  const durations: number[] = []

  docs.forEach((d) => {
    if (typeof d.score === 'number' && typeof d.maxScore === 'number' && d.maxScore > 0) {
      scorePercents.push((d.score / d.maxScore) * 100)
      rawScores.push(d.score)
    }
    if (typeof d.durationSec === 'number' && Number.isFinite(d.durationSec) && d.durationSec > 0) {
      durations.push(d.durationSec)
    }
  })

  const uniqueStudentIds = new Set<string>()
  docs.forEach((d) => {
    const u = d.user
    if (u != null) {
      if (typeof u === 'object' && 'id' in (u as { id?: unknown })) {
        uniqueStudentIds.add(String((u as { id?: string | number }).id))
      } else {
        uniqueStudentIds.add(String(u))
      }
    }
  })

  return jsonResponse({
    quiz: {
      id: (quiz as { id: string | number }).id,
      title: (quiz as { title?: string }).title ?? null,
      description: (quiz as { description?: string }).description ?? null,
    },
    attemptCount: docs.length,
    uniqueStudentCount: uniqueStudentIds.size,
    scorePercent: computeStats(scorePercents),
    scoreRaw: computeStats(rawScores),
    durationSec: computeStats(durations),
    attempts: docs.slice(0, 200).map((d) => {
      const u = d.user
      const userId =
        typeof u === 'object' && u !== null && 'id' in (u as { id?: unknown })
          ? (u as { id?: string | number }).id ?? null
          : (u as string | number | null) ?? null
      const userLabel =
        typeof u === 'object' && u !== null && 'fullName' in (u as { fullName?: unknown })
          ? ((u as { fullName?: string }).fullName ?? null)
          : null
      const userEmail =
        typeof u === 'object' && u !== null && 'email' in (u as { email?: unknown })
          ? ((u as { email?: string }).email ?? null)
          : null
      const scorePercent =
        typeof d.score === 'number' && typeof d.maxScore === 'number' && d.maxScore > 0
          ? round((d.score / d.maxScore) * 100, 1)
          : null
      return {
        id: d.id,
        userId,
        userLabel,
        userEmail,
        score: d.score ?? null,
        maxScore: d.maxScore ?? null,
        scorePercent,
        durationSec: d.durationSec ?? null,
        startedAt: d.startedAt ?? null,
        completedAt: d.completedAt ?? null,
      }
    }),
  })
}
