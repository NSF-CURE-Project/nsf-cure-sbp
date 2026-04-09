import type { PayloadHandler } from 'payload'

const jsonError = (error: string, status: number) =>
  Response.json(
    {
      error,
    },
    { status },
  )

const getId = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id != null ? String(id) : ''
  }
  return ''
}

const parseAttemptId = (req: Parameters<PayloadHandler>[0]): string => {
  const routeParams = (req as { routeParams?: Record<string, unknown> }).routeParams
  const routeValue = routeParams?.attemptId
  if (typeof routeValue === 'string' || typeof routeValue === 'number') return String(routeValue)

  const rawUrl = typeof req.url === 'string' ? req.url : ''
  if (!rawUrl) return ''

  try {
    const pathname = new URL(rawUrl, 'http://localhost').pathname
    const match = pathname.match(/\/problem-attempts\/([^/]+)\/review$/)
    return match?.[1] ? decodeURIComponent(match[1]) : ''
  } catch {
    return ''
  }
}

const buildRemediationLink = (lesson: {
  slug?: string
  chapter?: { slug?: string; class?: { slug?: string } } | string | number
}): string | null => {
  const lessonSlug = typeof lesson.slug === 'string' ? lesson.slug : ''
  const chapterValue = lesson.chapter
  const chapter =
    typeof chapterValue === 'object' && chapterValue !== null
      ? (chapterValue as { slug?: string; class?: { slug?: string } | string | number })
      : null
  const chapterSlug = chapter?.slug ?? ''
  const classValue = chapter?.class
  const classSlug =
    typeof classValue === 'object' && classValue !== null && 'slug' in classValue
      ? ((classValue as { slug?: string }).slug ?? '')
      : ''

  if (classSlug && lessonSlug) return `/classes/${classSlug}/lessons/${lessonSlug}`
  if (classSlug && chapterSlug) return `/classes/${classSlug}/chapters/${chapterSlug}`
  return null
}

