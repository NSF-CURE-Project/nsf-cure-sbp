import type { CollectionConfig } from 'payload';

export const Classes: CollectionConfig = {
  slug: 'classes',
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
      name: 'description',
      type: 'textarea',
    },
    {

      name: 'chapters',
      label: 'Chapters',
      type: 'relationship',
      relationTo: 'chapters' as any, // must match Modules.slug
      hasMany: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
};
