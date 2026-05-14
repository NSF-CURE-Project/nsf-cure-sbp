import type { Block } from 'payload'

const sectionTitleBlock: Block = {
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
}

const richTextBlock: Block = {
  slug: 'richTextBlock',
  labels: { singular: 'Rich Text', plural: 'Rich Text' },
  fields: [
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
  ],
}

const textSectionBlock: Block = {
  slug: 'textSection',
  labels: { singular: 'Text Section', plural: 'Text Sections' },
  fields: [
    {
      name: 'title',
      type: 'text',
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
    {
      name: 'body',
      type: 'richText',
    },
  ],
}

const videoBlock: Block = {
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
}

const listBlock: Block = {
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
}

const stepsListBlock: Block = {
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
}

const buttonBlock: Block = {
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
}

const quizBlock: Block = {
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
      admin: {
        allowCreate: true,
        allowEdit: true,
        description: 'Attach a quiz to this lesson section or create a new one.',
      },
    },
    {
      name: 'showTitle',
      label: 'Show quiz title',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showAnswers',
      label: 'Show answers after submit',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'maxAttempts',
      label: 'Max attempts',
      type: 'number',
      min: 0,
      admin: {
        description: 'Leave blank for unlimited attempts.',
      },
    },
    {
      name: 'timeLimitSec',
      label: 'Time limit (seconds)',
      type: 'number',
      min: 0,
      admin: {
        description: 'Overrides the quiz time limit for this lesson section if set.',
      },
    },
  ],
}

const heroBlock: Block = {
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
}

const resourcesListBlock: Block = {
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
}

const contactsListBlock: Block = {
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
}

// ────────────────────────────────────────────────────────────────────
// Learning blocks — instructional content surfaces (callouts, worked
// examples, checkpoints, definitions, summaries). Authored from the
// custom lesson editor, rendered with their own visual identity on the
// web side so the lesson reads less like a blog post.
// ────────────────────────────────────────────────────────────────────

const calloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'variant',
      label: 'Variant',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Tip', value: 'tip' },
        { label: 'Warning', value: 'warning' },
        { label: 'Key concept', value: 'key' },
      ],
    },
    { name: 'title', label: 'Title (optional)', type: 'text' },
    {
      name: 'body',
      label: 'Body',
      type: 'textarea',
      required: true,
    },
  ],
}

const definitionBlock: Block = {
  slug: 'definition',
  labels: { singular: 'Definition', plural: 'Definitions' },
  fields: [
    {
      name: 'term',
      label: 'Term',
      type: 'text',
      required: true,
    },
    {
      name: 'definition',
      label: 'Definition',
      type: 'textarea',
      required: true,
    },
  ],
}

const workedExampleBlock: Block = {
  slug: 'workedExample',
  labels: { singular: 'Worked Example', plural: 'Worked Examples' },
  fields: [
    {
      name: 'title',
      label: 'Title (optional)',
      type: 'text',
    },
    {
      name: 'problem',
      label: 'Problem',
      type: 'textarea',
      required: true,
    },
    {
      name: 'steps',
      label: 'Steps',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Step', plural: 'Steps' },
      fields: [
        {
          name: 'text',
          label: 'Step',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'finalAnswer',
      label: 'Final answer (optional)',
      type: 'text',
      admin: {
        description: 'Surfaces as a highlighted result line under the steps.',
      },
    },
  ],
}

const checkpointBlock: Block = {
  slug: 'checkpoint',
  labels: { singular: 'Checkpoint', plural: 'Checkpoints' },
  fields: [
    {
      name: 'prompt',
      label: 'Prompt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'answer',
      label: 'Answer',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Hidden behind a "Reveal answer" toggle on the public page.',
      },
    },
    {
      name: 'hint',
      label: 'Hint (optional)',
      type: 'textarea',
    },
  ],
}

const lessonSummaryBlock: Block = {
  slug: 'lessonSummary',
  labels: { singular: 'Summary', plural: 'Summaries' },
  fields: [
    {
      name: 'title',
      label: 'Title (optional)',
      type: 'text',
    },
    {
      name: 'points',
      label: 'Key takeaways',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Takeaway', plural: 'Takeaways' },
      fields: [
        {
          name: 'text',
          label: 'Takeaway',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}

export const lessonBlocks: Block[] = [
  textSectionBlock,
  sectionTitleBlock,
  richTextBlock,
  videoBlock,
  listBlock,
  stepsListBlock,
  buttonBlock,
  calloutBlock,
  definitionBlock,
  workedExampleBlock,
  checkpointBlock,
  lessonSummaryBlock,
  quizBlock,
]

export const pageBlocks: Block[] = [
  heroBlock,
  textSectionBlock,
  sectionTitleBlock,
  richTextBlock,
  videoBlock,
  listBlock,
  stepsListBlock,
  buttonBlock,
  resourcesListBlock,
  contactsListBlock,
]
