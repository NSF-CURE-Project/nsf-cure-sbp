import type { CollectionConfig, PayloadRequest } from 'payload'

const isReportingStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const ReportingProductRecords: CollectionConfig = {
  slug: 'reporting-product-records',
  defaultSort: '-reportedAt',
  admin: {
    useAsTitle: 'title',
    group: 'Reporting',
    defaultColumns: ['title', 'productType', 'reportedAt', 'reportingPeriod', 'updatedAt'],
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
          reportedAt: data.reportedAt ?? new Date().toISOString(),
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
      name: 'productType',
      type: 'select',
      required: true,
      options: [
        { label: 'Publication', value: 'publication' },
        { label: 'Patent', value: 'patent' },
        { label: 'Dataset', value: 'dataset' },
        { label: 'Software', value: 'software' },
        { label: 'Educational material', value: 'educational_material' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'citation',
      type: 'textarea',
      admin: {
        description: 'Formal citation or product description used for RPPR products section.',
      },
    },
    {
      name: 'identifier',
      type: 'text',
      admin: {
        description: 'DOI, patent number, accession ID, or other stable identifier.',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'Public URL where the product can be reviewed.',
      },
    },
    {
      name: 'reportingPeriod',
      type: 'relationship',
      relationTo: 'reporting-periods',
    },
    {
      name: 'linkedRpprReport',
      type: 'relationship',
      relationTo: 'rppr-reports',
    },
    {
      name: 'linkedArtifacts',
      type: 'relationship',
      relationTo: ['classes', 'lessons', 'quizzes', 'pages', 'quiz-questions'],
      hasMany: true,
    },
    {
      name: 'reportedAt',
      type: 'date',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
