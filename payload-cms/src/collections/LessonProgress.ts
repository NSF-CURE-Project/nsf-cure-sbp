import type { CollectionConfig, PayloadRequest } from 'payload'
import { computeNextStreak } from '../utils/streak'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

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
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (!req?.payload || !doc?.completed) return
        if (previousDoc?.completed) return

        const userId =
          typeof doc.user === 'object' && doc.user !== null
            ? (doc.user as { id?: string | number }).id
            : doc.user
        if (!userId) return

        try {
          const account = await req.payload.findByID({
            collection: 'accounts',
            id: userId,
            depth: 0,
            overrideAccess: true,
          })

          const next = computeNextStreak({
            lastStreakDate: (account as { lastStreakDate?: string | null }).lastStreakDate ?? null,
            currentStreak: (account as { currentStreak?: number | null }).currentStreak ?? 0,
            longestStreak: (account as { longestStreak?: number | null }).longestStreak ?? 0,
          })

          if (!next.changed) return

          await req.payload.update({
            collection: 'accounts',
            id: userId,
            overrideAccess: true,
            data: {
              currentStreak: next.currentStreak,
              longestStreak: next.longestStreak,
              lastStreakDate: `${next.lastStreakDate}T00:00:00.000Z`,
            } as never,
          })
        } catch (error) {
          req.payload.logger.error({
            err: error,
            msg: `Failed to update streak for account ${String(userId)}`,
          })
        }
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
