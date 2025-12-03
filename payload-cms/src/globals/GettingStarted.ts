import type { GlobalConfig } from 'payload';

export const GettingStarted: GlobalConfig = {
  slug: 'getting-started',
  label: 'Getting Started',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      label: 'Page title',
      type: 'text',
      required: true,
      defaultValue: 'Getting Started',
    },
    {
      name: 'intro',
      label: 'Introduction',
      type: 'richText',
    },
    {
      name: 'steps',
      label: 'Steps',
      type: 'array',
      fields: [
        {
          name: 'heading',
          label: 'Step heading',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          label: 'Step description',
          type: 'richText',
        },
      ],
    },
    {
      name: 'resources',
      label: 'Helpful resources',
      type: 'array',
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