export const problemAttemptReviewHandler: PayloadHandler = async (req) => {
  if (!req.user) return jsonError('Unauthorized', 401)

  const attemptId = parseAttemptId(req)
  if (!attemptId) return jsonError('Invalid attempt id', 400)

  let attempt: Record<string, unknown>
  try {
    attempt = (await req.payload.findByID({
      collection: 'problem-attempts',
      id: attemptId,
      depth: 3,
      overrideAccess: true,
    })) as unknown as Record<string, unknown>
  } catch {
    return jsonError('Problem attempt not found', 404)
  }

  const attemptUserId = getId(attempt.user)
  const actorId = getId(req.user.id)
  const staffRole = req.user.collection === 'users' && ['admin', 'staff', 'professor'].includes(req.user.role ?? '')
  const accountOwner = req.user.collection === 'accounts' && attemptUserId === actorId
  if (!staffRole && !accountOwner) {
    return jsonError('Forbidden', 403)
  }

  const problemSetValue = attempt.problemSet
  const problemSet =
    typeof problemSetValue === 'object' && problemSetValue !== null
      ? (problemSetValue as { id?: string | number; title?: string })
      : null

  const problemSetId = getId(problemSetValue)
  const problemSetDoc =
    problemSet ??
    ((await req.payload.findByID({
      collection: 'problem-sets',
      id: problemSetId,
      depth: 0,
      overrideAccess: true,
    })) as { id?: string | number; title?: string })

  const lessonValue = attempt.lesson
  const lesson =
    typeof lessonValue === 'object' && lessonValue !== null
      ? (lessonValue as {
          id?: string | number
          title?: string
          slug?: string
          chapter?: { slug?: string; class?: { slug?: string } } | string | number
        })
      : null

  const lessonId = getId(lessonValue)
  const lessonDoc =
    lesson ??
    (lessonId
      ? ((await req.payload.findByID({
          collection: 'lessons',
          id: lessonId,
          depth: 2,
          overrideAccess: true,
        })) as {
          id?: string | number
          title?: string
          slug?: string
          chapter?: { slug?: string; class?: { slug?: string } } | string | number
        })
      : null)

  const remediationLink = lessonDoc ? buildRemediationLink(lessonDoc) : null

  const attemptAnswers = Array.isArray(attempt.answers) ? attempt.answers : []
  const problemIds = attemptAnswers
    .map((entry) => getId((entry as { problem?: unknown }).problem))
    .filter(Boolean)

  const problemById = new Map<string, Record<string, unknown>>()
  for (const problemId of problemIds) {
    const fromAttempt = attemptAnswers.find((entry) => {
      const answerProblem = (entry as { problem?: unknown }).problem
      return typeof answerProblem === 'object' && answerProblem !== null && getId(answerProblem) === problemId
    }) as { problem?: unknown } | undefined

    if (fromAttempt?.problem && typeof fromAttempt.problem === 'object') {
      problemById.set(problemId, fromAttempt.problem as Record<string, unknown>)
      continue
    }

    try {
      const fetched = (await req.payload.findByID({
        collection: 'problems',
        id: problemId,
        depth: 1,
        overrideAccess: true,
      })) as unknown as Record<string, unknown>
      problemById.set(problemId, fetched)
    } catch {
      // Keep payload resilient even if individual problem docs are unavailable.
    }
  }

  const problems = attemptAnswers.map((entry, answerIndex) => {
    const answer = entry as Record<string, unknown>
    const problemId = getId(answer.problem)
    const problem = problemById.get(problemId) ?? {}
    const problemParts = Array.isArray(problem.parts) ? problem.parts : []
    const answerParts = Array.isArray(answer.parts) ? answer.parts : []

    const parts = answerParts.map((partEntry) => {
      const part = partEntry as Record<string, unknown>
      const partIndex =
        typeof part.partIndex === 'number' && Number.isFinite(part.partIndex)
          ? part.partIndex
          : 0
      const problemPart =
        typeof problemParts[partIndex] === 'object' && problemParts[partIndex] !== null
          ? (problemParts[partIndex] as Record<string, unknown>)
          : {}

      return {
        partIndex,
        partType:
          typeof problemPart.partType === 'string' ? problemPart.partType : 'numeric',
        studentAnswer:
          typeof part.studentAnswer === 'number' && Number.isFinite(part.studentAnswer)
            ? part.studentAnswer
            : null,
        studentExpression:
          typeof part.studentExpression === 'string' ? part.studentExpression : null,
        placedForces:
          typeof part.placedForces === 'object' && part.placedForces !== null
            ? (part.placedForces as Record<string, unknown>)
            : null,
        isCorrect: Boolean(part.isCorrect),
        score:
          typeof part.score === 'number' && Number.isFinite(part.score)
            ? part.score
            : 0,
        correctAnswer:
          typeof problemPart.correctAnswer === 'number' &&
          Number.isFinite(problemPart.correctAnswer)
            ? problemPart.correctAnswer
            : typeof problemPart.symbolicAnswer === 'string'
              ? problemPart.symbolicAnswer
              : null,
        unit: typeof problemPart.unit === 'string' ? problemPart.unit : null,
        explanation: problemPart.explanation ?? null,
      }
    })

    return {
      id: problemId || String(answerIndex),
      title:
        typeof problem.title === 'string' && problem.title.trim()
          ? problem.title
          : `Problem ${answerIndex + 1}`,
      prompt: problem.prompt ?? null,
      figure:
        typeof problem.figure === 'object' && problem.figure !== null ? problem.figure : null,
      parts,
    }
  })

  const scoreValue =
    typeof attempt.score === 'number' && Number.isFinite(attempt.score) ? attempt.score : 0
  const maxScore =
    typeof attempt.maxScore === 'number' && Number.isFinite(attempt.maxScore) && attempt.maxScore > 0
      ? attempt.maxScore
      : 0
  const scorePercent = maxScore > 0 ? (scoreValue / maxScore) * 100 : 0
  const problemCount = problems.length
  const correctCount =
    typeof attempt.correctCount === 'number' && Number.isFinite(attempt.correctCount)
      ? attempt.correctCount
      : problems.reduce(
          (sum, problem) => sum + problem.parts.filter((part) => part.isCorrect).length,
          0,
        )

  return Response.json({
    attemptId: getId(attempt.id),
    completedAt: attempt.completedAt ?? attempt.createdAt ?? null,
    problemSet: {
      id: getId(problemSetDoc.id),
      title: typeof problemSetDoc.title === 'string' ? problemSetDoc.title : 'Problem Set',
    },
    lesson: lessonDoc
      ? {
          id: getId(lessonDoc.id),
          title: typeof lessonDoc.title === 'string' ? lessonDoc.title : null,
          remediationLink,
        }
      : null,
    summary: {
      score: scoreValue,
      maxScore,
      scorePercent: Number(scorePercent.toFixed(1)),
      problemCount,
      correctCount,
      mastered: scorePercent >= 80,
    },
    problems,
  })
}
