import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) =>
      req.user?.collection === 'accounts' ||
      req.user?.collection === 'users' ||
      ['admin', 'staff'].includes(req.user?.role ?? ''),
    update: ({ req }) =>
      req.user?.collection === 'users' || ['admin', 'staff'].includes(req.user?.role ?? ''),
    delete: ({ req }) =>
      req.user?.collection === 'users' || ['admin', 'staff'].includes(req.user?.role ?? ''),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
