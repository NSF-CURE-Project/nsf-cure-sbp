import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

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
      minRows: 2,
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
