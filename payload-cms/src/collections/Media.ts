import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) => {
  if (req?.user?.collection !== 'users') return false
  const role = (req.user as { role?: string }).role ?? ''
  return ['admin', 'staff', 'professor'].includes(role)
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) =>
      req.user?.collection === 'accounts' || req.user?.collection === 'users' || isStaff(req),
    update: ({ req }) => req.user?.collection === 'users' || isStaff(req),
    delete: ({ req }) => req.user?.collection === 'users' || isStaff(req),
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
