import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  admin: {
    group: 'Admin',
    preview: {
      url: () => {
        const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
        const search = new URLSearchParams({
          secret: process.env.PREVIEW_SECRET ?? '',
          type: 'footer',
          ts: Date.now().toString(),
        })
        return `${base}/api/preview?${search.toString()}`
      },
    },
    livePreview: {
      url: () => {
        const base = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
        const search = new URLSearchParams({
          secret: process.env.PREVIEW_SECRET ?? '',
          type: 'footer',
          ts: Date.now().toString(),
        })
        return `${base}/api/preview?${search.toString()}`
      },
    },
  },
  fields: [
    {
      name: 'exploreLinks',
      label: 'Explore links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'resourcesLinks',
      label: 'Resources links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'connect',
      label: 'Connect',
      type: 'group',
      fields: [
        { name: 'email', type: 'text' },
        {
          name: 'address',
          type: 'textarea',
          admin: {
            description: 'Use line breaks for multi-line addresses.',
          },
        },
        { name: 'externalLabel', type: 'text' },
        { name: 'externalUrl', type: 'text' },
      ],
    },
    {
      name: 'feedback',
      label: 'Feedback',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'buttonLabel', type: 'text' },
      ],
    },
    {
      name: 'bottom',
      label: 'Footer bottom',
      type: 'group',
      fields: [
        {
          name: 'copyrightLine',
          type: 'text',
          admin: {
            description: 'Use {year} to insert the current year.',
          },
        },
        { name: 'subLine', type: 'text' },
      ],
    },
  ],
}
