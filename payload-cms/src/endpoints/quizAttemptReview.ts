import type { PayloadHandler } from 'payload'
import {
  getAcceptedAnswers,
  getChoiceOptions,
  getQuestionType,
  normalizeSelectedOptionIds,
} from '../lib/quiz'

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
    const match = pathname.match(/\/quiz-attempts\/([^/]+)\/review$/)
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

export const quizAttemptReviewHandler: PayloadHandler = async (req) => {
  if (!req.user) return jsonError('Unauthorized', 401)

  const attemptId = parseAttemptId(req)
  if (!attemptId) return jsonError('Invalid attempt id', 400)

  let attempt: Record<string, unknown>
  try {
    attempt = (await req.payload.findByID({
      collection: 'quiz-attempts',
      id: attemptId,
      depth: 4,
      overrideAccess: true,
    })) as unknown as Record<string, unknown>
  } catch {
    return jsonError('Quiz attempt not found', 404)
  }

  const attemptUserId = getId(attempt.user)
  const actorId = getId(req.user.id)
  const isStaff = req.user.collection === 'users'
  if (!isStaff && req.user.collection === 'accounts' && attemptUserId !== actorId) {
    return jsonError('Forbidden', 403)
  }

  const quizValue = attempt.quiz
  const quiz =
    typeof quizValue === 'object' && quizValue !== null
      ? (quizValue as { id?: string | number; title?: string; questions?: unknown[] })
      : null

  const quizId = getId(quizValue)
  const quizDoc =
    quiz ??
    ((await req.payload.findByID({
      collection: 'quizzes',
      id: quizId,
      depth: 2,
      overrideAccess: true,
    })) as { id?: string | number; title?: string; questions?: unknown[] })

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
  const quizQuestions = Array.isArray(quizDoc.questions) ? quizDoc.questions : []

  const questionById = new Map<string, Record<string, unknown>>()
  for (const rawQuestion of quizQuestions) {
    const questionId = getId(rawQuestion)
    if (!questionId) continue
    if (typeof rawQuestion === 'object' && rawQuestion !== null) {
      questionById.set(questionId, rawQuestion as Record<string, unknown>)
      continue
    }

    try {
      const fetched = (await req.payload.findByID({
        collection: 'quiz-questions',
        id: questionId,
        depth: 0,
        overrideAccess: true,
      })) as unknown as Record<string, unknown>
      questionById.set(questionId, fetched)
    } catch {
      // Ignore missing questions to keep review payload resilient.
    }
  }

  const answers = Array.isArray(attempt.answers) ? attempt.answers : []
  const questions = answers.map((entry) => {
    const answer = entry as Record<string, unknown>
    const questionId = getId(answer.question)
    const question = questionById.get(questionId) ?? {}
    const questionType = getQuestionType(question as {
      questionType?: string | null
      options?: unknown[] | null
      trueFalseAnswer?: boolean | null
    })
    const options = getChoiceOptions(question as Parameters<typeof getChoiceOptions>[0])
    const selectedOptionIds = normalizeSelectedOptionIds(answer.selectedOptionIds)

    const optionMap = new Map(
      options.map((item) => {
        const id = item.id
        const label = item.label
        const isCorrect = item.isCorrect
        return [id, { id, label, isCorrect }] as const
      }),
    )

    const selectedLabels = selectedOptionIds
      .map((id) => optionMap.get(id)?.label ?? '')
      .filter(Boolean)
    const correctLabels = [...optionMap.values()]
      .filter((option) => option.isCorrect)
      .map((option) => option.label)
      .filter(Boolean)

    const isCorrect = Boolean(answer.isCorrect)
    const score = typeof answer.score === 'number' ? answer.score : isCorrect ? 1 : 0
    const textAnswer = typeof answer.textAnswer === 'string' ? answer.textAnswer : null
    const numericAnswer =
      typeof answer.numericAnswer === 'number' ? answer.numericAnswer : null
    const acceptedAnswers = getAcceptedAnswers(question as Parameters<typeof getAcceptedAnswers>[0])
    const numericCorrectValue =
      typeof question.numericCorrectValue === 'number' ? question.numericCorrectValue : null
    const numericTolerance =
      typeof question.numericTolerance === 'number' ? question.numericTolerance : null
    const numericUnit = typeof question.numericUnit === 'string' ? question.numericUnit : null
    const responseKind =
      typeof answer.responseKind === 'string'
        ? answer.responseKind
        : questionType === 'numeric'
          ? 'numeric'
          : questionType === 'short-text'
            ? 'text'
            : 'option-selection'

    return {
      id: questionId,
      title:
        typeof question.title === 'string' && question.title.trim().length > 0
          ? question.title
          : `Question`,
      prompt: question.prompt ?? null,
      explanation: question.explanation ?? null,
      questionType,
      responseKind,
      selectedOptionIds,
      selectedLabels,
      correctLabels,
      textAnswer,
      numericAnswer,
      acceptedAnswers,
      numericCorrectValue,
      numericTolerance,
      numericUnit,
      isCorrect,
      score,
      remediationLink,
    }
  })

  const scoreValue = typeof attempt.score === 'number' ? attempt.score : 0
  const maxScore = typeof attempt.maxScore === 'number' && attempt.maxScore > 0 ? attempt.maxScore : 0
  const questionCount =
    typeof attempt.questionCount === 'number' && attempt.questionCount > 0
      ? attempt.questionCount
      : questions.length
  const correctCount =
    typeof attempt.correctCount === 'number' && attempt.correctCount >= 0
      ? attempt.correctCount
      : questions.filter((item) => item.isCorrect).length
  const scorePercent = maxScore > 0 ? (scoreValue / maxScore) * 100 : 0

  return Response.json({
    attemptId: getId(attempt.id),
    completedAt: attempt.completedAt ?? attempt.createdAt ?? null,
    quiz: {
      id: getId(quizDoc.id),
      title: typeof quizDoc.title === 'string' ? quizDoc.title : 'Quiz',
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
      questionCount,
      correctCount,
      masteryThresholdPercent: 80,
      mastered: scorePercent >= 80,
    },
    questions,
  })
}
