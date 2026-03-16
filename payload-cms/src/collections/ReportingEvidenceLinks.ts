import type { CollectionConfig, PayloadRequest } from 'payload'

const isReportingStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const ReportingEvidenceLinks: CollectionConfig = {
  slug: 'reporting-evidence-links',
  defaultSort: '-updatedAt',
  admin: {
    useAsTitle: 'title',
    group: 'Reporting',
    defaultColumns: ['title', 'evidenceType', 'rpprSection', 'updatedAt'],
  },
  access: {
    read: ({ req }) => isReportingStaff(req),
    create: ({ req }) => isReportingStaff(req),
    update: ({ req }) => isReportingStaff(req),
    delete: ({ req }) => req.user?.collection === 'users' && req.user.role === 'admin',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        return {
          ...data,
          occurredAt: data.occurredAt ?? new Date().toISOString(),
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'evidenceType',
      type: 'select',
      options: [
        { label: 'Curriculum change', value: 'curriculum_change' },
        { label: 'Intervention', value: 'intervention' },
        { label: 'Product/resource', value: 'product_resource' },
        { label: 'External publication', value: 'publication' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'rpprSection',
      type: 'select',
      options: [
        { label: 'Accomplishments', value: 'accomplishments' },
        { label: 'Products', value: 'products' },
        { label: 'Participants / Organizations', value: 'participantsOrganizations' },
        { label: 'Impact', value: 'impact' },
        { label: 'Changes / Problems', value: 'changesProblems' },
        { label: 'Special Requirements', value: 'specialRequirements' },
      ],
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'impactNote',
      type: 'textarea',
    },
    {
      name: 'reportingPeriod',
      type: 'relationship',
      relationTo: 'reporting-periods',
    },
    {
      name: 'linkedArtifacts',
      type: 'relationship',
      relationTo: ['classes', 'lessons', 'quizzes', 'pages', 'quiz-questions'],
      hasMany: true,
    },
    {
      name: 'linkedSnapshot',
      type: 'relationship',
      relationTo: 'reporting-snapshots',
    },
    {
      name: 'linkedRpprReport',
      type: 'relationship',
      relationTo: 'rppr-reports',
    },
    {
      name: 'occurredAt',
      type: 'date',
    },
  ],
}
