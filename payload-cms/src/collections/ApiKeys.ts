import crypto from 'crypto'
import type { CollectionConfig, PayloadRequest } from 'payload'

const isAdminOrStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff'].includes(req.user?.role ?? '')

const generateApiKey = () => crypto.randomBytes(20).toString('hex')

const maskApiKey = (value: string) => {
  if (value.length <= 4) return value
  return `${'•'.repeat(Math.max(8, value.length - 4))}${value.slice(-4)}`
}

export const ApiKeys: CollectionConfig = {
  slug: 'api-keys',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    defaultColumns: ['name', 'owner', 'active', 'expiresAt', 'lastUsedAt', 'updatedAt'],
  },
  access: {
    read: ({ req }) => isAdminOrStaff(req),
    create: ({ req }) => isAdminOrStaff(req),
    update: ({ req }) => isAdminOrStaff(req),
    delete: ({ req }) => isAdminOrStaff(req),
  },
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) => {
        if (!data || typeof data !== 'object') return data

        if (operation === 'create') {
          if (!data.key || typeof data.key !== 'string') {
            data.key = generateApiKey()
          }
          if (!data.owner && req.user?.collection === 'users') {
            data.owner = req.user.id
          }
          req.context = {
            ...(req.context ?? {}),
            exposeRawApiKey: true,
          }
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (!data || typeof data !== 'object') return data
        if (operation === 'update' && originalDoc?.key) {
          data.key = originalDoc.key
        }
        return data
      },
    ],
    afterRead: [
      ({ doc, req }) => {
        if (!doc || typeof doc !== 'object') return doc
        if (req.context?.maskApiKey === false || req.context?.exposeRawApiKey) return doc

        const key = (doc as { key?: unknown }).key
        if (typeof key === 'string' && key.length > 0) {
          ;(doc as { key: string }).key = maskApiKey(key)
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'API key is shown once at creation time and masked thereafter.',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'scopes',
      type: 'select',
      required: true,
      hasMany: true,
      defaultValue: ['reporting:read'],
      options: [
        { label: 'Reporting read', value: 'reporting:read' },
        { label: 'Accounts read', value: 'accounts:read' },
      ],
    },
    {
      name: 'lastUsedAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'apiKeyDisplay',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/views/ApiKeyDisplay#default',
        },
      },
    },
  ],
}
