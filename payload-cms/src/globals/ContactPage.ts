import type { GlobalConfig } from 'payload';

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact Page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroTitle',
      label: 'Hero title',
      type: 'text',
      required: true,
      defaultValue: 'Contact Us',
    },
    {
      name: 'heroIntro',
      label: 'Hero description',
      type: 'textarea',
    },
    {
      name: 'contacts',
      label: 'Contacts',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { label: 'Staff', value: 'staff' },
            { label: 'Technical', value: 'technical' },
          ],
          defaultValue: 'staff',
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'text',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'text',
        },
        {
          name: 'photo',
          label: 'Photo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
};
