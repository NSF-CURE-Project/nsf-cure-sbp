import type { Access, CollectionConfig, PayloadRequest, Where } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes((req.user as { role?: string }).role ?? '')

// Staff can see their own views + every shared view. Other roles see nothing.
const readAccess: Access = ({ req }) => {
  if (!isStaff(req)) return false
  const userId = req?.user?.id
  const orClauses: Where[] = [{ shared: { equals: true } } as Where]
  if (userId != null) orClauses.push({ owner: { equals: userId } } as Where)
  return { or: orClauses }
}

// Only the owner can mutate their view; admins can mutate anyone's.
const ownerOrAdmin: Access = ({ req }) => {
  if (!isStaff(req)) return false
  if ((req.user as { role?: string }).role === 'admin') return true
  const userId = req?.user?.id
  if (userId == null) return false
  return { owner: { equals: userId } } as Where
}

export const SavedViews: CollectionConfig = {
  slug: 'saved-views',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
    defaultColumns: ['name', 'scope', 'shared', 'owner', 'updatedAt'],
    description: 'Saved filter/sort presets for the staff dashboard, sharable across the team.',
    hidden: true,
  },
  access: {
    read: readAccess,
    create: ({ req }) => isStaff(req),
    update: ownerOrAdmin,
    delete: ownerOrAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (!data || typeof data !== 'object') return data
        const next = { ...(data as Record<string, unknown>) }
        if (operation === 'create' && req?.user?.id != null && next.owner == null) {
          next.owner = req.user.id
        }
        return next
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'scope',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Identifier for which dashboard the view applies to (e.g. quiz-bank).',
      },
    },
    {
      name: 'state',
      type: 'json',
      required: true,
      admin: {
        description: 'Serialized filter/sort state. Schema is dictated by the dashboard.',
      },
    },
    {
      name: 'shared',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'When true, all staff users see this view.' },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { readOnly: true },
    },
  ],
}
