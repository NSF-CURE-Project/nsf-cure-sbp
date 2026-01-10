import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

export const LessonProgress: CollectionConfig = {
  slug: 'lesson-progress',
  defaultSort: '-updatedAt',
  admin: {
    useAsTitle: 'lesson',
    group: 'Student Support',
    defaultColumns: ['lesson', 'user', 'completed', 'completedAt'],
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
    delete: ({ req }) => isStaff(req),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (!data || !req?.payload) return data

        if (!data.user && req.user?.id) {
          data.user = req.user.id
        }

        const lessonValue = data.lesson ?? originalDoc?.lesson
        const lessonId =
          typeof lessonValue === 'object' && lessonValue !== null
            ? (lessonValue as { id?: string }).id
            : lessonValue

        if (lessonId) {
          const lesson = await req.payload.findByID({
            collection: 'lessons',
            id: lessonId,
            depth: 0,
          })
          if (lesson) {
            data.lesson = lesson.id
            data.chapter =
              (lesson as { chapter?: string | { id?: string } }).chapter ?? data.chapter
            const chapterId =
              typeof data.chapter === 'object' && data.chapter !== null
                ? (data.chapter as { id?: string }).id
                : data.chapter
            if (chapterId) {
              const chapter = await req.payload.findByID({
                collection: 'chapters',
                id: chapterId,
                depth: 0,
              })
              if (chapter) {
                data.chapter = chapter.id
                data.class = (chapter as { class?: string | { id?: string } }).class ?? data.class
              }
            }
          }
        }

        if (data.completed && !data.completedAt) {
          data.completedAt = new Date().toISOString()
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
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
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
