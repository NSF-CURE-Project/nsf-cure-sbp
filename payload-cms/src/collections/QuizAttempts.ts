import type { CollectionConfig, PayloadRequest } from 'payload'
import { getId, gradeQuizAnswer } from '../lib/quiz'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

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

        const questionMap = new Map<string, Record<string, unknown>>()

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
          questionMap.set(questionId, questionDoc as Record<string, unknown>)
        }

        const answers = Array.isArray(data.answers) ? data.answers : []
        let totalScore = 0
        let correctCount = 0

        const normalizedAnswers = answers.map((answer) => {
          const questionId = getId((answer as { question?: unknown }).question)
          if (!questionId) return answer

          const questionInfo = questionMap.get(questionId) ?? {}
          const graded = gradeQuizAnswer(
            questionInfo,
            {
              selectedOptionIds: (answer as { selectedOptionIds?: unknown }).selectedOptionIds,
              textAnswer: (answer as { textAnswer?: unknown }).textAnswer,
              numericAnswer: (answer as { numericAnswer?: unknown }).numericAnswer,
            },
            scoring,
          )
          const isCorrect = graded.isCorrect
          totalScore += graded.score
          if (isCorrect) correctCount += 1

          return {
            ...answer,
            responseKind: graded.responseKind,
            textAnswer: graded.textAnswer,
            numericAnswer: graded.numericAnswer,
            normalizedAnswer: graded.normalizedAnswer,
            isCorrect,
            score: Number(graded.score.toFixed(2)),
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
          name: 'responseKind',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'textAnswer',
          type: 'text',
        },
        {
          name: 'numericAnswer',
          type: 'number',
        },
        {
          name: 'normalizedAnswer',
          type: 'text',
          admin: {
            readOnly: true,
          },
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
