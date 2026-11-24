import type { CollectionConfig, PayloadRequest } from 'payload'
import { ensureUniqueSlug, slugify } from '../utils/slug'

const resolveClassId = (value: unknown): string | number | null => {
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id ?? null
  }
  if (typeof value === 'string' || typeof value === 'number') return value
  return null
}

export const Chapters: CollectionConfig = {
  slug: 'chapters',
  admin: {
    useAsTitle: 'title',
    // Managed via the custom Course Workspace; default Payload list/edit views
    // would let users create chapters detached from the wizard flow.
    hidden: true,
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (!req?.payload) return
        const runClassSyncAsync = process.env.PAYLOAD_ASYNC_CHAPTER_CLASS_SYNC !== 'false'
        const nextClass = doc?.class
        const prevClass = previousDoc?.class

        const getId = (value: unknown) =>
          typeof value === 'object' && value !== null && 'id' in value
            ? String((value as { id?: string | number }).id ?? '')
            : value != null
              ? String(value)
              : null

        const nextClassId = getId(nextClass)
        const prevClassId = getId(prevClass)

        if (!nextClassId) return
        // Avoid unnecessary class sync updates when chapter's class did not change.
        if (operation !== 'create' && prevClassId === nextClassId) return

        const attachChapter = async (classId: string) => {
          const current = await req.payload.findByID({
            collection: 'classes',
            id: classId,
            depth: 0,
          })
          const existing = Array.isArray((current as { chapters?: unknown[] }).chapters)
            ? ((current as { chapters?: unknown[] }).chapters ?? [])
            : []
          const exists = existing.some((item) => getId(item) === String(doc.id))
          if (exists) return
          await req.payload.update({
            collection: 'classes',
            id: classId,
            data: {
              chapters: [...existing, doc.id] as unknown as Array<number | { id?: number }>,
            },
            depth: 0,
          })
        }

        const detachChapter = async (classId: string) => {
          const current = await req.payload.findByID({
            collection: 'classes',
            id: classId,
            depth: 0,
          })
          const existing = Array.isArray((current as { chapters?: unknown[] }).chapters)
            ? ((current as { chapters?: unknown[] }).chapters ?? [])
            : []
          const filtered = existing.filter((item) => getId(item) !== String(doc.id))
          if (filtered.length === existing.length) return
          await req.payload.update({
            collection: 'classes',
            id: classId,
            data: {
              chapters: filtered as unknown as Array<number | { id?: number }>,
            },
            depth: 0,
          })
        }

        const syncClassRelations = async () => {
          if (prevClassId && prevClassId !== nextClassId) {
            await detachChapter(prevClassId)
          }

          await attachChapter(nextClassId)
        }

        if (runClassSyncAsync) {
          setTimeout(() => {
            void syncClassRelations().catch((error) => {
              req.payload.logger.error({
                err: error,
                msg: `Failed to sync class chapters for chapter ${String(doc.id)}`,
              })
            })
          }, 0)
          return
        }

        await syncClassRelations()
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (!req?.payload || !doc) return
        const runClassSyncAsync = process.env.PAYLOAD_ASYNC_CHAPTER_CLASS_SYNC !== 'false'
        const getId = (value: unknown) =>
          typeof value === 'object' && value !== null && 'id' in value
            ? String((value as { id?: string | number }).id ?? '')
            : value != null
              ? String(value)
              : null

        const classId = getId(doc.class)
        if (!classId) return

        const current = await req.payload.findByID({
          collection: 'classes',
          id: classId,
          depth: 0,
        })
        const existing = Array.isArray((current as { chapters?: unknown[] }).chapters)
          ? ((current as { chapters?: unknown[] }).chapters ?? [])
          : []
        const filtered = existing.filter((item) => getId(item) !== String(doc.id))
        if (filtered.length === existing.length) return

        const removeChapterFromClass = async () => {
          await req.payload.update({
            collection: 'classes',
            id: classId,
            data: {
              chapters: filtered as unknown as Array<number | { id?: number }>,
            },
            depth: 0,
          })
        }

        if (runClassSyncAsync) {
          setTimeout(() => {
            void removeChapterFromClass().catch((error) => {
              req.payload.logger.error({
                err: error,
                msg: `Failed to remove chapter ${String(doc.id)} from class ${classId}`,
              })
            })
          }, 0)
          return
        }

        await removeChapterFromClass()
      },
    ],
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data
        const classId = resolveClassId(data.class ?? originalDoc?.class)
        if (!data.slug) {
          const title = data.title ?? originalDoc?.title ?? ''
          const base = slugify(String(title))
          data.slug = await ensureUniqueSlug({
            base,
            collection: 'chapters',
            req,
            id: originalDoc?.id,
            where: classId ? { class: { equals: classId } } : undefined,
          })
        } else if (typeof data.slug === 'string') {
          data.slug = slugify(data.slug)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        // Cascade-delete every lesson under this chapter so the FK can't
        // refuse the chapter delete and the UI doesn't need a separate
        // "empty out first" step.
        if (!req?.payload || id == null) return
        try {
          await req.payload.delete({
            collection: 'lessons',
            where: { chapter: { equals: id } },
            overrideAccess: true,
          })
        } catch {
          // Bulk-delete on zero matches throws in some adapter versions —
          // safe to ignore; the chapter delete itself is the load-bearing op.
        }
      },
    ],
  },
  fields: [
    {
      name: 'chapterSetupGuide',
      type: 'ui',
      admin: {
        components: {
          Field: '@/views/ContentCreateGuideField#default',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'chapterNumber',
          label: 'Chapter number',
          type: 'number',
          min: 1,
          admin: {
            width: '16%',
            description: 'Shown as Ch {number} in the sidebar.',
          },
        },
        {
          name: 'class',
          label: 'Course',
          type: 'relationship',
          relationTo: 'classes', // many chapters → one class
          required: true,
          admin: {
            width: '34%',
            description:
              'Pre-filled from Course Workspace. Change only if this chapter belongs in a different course.',
          },
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      validate: async (
        value: unknown,
        options?: {
          data?: { class?: unknown }
          req?: PayloadRequest
          id?: string | number
        },
      ) => {
        if (!value || typeof value !== 'string') return 'Slug is required.'
        const classId = resolveClassId(options?.data?.class)
        if (!classId) return 'Select a course before setting the slug.'
        const req = options?.req
        if (!req?.payload) return true
        const existing = await req.payload.find({
          collection: 'chapters',
          depth: 0,
          limit: 1,
          where: {
            slug: { equals: value },
            class: { equals: classId },
            id: { not_equals: options?.id },
          },
        })
        if (existing.totalDocs > 0) {
          return 'Slug must be unique within this course.'
        }
        return true
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'objective',
      type: 'richText', // same as before, just now “chapter objective”
      admin: {
        description: 'Use $...$ for inline math and $$...$$ for display math.',
      },
    },
    {
      name: 'lessons',
      label: 'Lessons',
      type: 'relationship',
      relationTo: 'lessons', // each chapter can link to many lessons
      hasMany: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'chapterWorkspace',
      type: 'ui',
      admin: {
        components: {
          Field: '@/views/ChapterWorkspaceField#default',
        },
      },
    },
  ],
}
