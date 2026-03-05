import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

const resolveRelationId = (value: unknown): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return id
  }
  return null
}

export const LessonBookmarks: CollectionConfig = {
  slug: 'lesson-bookmarks',
  defaultSort: '-updatedAt',
  admin: {
    useAsTitle: 'lesson',
    group: 'Student Support',
    defaultColumns: ['lesson', 'user', 'updatedAt'],
  },
  access: {
    read: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'accounts') {
        return { user: { equals: req.user.id } }
      }
      return false
    },
    create: ({ req }) => req.user?.collection === 'accounts' || isStaff(req),
    update: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'accounts') {
        return { user: { equals: req.user.id } }
      }
      return false
    },
    delete: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'accounts') {
        return { user: { equals: req.user.id } }
      }
      return false
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (!data || !req?.payload) return data

        if (!data.user && req.user?.id) {
          data.user = req.user.id
        }

        const lessonValue = data.lesson ?? originalDoc?.lesson
        const lessonId = resolveRelationId(lessonValue)

        if (!lessonId) return data

        const lesson = await req.payload.findByID({
          collection: 'lessons',
          id: lessonId,
          depth: 0,
        })

        data.lesson = lesson.id
        data.chapter = (lesson as { chapter?: string | { id?: string | number } }).chapter ?? data.chapter

        const chapterId = resolveRelationId(data.chapter)
        if (chapterId) {
          const chapter = await req.payload.findByID({
            collection: 'chapters',
            id: chapterId,
            depth: 0,
          })
          data.chapter = chapter.id
          data.class = (chapter as { class?: string | { id?: string | number } }).class ?? data.class
        }

        const userId = resolveRelationId(data.user)
        const currentId = resolveRelationId(originalDoc?.id)
        if (!userId) return data

        const existing = await req.payload.find({
          collection: 'lesson-bookmarks',
          depth: 0,
          limit: 1,
          where: {
            user: { equals: userId },
            lesson: { equals: lesson.id },
            ...(currentId ? { id: { not_equals: currentId } } : {}),
          },
        })

        if ((existing.docs?.length ?? 0) > 0) {
          throw new Error('This lesson is already in your saved list.')
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'accounts',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      index: true,
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'class',
      type: 'relationship',
      relationTo: 'classes',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
