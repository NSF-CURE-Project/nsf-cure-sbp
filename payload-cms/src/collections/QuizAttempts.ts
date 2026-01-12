import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

const getId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id?: string | number }).id ?? '')
  }
  return null
}

const normalizeOptionIds = (value?: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null && 'optionId' in item) {
        return String((item as { optionId?: string }).optionId ?? '')
      }
      return ''
    })
    .filter(Boolean)
}

const clampScore = (value: number) => Math.max(0, Math.min(1, value))

export const QuizAttempts: CollectionConfig = {
  slug: 'quiz-attempts',
  admin: {
    useAsTitle: 'quiz',
    group: 'Student Support',
    defaultColumns: ['quiz', 'user', 'score', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'accounts') {
        return { user: { equals: req.user.id } }
      }
      return false
    },
    create: ({ req }) => req.user?.collection === 'accounts' || isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isStaff(req),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data || !req?.payload) return data

        if (!data.user && req.user?.collection === 'accounts' && req.user?.id) {
          data.user = req.user.id
        }

        const quizId = getId(data.quiz ?? originalDoc?.quiz)
        if (!quizId) return data

        const quiz = await req.payload.findByID({
          collection: 'quizzes',
          id: quizId,
          depth: 2,
        })

        const scoring = (quiz as { scoring?: string | null }).scoring ?? 'per-question'
        const quizQuestions = Array.isArray((quiz as { questions?: unknown[] }).questions)
          ? ((quiz as { questions?: unknown[] }).questions ?? [])
          : []

        const questionMap = new Map<
          string,
          {
            correctOptionIds: string[]
            optionIds: string[]
          }
        >()

        for (const item of quizQuestions) {
          const questionId = getId(item)
          if (!questionId) continue

          const questionDoc =
            typeof item === 'object' && item !== null
              ? item
              : await req.payload.findByID({
                  collection: 'quiz-questions',
                  id: questionId,
                  depth: 0,
                })

          if (!questionDoc) continue
          const options = Array.isArray((questionDoc as { options?: unknown[] }).options)
            ? ((questionDoc as { options?: unknown[] }).options ?? [])
            : []
          const optionIds = options
            .map((opt) => getId(opt))
            .filter((id): id is string => Boolean(id))
          const correctOptionIds = options
            .filter((opt) => (opt as { isCorrect?: boolean }).isCorrect)
            .map((opt) => getId(opt))
            .filter((id): id is string => Boolean(id))
          questionMap.set(questionId, { correctOptionIds, optionIds })
        }

        const answers = Array.isArray(data.answers) ? data.answers : []
        let totalScore = 0
        let correctCount = 0

        const normalizedAnswers = answers.map((answer) => {
          const questionId = getId((answer as { question?: unknown }).question)
          if (!questionId) return answer

          const questionInfo = questionMap.get(questionId)
          const correctIds = questionInfo?.correctOptionIds ?? []
          const selectedIds = normalizeOptionIds(
            (answer as { selectedOptionIds?: unknown }).selectedOptionIds,
          )
          const selectedSet = new Set(selectedIds)
          const correctSet = new Set(correctIds)

          const exactMatch =
            correctIds.length > 0 &&
            correctIds.length === selectedSet.size &&
            correctIds.every((id) => selectedSet.has(id))

          let score = 0
          if (scoring === 'partial') {
            if (correctIds.length > 0) {
              const correctSelected = selectedIds.filter((id) => correctSet.has(id)).length
              const incorrectSelected = selectedIds.filter((id) => !correctSet.has(id)).length
              score = clampScore((correctSelected - incorrectSelected) / correctIds.length)
            }
          } else {
            score = exactMatch ? 1 : 0
          }

          const isCorrect = score === 1
          totalScore += score
          if (isCorrect) correctCount += 1

          return {
            ...answer,
            isCorrect,
            score: Number(score.toFixed(2)),
          }
        })

        data.answers = normalizedAnswers
        const questionCount = questionMap.size || normalizedAnswers.length
        data.questionCount = questionCount
        data.correctCount = correctCount
        data.maxScore = questionCount
        data.score = Number(totalScore.toFixed(2))

        if (operation === 'create') {
          if (!data.completedAt) {
            data.completedAt = new Date().toISOString()
          }
          if (!data.startedAt) {
            data.startedAt = data.completedAt
          }
        }

        if (data.startedAt && data.completedAt && !data.durationSec) {
          const started = new Date(data.startedAt).getTime()
          const completed = new Date(data.completedAt).getTime()
          if (!Number.isNaN(started) && !Number.isNaN(completed)) {
            data.durationSec = Math.max(0, Math.round((completed - started) / 1000))
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'accounts',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'startedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'durationSec',
      type: 'number',
    },
    {
      name: 'questionOrder',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'relationship',
          relationTo: 'quiz-questions',
          required: true,
        },
      ],
    },
    {
      name: 'answers',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'relationship',
          relationTo: 'quiz-questions',
          required: true,
        },
        {
          name: 'selectedOptionIds',
          type: 'array',
          fields: [
            {
              name: 'optionId',
              type: 'text',
            },
          ],
        },
        {
          name: 'optionOrder',
          type: 'array',
          fields: [
            {
              name: 'optionId',
              type: 'text',
            },
          ],
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'score',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'score',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'maxScore',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'correctCount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'questionCount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
