import type { GlobalConfig } from 'payload'

export const AdminHelp: GlobalConfig = {
  slug: 'admin-help',
  label: 'Admin Help',
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => req.user?.role === 'admin',
  },
  versions: {
    drafts: true,
  },
  admin: {
    group: 'Settings',
    description: 'Guidance content shown on the admin Help page.',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      defaultValue: 'NSF CURE Admin Help',
      required: true,
    },
    {
      name: 'body',
      label: 'Help content',
      type: 'richText',
    },
  ],
}
