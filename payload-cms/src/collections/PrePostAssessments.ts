import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes((req.user as { role?: string }).role ?? '')

export const PrePostAssessments: CollectionConfig = {
  slug: 'pre-post-assessments',
  admin: {
    useAsTitle: 'title',
    group: 'Research',
    defaultColumns: ['title', 'preQuiz', 'postQuiz', 'classroom', 'updatedAt'],
    description:
      'Pair a pre-assessment quiz with a post-assessment quiz for the same construct. Drives normalized-gain analysis and pre/post research outputs.',
  },
  access: {
    read: ({ req }) => isStaff(req),
    create: ({ req }) => isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isStaff(req),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Optional notes on what this pre/post pair measures.' },
    },
    {
      name: 'preQuiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
      admin: { description: 'Quiz administered before instruction.' },
    },
    {
      name: 'postQuiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
      admin: { description: 'Quiz administered after instruction. Should target the same concepts as the pre-quiz.' },
    },
    {
      name: 'classroom',
      type: 'relationship',
      relationTo: 'classrooms',
      admin: {
        description:
          'Optional: scope the analysis to one classroom. Leave blank to aggregate across all attempts.',
      },
    },
    {
      name: 'concepts',
      type: 'relationship',
      relationTo: 'concepts',
      hasMany: true,
      admin: {
        description: 'Concepts the assessment targets (used for downstream concept-level reporting).',
      },
    },
  ],
}
