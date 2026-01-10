import type { CollectionConfig, PayloadRequest } from 'payload'

import { generateUniqueJoinCode } from '../utils/joinCode'

const DEFAULT_JOIN_CODE_LENGTH = 6
const DEFAULT_JOIN_CODE_DURATION_HOURS = 168

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.min(Math.max(parsed, min), max)
}

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const Classrooms: CollectionConfig = {
  slug: 'classrooms',
  defaultSort: '-updatedAt',
  admin: {
    useAsTitle: 'title',
    group: 'Classrooms',
    defaultColumns: ['title', 'class', 'professor', 'joinCode', 'active', 'updatedAt'],
  },
  access: {
    read: ({ req }) => {
      if (!isStaff(req)) return false
      if (req.user?.role === 'professor') {
        return {
          professor: {
            equals: req.user.id,
          },
        }
      }
      return true
    },
    create: ({ req }) => isStaff(req),
    update: ({ req }) => {
      if (!isStaff(req)) return false
      if (req.user?.role === 'professor') {
        return {
          professor: {
            equals: req.user.id,
          },
        }
      }
      return true
    },
    delete: ({ req }) => {
      if (!isStaff(req)) return false
      if (req.user?.role === 'professor') {
        return {
          professor: {
            equals: req.user.id,
          },
        }
      }
      return true
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data || !req?.payload) return data
        const length = clampNumber(
          data.joinCodeLength ?? originalDoc?.joinCodeLength ?? DEFAULT_JOIN_CODE_LENGTH,
          DEFAULT_JOIN_CODE_LENGTH,
          4,
          10,
        )
        data.joinCodeLength = length

        if (!data.joinCode) {
          data.joinCode = await generateUniqueJoinCode(req.payload as typeof req.payload, length)
        }
        if (typeof data.joinCode === 'string') {
          data.joinCode = data.joinCode.toUpperCase()
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data
        const now = new Date()
        const durationHours = clampNumber(
          data.joinCodeDurationHours ??
            originalDoc?.joinCodeDurationHours ??
            DEFAULT_JOIN_CODE_DURATION_HOURS,
          DEFAULT_JOIN_CODE_DURATION_HOURS,
          1,
          720,
        )
        data.joinCodeDurationHours = durationHours

        if (operation === 'create') {
          if (!data.professor && req?.user?.collection === 'users') {
            data.professor = req.user.id
          }
          if (!data.joinCodeExpiresAt) {
            data.joinCodeExpiresAt = new Date(
              now.getTime() + durationHours * 60 * 60 * 1000,
            ).toISOString()
          }
          if (!data.joinCodeLastRotatedAt) {
            data.joinCodeLastRotatedAt = now.toISOString()
          }
          return data
        }

        if (data.joinCode && data.joinCode !== originalDoc?.joinCode) {
          data.joinCodeLastRotatedAt = now.toISOString()
          if (!data.joinCodeExpiresAt) {
            data.joinCodeExpiresAt = new Date(
              now.getTime() + durationHours * 60 * 60 * 1000,
            ).toISOString()
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'class',
      label: 'Class',
      type: 'relationship',
      relationTo: 'classes',
      required: true,
    },
    {
      name: 'professor',
      label: 'Professor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'joinCode',
      label: 'Join code',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        readOnly: true,
        description: 'Share this code with students to join the classroom.',
        position: 'sidebar',
      },
    },
    {
      name: 'joinCodeLength',
      label: 'Join code length',
      type: 'number',
      defaultValue: DEFAULT_JOIN_CODE_LENGTH,
      admin: {
        position: 'sidebar',
        description: 'Controls the length of newly generated join codes.',
      },
    },
    {
      name: 'joinCodeDurationHours',
      label: 'Join code duration (hours)',
      type: 'number',
      defaultValue: DEFAULT_JOIN_CODE_DURATION_HOURS,
      admin: {
        position: 'sidebar',
        description: 'How long new join codes remain valid.',
      },
    },
    {
      name: 'joinCodeExpiresAt',
      label: 'Join code expires at',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'joinCodeLastRotatedAt',
      label: 'Join code last rotated',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'joinCodeManager',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/views/ClassroomJoinCodeField#default',
        },
      },
    },
    {
      name: 'active',
      label: 'Active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
