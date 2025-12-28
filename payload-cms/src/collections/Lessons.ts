import type { CollectionConfig } from 'payload'
import { pageBlocks } from '../blocks/pageBlocks'
import { ensureUniqueSlug, slugify } from '../utils/slug'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['order', 'title', 'chapter', 'updatedAt'],
    defaultSort: 'order',
    preview: {
      url: ({ data }) => {
        const lessonSlug = data?.slug ?? ''
        const classSlug =
          (typeof data?.class === 'object' && (data.class as any)?.slug) ||
          (typeof data?.chapter === 'object' &&
            (data.chapter as any)?.class &&
            typeof (data.chapter as any).class === 'object' &&
            (data.chapter as any).class.slug) ||
          ''
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
    livePreview: {
      url: ({ data }) => {
        const lessonSlug = data?.slug ?? ''
        const classSlug =
          (typeof data?.class === 'object' && (data.class as any)?.slug) ||
          (typeof data?.chapter === 'object' &&
            (data.chapter as any)?.class &&
            typeof (data.chapter as any).class === 'object' &&
            (data.chapter as any).class.slug) ||
          ''
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
    beforeValidate: [
      async ({ data, req, originalDoc, id }) => {
        if (!data) return data
        if (!data.slug) {
          const title = data.title ?? originalDoc?.title ?? ''
          const base = slugify(String(title))
          const chapter = data.chapter ?? originalDoc?.chapter
          const chapterId =
            typeof chapter === 'object' && chapter !== null ? (chapter as any).id : chapter
          data.slug = await ensureUniqueSlug({
            base,
            collection: 'lessons',
            req,
            id,
            where: chapterId ? { chapter: { equals: chapterId } } : undefined,
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
      relationTo: 'chapters' as any,
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
      validate: async (value, { data, req, id }) => {
        if (!value || typeof value !== 'string') return 'Slug is required.'
        const chapter = data?.chapter
        const chapterId =
          typeof chapter === 'object' && chapter !== null ? (chapter as any).id : chapter
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
}
