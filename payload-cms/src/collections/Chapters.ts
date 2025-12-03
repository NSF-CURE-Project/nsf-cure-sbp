import type { CollectionConfig } from 'payload';

export const Chapters: CollectionConfig = {
  slug: 'chapters',
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
      name: 'lessons',
      label: 'Lessons',
      type: 'relationship',
      relationTo: 'lessons' as any, // each chapter can link to many lessons
      hasMany: true,
    },
    {
      name: 'class',
      label: 'Class',
      type: 'relationship',
      relationTo: 'classes' as any, // many chapters → one class
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'objective',
      type: 'richText', // same as before, just now “chapter objective”
    },
  ],
};
