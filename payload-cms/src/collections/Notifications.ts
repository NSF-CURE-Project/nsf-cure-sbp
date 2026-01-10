import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'title',
    group: 'Student Support',
    defaultColumns: ['title', 'recipient', 'read', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'accounts') {
        return { recipient: { equals: req.user.id } }
      }
      return false
    },
    create: ({ req }) => isStaff(req),
    update: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'accounts') {
        return { recipient: { equals: req.user.id } }
      }
      return false
    },
    delete: ({ req }) => isStaff(req),
  },
  fields: [
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'accounts',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'question_answered',
      options: [{ label: 'Question answered', value: 'question_answered' }],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
    },
    {
      name: 'question',
      type: 'relationship',
      relationTo: 'questions',
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
