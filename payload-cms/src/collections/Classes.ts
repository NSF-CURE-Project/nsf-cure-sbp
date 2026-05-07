import type { CollectionConfig } from 'payload'
import { ensureUniqueSlug, slugify } from '../utils/slug'

export const Classes: CollectionConfig = {
  slug: 'classes',
  labels: {
    singular: 'Course',
    plural: 'Courses',
  },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'slug'],
    preview: ({ data }) => {
      const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
      const secret = process.env.PREVIEW_SECRET ?? ''
      const slug = (data as { slug?: string })?.slug ?? ''
      const search = new URLSearchParams({
        secret,
        type: 'class',
        slug,
      })
      return `${base}/api/preview?${search.toString()}`
    },
  },
  access: {
    read: () => true,
  },
  // Disable versions/drafts to avoid version tables
  versions: false,
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) return data
        if (
          operation === 'create' &&
          typeof data.order === 'number' &&
          Number.isFinite(data.order) &&
          data.order <= 0
        ) {
          data.order = null
        }
        if (data.order == null && originalDoc?.order != null) {
          data.order = originalDoc.order
        }
        if (data.order == null && req?.payload && !originalDoc) {
          const existing = await req.payload.find({
            collection: 'classes',
            depth: 0,
            limit: 1,
            sort: '-order',
          })
          const maxOrder = existing.docs.length > 0 ? Number(existing.docs[0].order ?? 0) : 0
          data.order = maxOrder + 1
        }
        if (!data.slug) {
          const title = data.title ?? originalDoc?.title ?? ''
          const base = slugify(String(title))
          data.slug = await ensureUniqueSlug({
            base,
            collection: 'classes',
            req,
            id: originalDoc?.id,
          })
        } else if (typeof data.slug === 'string') {
          data.slug = slugify(data.slug)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        if (!req?.payload || id == null) return
        const chapters = await req.payload.find({
          collection: 'chapters',
          depth: 0,
          limit: 1,
          where: { class: { equals: id } },
        })
        if (chapters.totalDocs > 0) {
          throw new Error(
            `Cannot delete course: ${chapters.totalDocs} chapter(s) still reference it. Move or delete those chapters first.`,
          )
        }

        const classrooms = await req.payload.find({
          collection: 'classrooms',
          depth: 0,
          limit: 1,
          where: { class: { equals: id } },
        })

        if (classrooms.totalDocs > 0) {
          throw new Error(
            `Cannot delete course: ${classrooms.totalDocs} classroom(s) still reference it. Reassign or delete those classrooms first.`,
          )
        }
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        if (!data || operation !== 'create' || !req?.payload) return data
        const desiredOrder =
          typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : null
        if (!desiredOrder) return data
        const existing = await req.payload.find({
          collection: 'classes',
          depth: 0,
          limit: 1000,
          sort: '-order',
          where: {
            order: { greater_than_equal: desiredOrder },
          },
        })
        for (const doc of existing.docs) {
          const currentOrder =
            typeof doc.order === 'number' && Number.isFinite(doc.order) ? doc.order : desiredOrder
          await req.payload.update({
            collection: 'classes',
            id: doc.id,
            data: {
              order: currentOrder + 1,
            },
            depth: 0,
          })
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'courseSetupGuide',
      type: 'ui',
      admin: {
        components: {
          Field: '@/views/CourseCreateGuideField#default',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description:
          'Use the staff-facing course name, such as "Statics Fundamentals" or "Mechanics of Materials".',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description:
          'Optional short summary for staff context. You can refine it later after the course is created.',
      },
    },
    // 🔽 NEW: Sidebar ordering
    {
      name: 'order',
      label: 'Sidebar order',
      type: 'number',
      required: false,
      admin: {
        hidden: true,
      },
    },

    {
      name: 'chapters',
      label: 'Chapters',
      type: 'relationship',
      relationTo: 'chapters', // must match Chapters.slug
      hasMany: true,
      admin: {
        hidden: true,
      },
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
  ],
}
