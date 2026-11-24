import type { CollectionConfig } from 'payload'

import { pageBlocks } from '../blocks/pageBlocks'
import { ensureUniqueSlug, slugify } from '../utils/slug'

const isStaff = (req?: { user?: { collection?: string | null; role?: string | null } | null }) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const Pages: CollectionConfig = {
  slug: 'pages',
  defaultSort: 'navOrder',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['navOrder', 'title', 'slug', 'updatedAt'],
    group: 'Main Pages',
    // Canonical UI lives at /admin/pages — see views/pages/*.
    // Keep this hidden so /admin/collections/pages doesn't render the
    // generic Payload list/edit forms in parallel.
    hidden: true,
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
    create: ({ req }) => isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isStaff(req),
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
      name: 'pageSetupGuide',
      type: 'ui',
      admin: {
        components: {
          Field: '@/views/ContentCreateGuideField#default',
        },
      },
    },
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
      name: 'hidden',
      label: 'Hidden from public site',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'When enabled, this page is removed from the public navigation and its URL returns 404. Admins can still see and edit it here.',
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
