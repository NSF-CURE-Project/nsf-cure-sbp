import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'message',
    group: 'Student Support',
    defaultColumns: ['message', 'email', 'pageUrl', 'createdAt'],
    // Canonical UI lives at /admin/feedback — see views/feedback/*.
    // Keep this hidden so /admin/collections/feedback doesn't render the
    // generic Payload list view in parallel.
    hidden: true,
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
