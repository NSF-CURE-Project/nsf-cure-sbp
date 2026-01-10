import type { CollectionConfig } from 'payload'

import { pageBlocks } from '../blocks/pageBlocks'
import { ensureUniqueSlug, slugify } from '../utils/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  defaultSort: 'navOrder',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['navOrder', 'title', 'slug', 'updatedAt'],
    group: 'Main Pages',
    preview: ({ data }) => {
      const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
      const secret = process.env.PREVIEW_SECRET ?? ''
      const slug = (data as { slug?: string })?.slug ?? ''
      const search = new URLSearchParams({
        secret,
        type: 'page',
        slug,
        ts: Date.now().toString(),
      })
      return `${base}/api/preview?${search.toString()}`
    },
    livePreview: {
      url: ({ data }) => {
        const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
        const secret = process.env.PREVIEW_SECRET ?? ''
        const slug = (data as { slug?: string })?.slug ?? ''
        const search = new URLSearchParams({
          secret,
          type: 'page',
          slug,
          ts: Date.now().toString(),
        })
        return `${base}/api/preview?${search.toString()}`
      },
    },
  },
  access: {
    read: () => true,
    create: ({ req }) =>
      req.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req.user?.role ?? ''),
    update: ({ req }) =>
      req.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req.user?.role ?? ''),
    delete: ({ req }) =>
      req.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req.user?.role ?? ''),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data
        if (!data.slug) {
          const title = data.title ?? originalDoc?.title ?? ''
          const normalizedTitle = String(title).trim().toLowerCase()
          const base =
            normalizedTitle === 'home' || normalizedTitle === 'home page'
              ? 'home'
              : slugify(String(title))
          data.slug = await ensureUniqueSlug({
            base,
            collection: 'pages',
            req,
            id: originalDoc?.id,
          })
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'pageOrderGuide',
      type: 'ui',
      admin: {
        components: {
          Field: '@/views/PageOrderField#default',
        },
      },
    },
    {
      name: 'navOrder',
      label: 'Navigation Order',
      type: 'number',
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Managed from the Reorder pages list.',
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: "Auto-generated from the page title. Use 'Home' to create the homepage slug.",
        hidden: true,
      },
    },
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
        description: 'Build the page by adding and reordering content blocks.',
      },
    },
  ],
}
