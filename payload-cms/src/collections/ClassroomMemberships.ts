import type { CollectionConfig, PayloadRequest, Where } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const ClassroomMemberships: CollectionConfig = {
  slug: 'classroom-memberships',
  defaultSort: '-joinedAt',
  admin: {
    useAsTitle: 'student',
    group: 'Classrooms',
    defaultColumns: [
      'student',
      'classroom',
      'joinedAt',
      'completedLessons',
      'totalLessons',
      'completionRate',
      'lastActivityAt',
    ],
  },
  access: {
    read: async ({ req }) => {
      if (isStaff(req)) {
        if (req.user?.role === 'professor') {
          if (!req.payload) return false
          const classrooms = await req.payload.find({
            collection: 'classrooms',
            depth: 0,
            limit: 500,
            where: {
              professor: {
                equals: req.user.id,
              },
            },
          })
          const classroomIds =
            classrooms.docs
              ?.map((doc) => (doc as { id?: string | number }).id)
              .filter((id): id is string | number => id != null) ?? []
          if (!classroomIds.length) return false
          const classroomWhere: Where = {
            classroom: {
              in: classroomIds,
            },
          }
          return classroomWhere
        }
        return true
      }
      if (req.user?.collection === 'accounts') {
        const studentWhere: Where = {
          student: {
            equals: req.user.id,
          },
        }
        return studentWhere
      }
      return false
    },
    create: ({ req }) => req.user?.collection === 'accounts' || isStaff(req),
    update: async ({ req }) => {
      if (!isStaff(req)) return false
      if (req.user?.role === 'professor') {
        if (!req.payload) return false
        const classrooms = await req.payload.find({
          collection: 'classrooms',
          depth: 0,
          limit: 500,
          where: {
            professor: {
              equals: req.user.id,
            },
          },
        })
        const classroomIds =
          classrooms.docs
            ?.map((doc) => (doc as { id?: string | number }).id)
            .filter((id): id is string | number => id != null) ?? []
        if (!classroomIds.length) return false
        const classroomWhere: Where = {
          classroom: {
            in: classroomIds,
          },
        }
        return classroomWhere
      }
      return true
    },
    delete: async ({ req }) => {
      if (!isStaff(req)) return false
      if (req.user?.role === 'professor') {
        if (!req.payload) return false
        const classrooms = await req.payload.find({
          collection: 'classrooms',
          depth: 0,
          limit: 500,
          where: {
            professor: {
              equals: req.user.id,
            },
          },
        })
        const classroomIds =
          classrooms.docs
            ?.map((doc) => (doc as { id?: string | number }).id)
            .filter((id): id is string | number => id != null) ?? []
        if (!classroomIds.length) return false
        const classroomWhere: Where = {
          classroom: {
            in: classroomIds,
          },
        }
        return classroomWhere
      }
      return true
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (!data || !req?.payload) return data
        if (!data.student && req.user?.collection === 'accounts') {
          data.student = req.user.id
        }
        if (!data.joinedAt) {
          data.joinedAt = new Date().toISOString()
        }
        if (operation === 'create' && data.classroom && data.student) {
          const existing = await req.payload.find({
            collection: 'classroom-memberships',
            depth: 0,
            limit: 1,
            where: {
              classroom: { equals: data.classroom },
              student: { equals: data.student },
            },
          })
          if (existing.docs?.length) {
            throw new Error('Student is already enrolled in this classroom.')
          }
        }
        return data
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        if (!req?.payload) return doc
        const classroomId =
          typeof doc.classroom === 'object' && doc.classroom !== null
            ? (doc.classroom as { id?: string }).id
            : doc.classroom
        const studentId =
          typeof doc.student === 'object' && doc.student !== null
            ? (doc.student as { id?: string }).id
            : doc.student

        if (!classroomId || !studentId) return doc

        let classId: string | number | undefined
        try {
          const classroom = await req.payload.findByID({
            collection: 'classrooms',
            id: classroomId,
            depth: 0,
          })
          classId =
            typeof (classroom as { class?: string | { id?: string } }).class === 'object'
              ? (classroom as { class?: { id?: string } }).class?.id
              : (classroom as { class?: string | number }).class
        } catch {
          classId = undefined
        }

        if (!classId) return doc

        try {
          const progress = await req.payload.find({
            collection: 'lesson-progress',
            depth: 0,
            limit: 2000,
            where: {
              user: { equals: studentId },
              class: { equals: classId },
            },
          })
          const totalLessons = progress.docs?.length ?? 0
          const completedLessons = (progress.docs ?? []).filter(
            (entry) => (entry as { completed?: boolean })?.completed,
          ).length
          const lastActivityAt = (progress.docs ?? [])
            .map((entry) => (entry as { updatedAt?: string })?.updatedAt)
            .filter(Boolean)
            .sort()
            .slice(-1)[0]

          return {
            ...doc,
            totalLessons,
            completedLessons,
            completionRate: totalLessons ? completedLessons / totalLessons : 0,
            lastActivityAt: lastActivityAt ?? null,
          }
        } catch {
          return doc
        }
      },
    ],
  },
  fields: [
    {
      name: 'classroom',
      type: 'relationship',
      relationTo: 'classrooms',
      required: true,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'accounts',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'joinedAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'totalLessons',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'completedLessons',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'completionRate',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Completed lessons divided by lessons started.',
      },
    },
    {
      name: 'lastActivityAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
