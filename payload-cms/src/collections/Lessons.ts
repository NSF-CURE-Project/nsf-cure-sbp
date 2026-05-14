import type { CollectionConfig, PayloadRequest } from 'payload'
import { lessonBlocks } from '../blocks/pageBlocks'
import { canReceiveNotification } from '../utils/notificationPreferences'
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

const extractId = (value: unknown): string | number | null => {
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id ?? null
  }
  if (typeof value === 'string' || typeof value === 'number') return value
  return null
}

const extractSlug = (value: unknown): string => {
  if (typeof value === 'object' && value !== null && 'slug' in value) {
    return (value as { slug?: string }).slug ?? ''
  }
  return ''
}

type LegacyAssessment = {
  quiz?: unknown
  showAnswers?: boolean | null
  maxAttempts?: number | null
  timeLimitSec?: number | null
}

type QuizLayoutBlock = {
  blockType: 'quizBlock'
  quiz: unknown
  title?: string
  showTitle?: boolean
  showAnswers?: boolean | null
  maxAttempts?: number | null
  timeLimitSec?: number | null
}

const normalizeQuizLayout = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) return []
  return value.filter(
    (entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null,
  )
}

const hasQuizBlock = (layout: Record<string, unknown>[]) =>
  layout.some((block) => block.blockType === 'quizBlock')

