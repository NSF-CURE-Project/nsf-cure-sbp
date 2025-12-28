import type { CollectionConfig } from 'payload'
import { ensureUniqueSlug, slugify } from '../utils/slug'

export const Classes: CollectionConfig = {
  slug: 'classes',
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'slug'],
    preview: {
      url: ({ data }) => {
        const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
        const secret = process.env.PREVIEW_SECRET ?? ''
        const search = new URLSearchParams({
          secret,
          type: 'class',
          slug: data?.slug ?? '',
        })
        return `${base}/api/preview?${search.toString()}`
      },
    },
  },
  access: {
    read: () => true,
  },
  // Disable versions/drafts to avoid version tables
  versions: false,
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc, id, operation }) => {
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
            id,
          })
        }
        return data
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'classOrderGuide',
      type: 'ui',
      admin: {
        components: {
          Field: '@/views/ClassOrderField#default',
        },
      },
    },

    // 🔽 NEW: Sidebar ordering
    {
      name: 'order',
      label: 'Sidebar order',
      type: 'number',
      required: false,
      admin: {
        position: 'sidebar',
        description: 'Managed from the Reorder classes list.',
        readOnly: true,
      },
    },

    {
      name: 'chapters',
      label: 'Chapters',
      type: 'relationship',
      relationTo: 'chapters' as any, // must match Chapters.slug
      hasMany: true,
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
