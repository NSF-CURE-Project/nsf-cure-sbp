import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

export const ProblemSets: CollectionConfig = {
  slug: 'problem-sets',
  admin: {
    useAsTitle: 'title',
    group: 'Assessments',
    defaultColumns: ['title', 'updatedAt'],
    preview: ({ data }) => {
      const problemSetId =
        typeof data === 'object' && data && 'id' in data
          ? String((data as { id?: string | number }).id ?? '')
          : ''
      const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
      const secret = process.env.PREVIEW_SECRET ?? ''
      const search = new URLSearchParams({
        secret,
        type: 'problem-set',
        slug: problemSetId,
      })
      return `${base}/api/preview?${search.toString()}`
    },
    livePreview: {
      url: ({ data }) => {
        const problemSetId =
          typeof data === 'object' && data && 'id' in data
            ? String((data as { id?: string | number }).id ?? '')
            : ''
        const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
        const secret = process.env.PREVIEW_SECRET ?? ''
        const search = new URLSearchParams({
          secret,
          type: 'problem-set',
          slug: problemSetId,
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
      name: 'problems',
      type: 'relationship',
      relationTo: 'problems',
      hasMany: true,
      required: true,
    },
    {
      name: 'showAnswers',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'maxAttempts',
      type: 'number',
    },
    {
      name: 'shuffleProblems',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
