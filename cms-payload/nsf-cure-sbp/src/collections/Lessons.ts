import type { CollectionConfig } from 'payload';

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      // Strapi `video` media field → Payload upload to Media collection
      name: 'video',
      type: 'upload',
      relationTo: 'media' as any, // assumes you have Media collection with slug 'media'
    },
    {
      // Strapi `textContent` (Markdown) → Payload richText
      name: 'textContent',
      type: 'richText',
    },
    {
      // Strapi `problemSets` component
      name: 'problemSets',
      label: 'Problem Sets',
      type: 'array', // repeatable component
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          // nested repeatable `questions` component
          name: 'questions',
          label: 'Questions',
          type: 'array',
          fields: [
            {
              name: 'questionText',
              type: 'richText', // maps Strapi markdown
              required: true,
            },
            {
              name: 'answer',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
