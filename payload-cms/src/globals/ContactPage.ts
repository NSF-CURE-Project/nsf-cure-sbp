import type { GlobalConfig } from 'payload'
import { pageBlocks } from '../blocks/pageBlocks'

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact Page',
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  admin: {
    group: 'Main Pages',
    preview: {
      url: () => {
        const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
        const search = new URLSearchParams({
          secret: process.env.PREVIEW_SECRET ?? '',
          type: 'contact',
        })
        return `${base}/api/preview?${search.toString()}`
      },
    },
    livePreview: {
      url: () => {
        const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
        const search = new URLSearchParams({
          secret: process.env.PREVIEW_SECRET ?? '',
          type: 'contact',
        })
        return `${base}/api/preview?${search.toString()}`
      },
    },
  },
  fields: [
    {
      name: 'layout',
      label: 'Page layout',
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
