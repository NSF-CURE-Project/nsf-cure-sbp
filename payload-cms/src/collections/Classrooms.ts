import type { Access, CollectionConfig, PayloadRequest, Where } from 'payload'

import { generateUniqueJoinCode } from '../utils/joinCode'
import {
  joinClassroomHandler,
  leaveClassroomHandler,
  regenerateClassroomCodeHandler,
} from '../endpoints/classroomEndpoints'
import { certificateHandler } from '../endpoints/certificate'

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
    // Canonical UI lives at /admin/classrooms — see views/classrooms/*.
    // Keep this hidden so /admin/collections/classrooms doesn't render the
    // generic Payload list/edit forms in parallel.
    hidden: true,
  },
  access: {
    // Cast to Access — Payload's typed `read` signature narrows the return to
    // a generated per-collection shape that won't unify with the union of
    // {professor:…} / {id:in:…} clauses below. The runtime shape is correct.
    read: (async ({ req }: { req: PayloadRequest }): Promise<boolean | Where> => {
      if (isStaff(req)) {
        if (req.user?.role === 'professor') {
          return { professor: { equals: req.user.id } }
        }
        return true
      }
      // Students can read classrooms they're enrolled in. Without this,
      // depth-populated `classroom` relations on a student's memberships
      // come back as bare IDs and the profile/dashboard UI falls back to
      // literal "Classroom"/"Course".
      if (req.user?.collection === 'accounts') {
        const enrollments = await req.payload.find({
          collection: 'classroom-memberships',
          where: { student: { equals: req.user.id } },
          depth: 0,
          limit: 1000,
          overrideAccess: true,
        })
        const classroomIds = enrollments.docs
          .map((m) => {
            const value = (m as { classroom?: unknown }).classroom
            if (value && typeof value === 'object' && 'id' in value) {
              return (value as { id?: string | number }).id
            }
            return value as string | number | undefined
          })
          .filter((id): id is string | number => id != null)
        if (classroomIds.length === 0) return false
        return { id: { in: classroomIds } }
      }
      return false
    }) as Access,
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
  // Payload 3 routes /api/<collection-slug>/* lookups only against this
  // collection's endpoints array. Top-level config.endpoints with paths like
  // /classrooms/join are never reached, so the join/leave/regenerate-code/
  // certificate routes must live here.
  endpoints: [
    {
      path: '/join',
      method: 'post',
      handler: joinClassroomHandler,
    },
    {
      path: '/regenerate-code',
      method: 'post',
      handler: regenerateClassroomCodeHandler,
    },
    {
      path: '/:classroomId/leave',
      method: 'post',
      handler: leaveClassroomHandler,
    },
    {
      path: '/:classroomId/certificate',
      method: 'get',
      handler: certificateHandler,
    },
  ],
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
    beforeDelete: [
      async ({ id, req }) => {
        // Cascade-delete memberships so the FK constraint can't refuse the
        // classroom delete, and so the UI doesn't have to walk users through
        // an empty-out step. overrideAccess so the cleanup runs regardless
        // of who initiated the delete (admin / staff / professor).
        if (!req?.payload) return
        try {
          await req.payload.delete({
            collection: 'classroom-memberships',
            where: { classroom: { equals: id } },
            overrideAccess: true,
          })
        } catch {
          // If the bulk delete fails (e.g. there are zero matches, which
          // Payload sometimes treats as an error), swallow it — the
          // classroom delete that follows will still succeed when no FK
          // references remain.
        }
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
      label: 'Course',
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
