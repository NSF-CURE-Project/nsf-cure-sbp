import type { CollectionConfig, PayloadRequest } from 'payload'
import { pageBlocks } from '../blocks/pageBlocks'
import { ensureUniqueSlug, slugify } from '../utils/slug'

const resolveLessonClassSlug = (data?: { class?: unknown; chapter?: unknown }) => {
  const direct = data?.class
  const directSlug =
    typeof direct === 'object' && direct !== null && 'slug' in direct
      ? (direct as { slug?: string }).slug
      : null
  if (directSlug) return directSlug

  const chapter = data?.chapter
  const chapterClass =
    typeof chapter === 'object' && chapter !== null && 'class' in chapter
      ? (chapter as { class?: unknown }).class
      : null
  const chapterSlug =
    typeof chapterClass === 'object' && chapterClass !== null && 'slug' in chapterClass
      ? (chapterClass as { slug?: string }).slug
      : null
  return chapterSlug ?? ''
}

const resolveChapterId = (chapter?: unknown) =>
  typeof chapter === 'object' && chapter !== null && 'id' in chapter
    ? (chapter as { id?: string | number }).id
    : chapter

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['order', 'title', 'chapter', 'updatedAt'],
    preview: ({ data }) => {
      const lessonSlug = (data as { slug?: string })?.slug ?? ''
      const classSlug = resolveLessonClassSlug(data as { chapter?: unknown } | undefined)
      const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
      const secret = process.env.PREVIEW_SECRET ?? ''
      const search = new URLSearchParams({
        secret,
        type: 'lesson',
        slug: lessonSlug,
      })
      if (classSlug) search.set('classSlug', classSlug)
      return `${base}/api/preview?${search.toString()}`
    },
    livePreview: {
      url: ({ data }) => {
        const lessonSlug = (data as { slug?: string })?.slug ?? ''
        const classSlug = resolveLessonClassSlug(data as { chapter?: unknown } | undefined)
        const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
        const secret = process.env.PREVIEW_SECRET ?? ''
        const search = new URLSearchParams({
          secret,
          type: 'lesson',
          slug: lessonSlug,
        })
        if (classSlug) search.set('classSlug', classSlug)
        return `${base}/api/preview?${search.toString()}`
      },
    },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (!req?.payload) return
        const runChapterSyncAsync = process.env.PAYLOAD_ASYNC_LESSON_CHAPTER_SYNC !== 'false'
        const getId = (value: unknown) =>
          typeof value === 'object' && value !== null && 'id' in value
            ? String((value as { id?: string | number }).id ?? '')
            : value != null
              ? String(value)
              : null

        const nextChapterId = getId(doc?.chapter)
        const prevChapterId = getId(previousDoc?.chapter)

        if (!nextChapterId) return
        // Avoid unnecessary cross-collection writes on normal lesson updates.
        if (operation !== 'create' && prevChapterId === nextChapterId) return

        const syncChapterRelations = async () => {
          const attachLesson = async (chapterId: string) => {
            const current = await req.payload.findByID({
              collection: 'chapters',
              id: chapterId,
              depth: 0,
            })
            const existing = Array.isArray((current as { lessons?: unknown[] }).lessons)
              ? ((current as { lessons?: unknown[] }).lessons ?? [])
              : []
            const exists = existing.some((item) => getId(item) === String(doc.id))
            if (exists) return
            await req.payload.update({
              collection: 'chapters',
              id: chapterId,
              data: {
                lessons: [...existing, doc.id] as unknown as Array<number | { id?: number }>,
              },
              depth: 0,
            })
          }

          const detachLesson = async (chapterId: string) => {
            const current = await req.payload.findByID({
              collection: 'chapters',
              id: chapterId,
              depth: 0,
            })
            const existing = Array.isArray((current as { lessons?: unknown[] }).lessons)
              ? ((current as { lessons?: unknown[] }).lessons ?? [])
              : []
            const filtered = existing.filter((item) => getId(item) !== String(doc.id))
            if (filtered.length === existing.length) return
            await req.payload.update({
              collection: 'chapters',
              id: chapterId,
              data: {
                lessons: filtered as unknown as Array<number | { id?: number }>,
              },
              depth: 0,
            })
          }

          if (prevChapterId && prevChapterId !== nextChapterId) {
            await detachLesson(prevChapterId)
          }

          await attachLesson(nextChapterId)
        }

        if (runChapterSyncAsync) {
          setTimeout(() => {
            void syncChapterRelations().catch((error) => {
              req.payload.logger.error({
                err: error,
                msg: `Failed to sync chapter lessons for lesson ${String(doc.id)}`,
              })
            })
          }, 0)
          return
        }

        await syncChapterRelations()
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (!req?.payload || !doc) return
        const runChapterSyncAsync = process.env.PAYLOAD_ASYNC_LESSON_CHAPTER_SYNC !== 'false'
        const getId = (value: unknown) =>
          typeof value === 'object' && value !== null && 'id' in value
            ? String((value as { id?: string | number }).id ?? '')
            : value != null
              ? String(value)
              : null

        const chapterId = getId(doc.chapter)
        if (!chapterId) return

        const current = await req.payload.findByID({
          collection: 'chapters',
          id: chapterId,
          depth: 0,
        })
        const existing = Array.isArray((current as { lessons?: unknown[] }).lessons)
          ? ((current as { lessons?: unknown[] }).lessons ?? [])
          : []
        const filtered = existing.filter((item) => getId(item) !== String(doc.id))
        if (filtered.length === existing.length) return

        const removeLessonFromChapter = async () => {
          await req.payload.update({
            collection: 'chapters',
            id: chapterId,
            data: {
              lessons: filtered as unknown as Array<number | { id?: number }>,
            },
            depth: 0,
          })
        }

        if (runChapterSyncAsync) {
          setTimeout(() => {
            void removeLessonFromChapter().catch((error) => {
              req.payload.logger.error({
                err: error,
                msg: `Failed to remove lesson ${String(doc.id)} from chapter ${chapterId}`,
              })
            })
          }, 0)
          return
        }

        await removeLessonFromChapter()
      },
    ],
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data
        if (!data.slug) {
          const title = data.title ?? originalDoc?.title ?? ''
          const base = slugify(String(title))
          const chapter = data.chapter ?? originalDoc?.chapter
          const chapterId = resolveChapterId(chapter)
          data.slug = await ensureUniqueSlug({
            base,
            collection: 'lessons',
            req,
            id: originalDoc?.id,
            where: chapterId ? { chapter: { equals: chapterId } } : undefined,
          })
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'lessonOrderGuide',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/views/LessonOrderField#default',
                },
              },
            },
            {
              name: 'order',
              label: 'Lesson Order',
              type: 'number',
              min: 0,
              admin: {
                position: 'sidebar',
                description: 'Managed from the Reorder lessons list.',
                readOnly: true,
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'chapter',
              label: 'Chapter',
              type: 'relationship',
              relationTo: 'chapters',
              required: true,
              admin: {
                description: 'Assign this lesson to a chapter.',
              },
            },

            // 🔹 NEW: slug used in /classes/[classSlug]/lessons/[lessonSlug]
            {
              name: 'slug',
              type: 'text',
              required: true,
              validate: async (
                value: unknown,
                options?: { data?: { chapter?: unknown }; req?: PayloadRequest; id?: string | number },
              ) => {
                const data = options?.data
                const req = options?.req
                const id = options?.id
                if (!value || typeof value !== 'string') return 'Slug is required.'
                const chapter = data?.chapter
                const chapterId = resolveChapterId(chapter)
                if (!chapterId) return 'Select a chapter before setting the slug.'
                if (!req?.payload) return true
                const existing = await req.payload.find({
                  collection: 'lessons',
                  depth: 0,
                  limit: 1,
                  where: {
                    slug: { equals: value },
                    chapter: { equals: chapterId },
                    id: { not_equals: id },
                  },
                })
                if (existing.totalDocs > 0) {
                  return 'Slug must be unique within this chapter.'
                }
                return true
              },
              admin: {
                description: 'Auto-generated from the lesson title. Must be unique within a chapter.',
                hidden: true,
              },
            },

            // Flexible layout so staff can reorder content blocks
            {
              name: 'layout',
              label: 'Page Layout',
              type: 'blocks',
              labels: {
                singular: 'Section',
                plural: 'Sections',
              },
              blocks: pageBlocks,
              admin: {
                description: 'Build the lesson by adding and reordering content blocks.',
              },
            },
            {
              name: 'lessonFeedbackPanel',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/views/LessonFeedbackPanel#default',
                },
              },
            },
          ],
        },
        {
          label: 'Assessment',
          fields: [
            {
              name: 'assessment',
              type: 'group',
              fields: [
                {
                  name: 'quiz',
                  label: 'Attach quiz',
                  type: 'relationship',
                  relationTo: 'quizzes',
                  admin: {
                    allowCreate: true,
                    allowEdit: true,
                    description: 'Attach a quiz to this lesson or create a new one.',
                  },
                },
                {
                  name: 'showAnswers',
                  label: 'Show answers after submit',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'maxAttempts',
                  label: 'Max attempts',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'Leave blank for unlimited attempts.',
                  },
                },
                {
                  name: 'timeLimitSec',
                  label: 'Time limit (seconds)',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'Overrides the quiz time limit for this lesson if set.',
                  },
                },
                {
                  name: 'quizPreview',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '@/views/LessonQuizPreviewField#default',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
