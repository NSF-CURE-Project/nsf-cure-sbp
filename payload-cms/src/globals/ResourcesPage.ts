import type { GlobalConfig } from 'payload';

export const ResourcesPage: GlobalConfig = {
  slug: 'resources-page',
  label: 'Resources Page',
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  admin: {
    preview: {
      url: () => {
        const base = process.env.WEB_PREVIEW_URL ?? "http://localhost:3001";
        const search = new URLSearchParams({
          secret: process.env.PREVIEW_SECRET ?? "",
          type: "resources",
        });
        return `${base}/api/preview?${search.toString()}`;
      },
    },
  },
  hooks: {
    beforeChange: [
      ({ data }) => ({
        ...data,
        _status: "published",
      }),
    ],
  },
  fields: [
    {
      name: 'heroTitle',
      label: 'Hero title',
      type: 'text',
      required: true,
      defaultValue: 'Additional Resources',
    },
    {
      name: 'heroIntro',
      label: 'Hero description',
      type: 'textarea',
    },
    {
      name: 'sections',
      label: 'Sections',
      type: 'array',
      fields: [
        {
          name: 'title',
          label: 'Section title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          label: 'Section description',
          type: 'textarea',
        },
        {
          name: 'resources',
          label: 'Resources',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Resource title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Resource description',
              type: 'textarea',
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              required: true,
            },
            {
              name: 'type',
              label: 'Type',
              type: 'select',
              options: [
                { label: 'Link', value: 'link' },
                { label: 'Video', value: 'video' },
                { label: 'Download', value: 'download' },
                { label: 'Other', value: 'other' },
              ],
              defaultValue: 'link',
            },
          ],
        },
      ],
    },
  ],
};
