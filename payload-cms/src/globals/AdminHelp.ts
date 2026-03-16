import type { GlobalConfig } from 'payload'

export const AdminHelp: GlobalConfig = {
  slug: 'admin-help',
  label: 'Admin Help',
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) =>
      req.user?.collection === 'users' && (req.user?.role === 'admin' || req.user?.role === 'staff'),
  },
  versions: {
    drafts: true,
  },
  admin: {
    group: 'Settings',
    description: 'Guidance content shown on the admin Help page.',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      defaultValue: 'Help & Support',
      required: true,
    },
    {
      name: 'subtitle',
      label: 'Subtitle',
      type: 'textarea',
      defaultValue:
        'Find quick guidance, reporting references, and escalation paths for the admin dashboard.',
    },
    {
      name: 'quickActions',
      label: 'Quick actions',
      type: 'json',
      defaultValue: [
        {
          label: 'Getting Started',
          desc: 'Core dashboard orientation, navigation, and common workflows.',
          href: '/admin',
        },
        {
          label: 'Reporting Guide',
          desc: 'Period setup, RPPR checks, exports, and readiness expectations.',
          href: '/admin/reporting',
        },
        {
          label: 'Account & Access',
          desc: 'Profile settings, role boundaries, and access troubleshooting.',
          href: '/admin/account',
        },
      ],
      admin: {
        description:
          'JSON array: [{ "label": string, "desc": string, "href": string }].',
      },
    },
    {
      name: 'topicChips',
      label: 'Topic chips',
      type: 'json',
      defaultValue: ['Reporting', 'Courses', 'Classrooms', 'Quizzes', 'Troubleshooting'],
      admin: {
        description: 'JSON array of strings for topic tags.',
      },
    },
    {
      name: 'faqs',
      label: 'FAQ items',
      type: 'json',
      defaultValue: [
        {
          question: 'How do I prepare a reporting period for RPPR?',
          answer:
            'Create/activate a reporting period first, then open Reporting Center, review the compliance checklist, and resolve missing/partial items before export.',
        },
        {
          question: 'Where do I update participant RPPR metadata?',
          answer:
            'Use Accounts to complete participant type, project role, and organization fields. Incomplete participant metadata is flagged in Data Quality.',
        },
      ],
      admin: {
        description: 'JSON array: [{ "question": string, "answer": string }].',
      },
    },
    {
      name: 'supportEmail',
      label: 'Support email',
      type: 'text',
      defaultValue: 'sbp-support@cpp.edu',
    },
    {
      name: 'supportResponseTarget',
      label: 'Support response target',
      type: 'text',
      defaultValue: 'Within 1 business day',
    },
    {
      name: 'supportRequestHref',
      label: 'Support request link',
      type: 'text',
      defaultValue: '/admin/collections/feedback/create',
      admin: {
        description: 'Relative admin path or full URL.',
      },
    },
    {
      name: 'resources',
      label: 'Resource cards',
      type: 'json',
      defaultValue: [
        {
          label: 'Admin Documentation',
          desc: 'Internal guidance and help content',
          href: '/admin/help',
        },
        {
          label: 'Reporting Center',
          desc: 'RPPR and period exports',
          href: '/admin/reporting',
        },
        {
          label: 'Site Management',
          desc: 'Navigation and global pages',
          href: '/admin/site-management',
        },
      ],
      admin: {
        description:
          'JSON array: [{ "label": string, "desc": string, "href": string }].',
      },
    },
    {
      name: 'body',
      label: 'Help content',
      type: 'richText',
    },
  ],
}
