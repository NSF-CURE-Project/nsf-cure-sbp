import type { Block } from 'payload'

export const pageBlocks: Block[] = [
  {
    slug: 'heroBlock',
    labels: { singular: 'Hero', plural: 'Heroes' },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'subtitle',
        type: 'textarea',
      },
      {
        name: 'buttonLabel',
        type: 'text',
      },
      {
        name: 'buttonHref',
        type: 'text',
      },
    ],
  },
  {
    slug: 'sectionTitle',
    labels: { singular: 'Section Title', plural: 'Section Titles' },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'subtitle',
        type: 'textarea',
      },
      {
        name: 'size',
        type: 'select',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
        defaultValue: 'md',
      },
    ],
  },
  {
    slug: 'sectionBlock',
    labels: { singular: 'Section', plural: 'Sections' },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'text',
        type: 'richText',
      },
      {
        name: 'size',
        type: 'select',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
        defaultValue: 'md',
      },
    ],
  },
  {
    slug: 'richTextBlock',
    labels: { singular: 'Rich Text', plural: 'Rich Text' },
    fields: [
      {
        name: 'body',
        type: 'richText',
        required: true,
      },
    ],
  },
  {
    slug: 'textBlock',
    labels: { singular: 'Text', plural: 'Text' },
    fields: [
      {
        name: 'text',
        type: 'textarea',
      },
    ],
  },
  {
    slug: 'videoBlock',
    labels: { singular: 'Video', plural: 'Videos' },
    fields: [
      {
        name: 'video',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'url',
        label: 'External URL (optional)',
        type: 'text',
      },
      {
        name: 'caption',
        type: 'text',
      },
    ],
  },
  {
    slug: 'listBlock',
    labels: { singular: 'List', plural: 'Lists' },
    fields: [
      {
        name: 'title',
        type: 'text',
      },
      {
        name: 'listStyle',
        type: 'select',
        options: [
          { label: 'Unordered', value: 'unordered' },
          { label: 'Ordered', value: 'ordered' },
        ],
        defaultValue: 'unordered',
      },
      {
        name: 'items',
        type: 'array',
        fields: [
          {
            name: 'text',
            type: 'text',
          },
        ],
      },
    ],
  },
  {
    slug: 'stepsList',
    labels: { singular: 'Steps List', plural: 'Steps Lists' },
    fields: [
      {
        name: 'title',
        type: 'text',
      },
      {
        name: 'steps',
        type: 'array',
        fields: [
          {
            name: 'heading',
            type: 'text',
            required: true,
          },
          {
            name: 'description',
            type: 'richText',
          },
        ],
      },
    ],
  },
  {
    slug: 'buttonBlock',
    labels: { singular: 'Button', plural: 'Buttons' },
    fields: [
      {
        name: 'label',
        type: 'text',
        required: true,
      },
      {
        name: 'href',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    slug: 'resourcesList',
    labels: { singular: 'Resources List', plural: 'Resources Lists' },
    fields: [
      {
        name: 'title',
        type: 'text',
      },
      {
        name: 'description',
        type: 'textarea',
      },
      {
        name: 'resources',
        type: 'array',
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
            name: 'url',
            type: 'text',
            required: true,
          },
          {
            name: 'type',
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
  {
    slug: 'contactsList',
    labels: { singular: 'Contacts List', plural: 'Contacts Lists' },
    fields: [
      {
        name: 'title',
        type: 'text',
      },
      {
        name: 'description',
        type: 'textarea',
      },
      {
        name: 'groupByCategory',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        name: 'contacts',
        type: 'array',
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true,
          },
          {
            name: 'title',
            type: 'text',
          },
          {
            name: 'category',
            type: 'select',
            options: [
              { label: 'Staff', value: 'staff' },
              { label: 'Technical', value: 'technical' },
            ],
            defaultValue: 'staff',
          },
          {
            name: 'phone',
            type: 'text',
          },
          {
            name: 'email',
            type: 'text',
          },
          {
            name: 'photo',
            type: 'upload',
            relationTo: 'media',
          },
        ],
      },
    ],
  },
  {
    slug: 'quizBlock',
    labels: { singular: 'Quiz', plural: 'Quizzes' },
    fields: [
      {
        name: 'title',
        type: 'text',
      },
      {
        name: 'quiz',
        type: 'relationship',
        relationTo: 'quizzes',
        required: true,
      },
      {
        name: 'showTitle',
        label: 'Show quiz title',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
]
