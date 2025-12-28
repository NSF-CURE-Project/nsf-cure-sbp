import type { CollectionConfig } from 'payload'
import { ensureUniqueSlug, slugify } from '../utils/slug'

export const Chapters: CollectionConfig = {
  slug: 'chapters',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, originalDoc, req }) => {
        if (!req?.payload) return
        const nextClass = doc?.class
        const prevClass = originalDoc?.class

        const getId = (value: unknown) =>
          typeof value === 'object' && value !== null && 'id' in value
            ? String((value as { id?: string | number }).id ?? '')
            : value != null
              ? String(value)
              : null

        const nextClassId = getId(nextClass)
        const prevClassId = getId(prevClass)

        if (!nextClassId) return

        const attachChapter = async (classId: string) => {
          const current = await req.payload.findByID({
            collection: 'classes',
            id: classId,
            depth: 0,
          })
          const existing = Array.isArray((current as { chapters?: unknown[] }).chapters)
            ? (current as { chapters?: unknown[] }).chapters
            : []
          const exists = existing.some((item) => getId(item) === String(doc.id))
          if (exists) return
          await req.payload.update({
            collection: 'classes',
            id: classId,
            data: {
              chapters: [...existing, doc.id],
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
            ? (current as { chapters?: unknown[] }).chapters
            : []
          const filtered = existing.filter((item) => getId(item) !== String(doc.id))
          if (filtered.length === existing.length) return
          await req.payload.update({
            collection: 'classes',
            id: classId,
            data: {
              chapters: filtered,
            },
            depth: 0,
          })
        }

        if (prevClassId && prevClassId !== nextClassId) {
          await detachChapter(prevClassId)
        }

        await attachChapter(nextClassId)
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (!req?.payload || !doc) return
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
          ? (current as { chapters?: unknown[] }).chapters
          : []
        const filtered = existing.filter((item) => getId(item) !== String(doc.id))
        if (filtered.length === existing.length) return

        await req.payload.update({
          collection: 'classes',
          id: classId,
          data: {
            chapters: filtered,
          },
          depth: 0,
        })
      },
    ],
    beforeValidate: [
      async ({ data, req, originalDoc, id }) => {
        if (!data) return data
        if (!data.slug) {
          const title = data.title ?? originalDoc?.title ?? ''
          const base = slugify(String(title))
          data.slug = await ensureUniqueSlug({
            base,
            collection: 'chapters',
            req,
            id,
          })
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'lessonOrderGuide',
      type: 'ui',
      admin: {
        components: {
          Field: '@/views/ChapterLessonOrderField#default',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'chapterNumber',
      label: 'Chapter number',
      type: 'number',
      min: 1,
      admin: {
        description: 'Shown as Ch {number} in the sidebar.',
      },
    },
    {
      name: 'lessons',
      label: 'Lessons',
      type: 'relationship',
      relationTo: 'lessons' as any, // each chapter can link to many lessons
      hasMany: true,
    },
    {
      name: 'class',
      label: 'Class',
      type: 'relationship',
      relationTo: 'classes' as any, // many chapters → one class
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
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
  ],
}