const buildLegacyAssessmentQuizBlock = (assessment: LegacyAssessment): QuizLayoutBlock | null => {
  if (!assessment.quiz) return null
  return {
    blockType: 'quizBlock',
    quiz: assessment.quiz,
    showTitle: true,
    showAnswers: typeof assessment.showAnswers === 'boolean' ? assessment.showAnswers : true,
    maxAttempts:
      typeof assessment.maxAttempts === 'number' ? assessment.maxAttempts : (assessment.maxAttempts ?? null),
    timeLimitSec:
      typeof assessment.timeLimitSec === 'number'
        ? assessment.timeLimitSec
        : (assessment.timeLimitSec ?? null),
  }
}

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['order', 'title', 'chapter', 'updatedAt'],
    // Lessons are authored exclusively via the custom Course Workspace editor
    // (`/admin/courses/[id]/lessons/...`). Hiding here removes the collection
    // from the admin nav and 404s /admin/collections/lessons/*, matching the
    // Chapters treatment and preventing parallel-edit drift.
    hidden: true,
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
    // Staff (authenticated via the `users` collection) can read any lesson,
    // including drafts — they edit them. Everyone else — students on the
    // public site, anonymous traffic, API clients without staff auth — sees
    // only published lessons. This is the load-bearing filter that keeps
    // half-finished lessons off the student-facing frontend, including the
    // nested-hydration path (chapter.lessons populated at depth>=1).
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      // Server-to-server preview path: the web service forwards
      // X-Preview-Secret on draft fetches so live-preview iframes can render
      // unpublished content. Same secret already gates /api/preview, so
      // honoring it here doesn't broaden the trust surface.
      const previewSecret = process.env.PREVIEW_SECRET
      const headerSecret =
        (typeof req.headers?.get === 'function' && req.headers.get('x-preview-secret')) ||
        (req.headers as unknown as Record<string, string | undefined>)?.['x-preview-secret']
      if (previewSecret && headerSecret && headerSecret === previewSecret) return true
      return { _status: { equals: 'published' } }
    },
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc }) => {
        if (!data) return data

        const draftLayout = normalizeQuizLayout(data.layout)
        if (hasQuizBlock(draftLayout)) return data

        const persistedLayout = normalizeQuizLayout(originalDoc?.layout)
        if (hasQuizBlock(persistedLayout)) return data

        const nextBlock =
          buildLegacyAssessmentQuizBlock((data.assessment as LegacyAssessment | undefined) ?? {}) ??
          buildLegacyAssessmentQuizBlock((originalDoc?.assessment as LegacyAssessment | undefined) ?? {})

        if (!nextBlock) return data

        const baseLayout = draftLayout.length > 0 ? draftLayout : persistedLayout
        data.layout = [...baseLayout, nextBlock]
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const isNowPublished = doc?._status === 'published'
        const wasPublished = previousDoc?._status === 'published'
        if (!isNowPublished || wasPublished || !req?.payload) return

        try {
          const lessonSlug = typeof doc.slug === 'string' ? doc.slug : ''
          const chapterId = extractId(doc.chapter)
          if (!lessonSlug || !chapterId) return

          const chapter = await req.payload.findByID({
            collection: 'chapters',
            id: chapterId,
            depth: 1,
            overrideAccess: true,
          })

          const classValue = (chapter as { class?: unknown }).class
          const classId = extractId(classValue)
          if (!classId) return

          let classSlug = extractSlug(classValue)
          if (!classSlug) {
            const classDoc = await req.payload.findByID({
              collection: 'classes',
              id: classId,
              depth: 0,
              overrideAccess: true,
            })
            classSlug =
              typeof (classDoc as { slug?: unknown }).slug === 'string'
                ? ((classDoc as { slug?: string }).slug ?? '')
                : ''
          }

          if (!classSlug) return

          const lessonLink = `/classes/${classSlug}/lessons/${lessonSlug}`
          const memberships = await req.payload.find({
            collection: 'classroom-memberships',
            depth: 1,
            limit: 501,
            overrideAccess: true,
            where: {
              'classroom.class': { equals: classId },
            } as never,
          })

          const recipients = new Set<number>()
          for (const membership of memberships.docs ?? []) {
            const studentValue = (membership as { student?: unknown }).student
            const studentId = extractId(studentValue)
            const numericStudentId = Number(studentId)
            if (Number.isFinite(numericStudentId)) recipients.add(numericStudentId)
          }

          const recipientIds = [...recipients]
          if (recipientIds.length === 0) return
          if (recipientIds.length > 500) {
            req.payload.logger.warn(
              `Skipping lesson publish notifications for lesson ${String(doc.id)}; recipient count exceeds 500.`,
            )
            return
          }

          const existing = await req.payload.find({
            collection: 'notifications',
            depth: 0,
            limit: recipientIds.length,
            overrideAccess: true,
            where: {
              and: [
                { recipient: { in: recipientIds } },
                { type: { equals: 'new_content' } },
                { link: { equals: lessonLink } },
                { read: { equals: false } },
              ],
            } as never,
          })
          const existingRecipients = new Set<number>(
            (existing.docs ?? [])
              .map((notification) => extractId((notification as { recipient?: unknown }).recipient))
              .filter((id): id is string | number => id != null)
              .map((id) => Number(id))
              .filter((id) => Number.isFinite(id)),
          )

          const lessonTitle =
            typeof doc.title === 'string' ? doc.title : 'A new lesson was published.'
          const createJobs = recipientIds
            .filter((recipientId) => !existingRecipients.has(recipientId))
            .map(async (recipientId) => {
              const shouldNotify = await canReceiveNotification(
                req.payload,
                recipientId,
                'new_content',
              )
              if (!shouldNotify) return null

              return req.payload.create({
                collection: 'notifications',
                overrideAccess: true,
                data: {
                  recipient: recipientId,
                  type: 'new_content',
                  title: 'New lesson available',
                  body: lessonTitle,
                  link: lessonLink,
                  read: false,
                } as never,
              })
            })

          const results = await Promise.allSettled(createJobs)
          const failures = results.filter((result) => result.status === 'rejected')
          if (failures.length > 0) {
            req.payload.logger.error(
              `Failed to create ${failures.length} publish notifications for lesson ${String(doc.id)}.`,
            )
          }
        } catch (error) {
          req.payload.logger.error({
            err: error,
            msg: `Failed publish notification fan-out for lesson ${String(doc?.id)}`,
          })
        }
      },
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
        } else if (typeof data.slug === 'string') {
          data.slug = slugify(data.slug)
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
              name: 'lessonSetupGuide',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/views/ContentCreateGuideField#default',
                },
              },
            },
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
                hidden: true,
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'difficulty',
              label: 'Difficulty',
              type: 'select',
              options: [
                { label: 'Intro', value: 'intro' },
                { label: 'Easy', value: 'easy' },
                { label: 'Medium', value: 'medium' },
                { label: 'Hard', value: 'hard' },
              ],
              admin: {
                description:
                  'Surfaces as a pill in the lesson header so students know what to expect.',
              },
            },
            {
              name: 'objectives',
              label: 'Learning objectives',
              type: 'array',
              labels: { singular: 'Objective', plural: 'Objectives' },
              fields: [
                {
                  name: 'text',
                  label: 'Objective',
                  type: 'text',
                  required: true,
                },
              ],
              admin: {
                description:
                  'Rendered under the title as a "You will learn" list. Keep each bullet short — one outcome.',
              },
            },
            {
              name: 'summary',
              label: 'Recap summary',
              type: 'textarea',
              admin: {
                description:
                  'Shown on the end-of-lesson recap card. Leave blank to fall back to a list of section titles.',
              },
            },
            {
              name: 'chapter',
              label: 'Chapter',
              type: 'relationship',
              relationTo: 'chapters',
              required: true,
              admin: {
                description: 'Pre-filled when you add a lesson from a chapter row.',
              },
            },

            // 🔹 NEW: slug used in /classes/[classSlug]/lessons/[lessonSlug]
            {
              name: 'slug',
              type: 'text',
              required: true,
              validate: async (
                value: unknown,
                options?: {
                  data?: { chapter?: unknown }
                  req?: PayloadRequest
                  id?: string | number
                },
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
                description:
                  'Auto-generated from the lesson title. Must be unique within a chapter.',
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
              blocks: lessonBlocks,
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
      ],
    },
  ],
}
