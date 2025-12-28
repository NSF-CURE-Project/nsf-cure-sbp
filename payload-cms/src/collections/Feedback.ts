import type { CollectionConfig } from 'payload'

const isStaff = (req?: { user?: { collection?: string; role?: string } }) =>
  req?.user?.collection === 'users' || ['admin', 'staff'].includes(req?.user?.role ?? '')

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  admin: {
    useAsTitle: 'message',
    group: 'Student Support',
    defaultColumns: ['message', 'email', 'pageUrl', 'createdAt'],
    defaultSort: '-createdAt',
  },
  access: {
    read: ({ req }) => (isStaff(req) ? true : false),
    create: () => true,
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isStaff(req),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'pageUrl',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
}
