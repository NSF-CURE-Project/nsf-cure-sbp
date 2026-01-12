import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

const validateOptions = (value: unknown) => {
  if (!Array.isArray(value)) {
    return 'Add at least 3 answer choices.'
  }
  const options = value as { label?: string; isCorrect?: boolean | null }[]
  const optionCount = options.filter((option) => option?.label?.trim()).length
  if (optionCount < 3) {
    return 'Add at least 3 answer choices.'
  }
  const correctCount = options.filter((option) => option?.isCorrect).length
  if (correctCount < 1) {
    return 'Mark at least 1 correct answer.'
  }
  return true
}

export const QuizQuestions: CollectionConfig = {
  slug: 'quiz-questions',
  admin: {
    useAsTitle: 'title',
    group: 'Assessments',
    defaultColumns: ['title', 'difficulty', 'updatedAt'],
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
      name: 'prompt',
      type: 'richText',
      required: true,
    },
    {
      name: 'options',
      type: 'array',
      required: true,
      minRows: 3,
      validate: validateOptions,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'isCorrect',
          label: 'Correct answer',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'explanation',
      type: 'richText',
    },
    {
      name: 'attachments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'topic',
      type: 'text',
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
  ],
}
