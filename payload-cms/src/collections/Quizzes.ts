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

type QuestionOption = { label?: string | null; isCorrect?: boolean | null }

const isQuestionOption = (value: unknown): value is QuestionOption =>
  typeof value === 'object' && value !== null && ('label' in value || 'isCorrect' in value)

const getQuestionIssues = (question: { options?: unknown[] | null }) => {
  const options = Array.isArray(question.options) ? question.options.filter(isQuestionOption) : []
  const optionCount = options.filter((option) => option?.label?.trim()).length
  const correctCount = options.filter((option) => option?.isCorrect).length
  const issues: string[] = []
  if (optionCount < 3) issues.push('needs 3+ options')
  if (correctCount < 1) issues.push('needs a correct answer')
  return issues
}

export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: {
    useAsTitle: 'title',
    group: 'Assessments',
    defaultColumns: ['title', 'updatedAt'],
    preview: ({ data }) => {
      const quizId =
        typeof data === 'object' && data && 'id' in data ? String((data as { id?: string | number }).id ?? '') : ''
      const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
      const secret = process.env.PREVIEW_SECRET ?? ''
      const search = new URLSearchParams({
        secret,
        type: 'quiz',
        slug: quizId,
      })
      return `${base}/api/preview?${search.toString()}`
    },
    livePreview: {
      url: ({ data }) => {
        const quizId =
          typeof data === 'object' && data && 'id' in data ? String((data as { id?: string | number }).id ?? '') : ''
        const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
        const secret = process.env.PREVIEW_SECRET ?? ''
        const search = new URLSearchParams({
          secret,
          type: 'quiz',
          slug: quizId,
        })
        return `${base}/api/preview?${search.toString()}`
      },
    },
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: ({ req }) => isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isStaff(req),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'course',
      label: 'Course',
      type: 'relationship',
      relationTo: 'classes',
      admin: {
        description: 'Optional. Used for filtering in the Quiz Bank.',
      },
    },
    {
      name: 'chapter',
      label: 'Chapter',
      type: 'relationship',
      relationTo: 'chapters',
      admin: {
        description: 'Optional. Used for filtering in the Quiz Bank.',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Intro', value: 'intro' },
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
    },
    {
      name: 'questions',
      type: 'relationship',
      relationTo: 'quiz-questions',
      hasMany: true,
      required: true,
      validate: async (value, { req, data }) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Select at least one question.'
        }
        const status = (data as { _status?: string | null })?._status
        if (status !== 'published') return true
        if (!req?.payload) return true
        const ids = value
          .map((item) => getId(item))
          .filter((id): id is string => Boolean(id))
        if (!ids.length) return 'Select at least one question.'
        const result = await req.payload.find({
          collection: 'quiz-questions',
          where: {
            id: { in: ids },
          },
          depth: 0,
          limit: ids.length,
        })
        const invalid = result.docs
          .map((doc) => {
            const title = (doc as { title?: string | null }).title ?? 'Untitled question'
            const issues = getQuestionIssues(doc as { options?: unknown[] })
            return { title, issues }
          })
          .filter((item) => item.issues.length > 0)
        if (invalid.length) {
          return `Fix questions before publishing: ${invalid
            .map((item) => `${item.title} (${item.issues.join(', ')})`)
            .join('; ')}`
        }
        return true
      },
      admin: {
        components: {
          Field: '@/views/QuizQuestionPickerField#default',
        },
        description: 'Add questions from the bank or create new ones.',
      },
    },
    {
      name: 'quizPreview',
      type: 'ui',
      admin: {
        components: {
          Field: '@/views/QuizPreviewField#default',
        },
      },
    },
    {
      name: 'shuffleQuestions',
      label: 'Shuffle questions',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'shuffleOptions',
      label: 'Shuffle answer choices',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'scoring',
      type: 'select',
      defaultValue: 'per-question',
      options: [
        { label: 'Per-question', value: 'per-question' },
        { label: 'All-or-nothing', value: 'all-or-nothing' },
        { label: 'Partial (multi-select)', value: 'partial' },
      ],
    },
    {
      name: 'timeLimitSec',
      label: 'Time limit (seconds)',
      type: 'number',
      min: 0,
    },
  ],
}
