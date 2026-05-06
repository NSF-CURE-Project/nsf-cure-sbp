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

// Pearson r between paired arrays. Returns null if degenerate.
const pearsonCorrelation = (xs: number[], ys: number[]): number | null => {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return null
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (let i = 0; i < n; i += 1) {
    sumX += xs[i]
    sumY += ys[i]
    sumXY += xs[i] * ys[i]
    sumX2 += xs[i] ** 2
    sumY2 += ys[i] ** 2
  }
  const num = n * sumXY - sumX * sumY
  const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))
  if (!Number.isFinite(den) || den === 0) return null
  return num / den
}

export const questionStatsHandler: PayloadHandler = async (req) => {
  if (!isStaff(req)) return jsonResponse({ error: 'Unauthorized' }, 403)

  const url = new URL(req.url ?? 'http://localhost')
  const questionId = url.searchParams.get('questionId')
  if (!questionId) return jsonResponse({ error: 'questionId is required' }, 400)

  const question = await req.payload
    .findByID({ collection: 'quiz-questions', id: questionId, depth: 1, overrideAccess: true })
    .catch(() => null)
  if (!question) return jsonResponse({ error: 'Question not found' }, 404)

  // Pull all attempts with at least one answer pointing at this question.
  // Drizzle/Payload doesn't deeply filter array sub-fields, so we filter in JS
  // after fetching attempts that *might* contain it (heuristic: same quiz).
  const q = question as {
    id: string | number
    title?: string
    questionType?: string
    options?: Array<{ id?: string; label?: string; isCorrect?: boolean }>
    concepts?: unknown
    bloomLevel?: string
    difficulty?: string
  }

  // Find quizzes that reference this question, then attempts of those quizzes.
  const quizzes = await req.payload.find({
    collection: 'quizzes',
    where: { questions: { in: [String(q.id)] } },
    depth: 0,
    limit: 200,
    overrideAccess: true,
  })
  const quizIds = quizzes.docs.map((d) => (d as { id: string | number }).id)

  const attempts = quizIds.length
    ? await req.payload.find({
        collection: 'quiz-attempts',
        where: { quiz: { in: quizIds.map(String) } },
        depth: 0,
        limit: 1000,
        sort: '-completedAt',
        overrideAccess: true,
      })
    : { docs: [] }

  type AttemptDoc = {
    id: string | number
    user?: unknown
    score?: number | null
    maxScore?: number | null
    answers?: Array<{
      question?: unknown
      selectedOptionIds?: Array<{ optionId?: string }>
      textAnswer?: string | null
      numericAnswer?: number | null
      isCorrect?: boolean | null
      score?: number | null
    }>
    completedAt?: string | null
  }

  type AnswerStat = {
    attemptId: string | number
    answer: NonNullable<AttemptDoc['answers']>[number]
    overallPercent: number | null
  }

  const observations: AnswerStat[] = []

  ;(attempts.docs as AttemptDoc[]).forEach((attempt) => {
    const answers = Array.isArray(attempt.answers) ? attempt.answers : []
    const overallPercent =
      typeof attempt.score === 'number' && typeof attempt.maxScore === 'number' && attempt.maxScore > 0
        ? (attempt.score / attempt.maxScore) * 100
        : null
    answers.forEach((answer) => {
      const aQid = getId(answer.question)
      if (aQid != null && String(aQid) === String(q.id)) {
        observations.push({ attemptId: attempt.id, answer, overallPercent })
      }
    })
  })

  const total = observations.length
  const correctCount = observations.filter((o) => o.answer.isCorrect === true).length
  const pValue = total > 0 ? correctCount / total : null

  // Point-biserial correlation: x = isCorrect (0/1), y = overall quiz percent.
  const x: number[] = []
  const y: number[] = []
  observations.forEach((o) => {
    if (o.overallPercent != null) {
      x.push(o.answer.isCorrect ? 1 : 0)
      y.push(o.overallPercent)
    }
  })
  const discrimination = pearsonCorrelation(x, y)

  // Distractor analysis: for choice questions, count how often each option was selected.
  const optionTallies: Array<{
    optionId: string
    label: string
    isCorrect: boolean
    count: number
    fraction: number
  }> = []
  if (Array.isArray(q.options) && q.options.length) {
    const tally: Record<string, number> = {}
    let denom = 0
    observations.forEach((o) => {
      const sel = o.answer.selectedOptionIds
      if (Array.isArray(sel)) {
        sel.forEach((s) => {
          const id = s?.optionId
          if (id) {
            tally[id] = (tally[id] ?? 0) + 1
          }
        })
        if (sel.length > 0) denom += 1
      }
    })
    q.options.forEach((opt) => {
      const optionId = String(opt.id ?? '')
      const count = optionId ? tally[optionId] ?? 0 : 0
      optionTallies.push({
        optionId,
        label: opt.label ?? '(no label)',
        isCorrect: Boolean(opt.isCorrect),
        count,
        fraction: denom > 0 ? round(count / denom, 3) : 0,
      })
    })
  }

  const conceptsRel = q.concepts
  const conceptList: Array<{ id: string | number; name: string; slug?: string }> = Array.isArray(
    conceptsRel,
  )
    ? conceptsRel.flatMap((c) => {
        if (typeof c === 'object' && c !== null && 'id' in (c as { id?: unknown })) {
          const cd = c as { id: string | number; name?: string; slug?: string }
          return [{ id: cd.id, name: cd.name ?? '(unnamed)', slug: cd.slug }]
        }
        return []
      })
    : []

  const recentAttempts = observations.slice(0, 100).map((o) => ({
    attemptId: o.attemptId,
    isCorrect: o.answer.isCorrect ?? null,
    score: o.answer.score ?? null,
    overallPercent: o.overallPercent != null ? round(o.overallPercent, 1) : null,
    selectedOptionIds: Array.isArray(o.answer.selectedOptionIds)
      ? o.answer.selectedOptionIds.map((s) => s?.optionId).filter(Boolean)
      : [],
    textAnswer: o.answer.textAnswer ?? null,
    numericAnswer: o.answer.numericAnswer ?? null,
  }))

  return jsonResponse({
    question: {
      id: q.id,
      title: q.title ?? null,
      questionType: q.questionType ?? null,
      difficulty: q.difficulty ?? null,
      bloomLevel: q.bloomLevel ?? null,
      concepts: conceptList,
    },
    quizCount: quizIds.length,
    attemptCount: total,
    correctCount,
    pValue: pValue != null ? round(pValue, 3) : null,
    discrimination: discrimination != null ? round(discrimination, 3) : null,
    distractors: optionTallies,
    recentAttempts,
  })
}
