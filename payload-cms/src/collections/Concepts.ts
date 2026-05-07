import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) => {
  if (req?.user?.collection !== 'users') return false
  const role = (req.user as { role?: string }).role ?? ''
  return ['admin', 'staff', 'professor'].includes(role)
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

export const Concepts: CollectionConfig = {
  slug: 'concepts',
  admin: {
    useAsTitle: 'name',
    group: 'Authoring',
    defaultColumns: ['name', 'slug', 'subject', 'updatedAt'],
    description:
      'Atomic learning concepts. Tag questions, lessons, and problems by concept so analytics, mastery, and remediation can hang off a single ontology.',
  },
  access: {
    read: () => true,
    create: ({ req }) => isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isStaff(req),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== 'object') return data
        const next = { ...(data as Record<string, unknown>) }
        if (typeof next.name === 'string' && (!next.slug || next.slug === '')) {
          next.slug = slugify(next.name)
        } else if (typeof next.slug === 'string') {
          next.slug = slugify(next.slug)
        }
        return next
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Auto-generated from the name; edit to customize.' },
    },
    {
      name: 'subject',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'Statics', value: 'statics' },
        { label: 'Mechanics of Materials', value: 'mechanics' },
        { label: 'Math / Trig prerequisites', value: 'math' },
        { label: 'Physics', value: 'physics' },
        { label: 'General engineering', value: 'general' },
      ],
    },
    {
      name: 'bloomLevel',
      type: 'select',
      admin: {
        description: 'Cognitive level the concept primarily targets.',
      },
      options: [
        { label: 'Remember', value: 'remember' },
        { label: 'Understand', value: 'understand' },
        { label: 'Apply', value: 'apply' },
        { label: 'Analyze', value: 'analyze' },
        { label: 'Evaluate', value: 'evaluate' },
        { label: 'Create', value: 'create' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short, plain-language description of the concept for staff.',
      },
    },
    {
      name: 'prerequisiteConcepts',
      type: 'relationship',
      relationTo: 'concepts',
      hasMany: true,
      admin: {
        description: 'Other concepts that should be mastered before this one.',
      },
    },
  ],
}
