import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: {
    useAsTitle: 'title',
    group: 'Assessments',
    defaultColumns: ['title', 'updatedAt'],
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
      name: 'questions',
      type: 'relationship',
      relationTo: 'quiz-questions',
      hasMany: true,
      required: true,
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
