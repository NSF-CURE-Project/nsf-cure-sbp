import type { CollectionConfig, PayloadRequest, Where } from 'payload'

const isReportingStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const ReportingSavedViews: CollectionConfig = {
  slug: 'reporting-saved-views',
  defaultSort: '-updatedAt',
  admin: {
    useAsTitle: 'label',
    group: 'Reporting',
    defaultColumns: ['label', 'owner', 'reportType', 'isShared', 'updatedAt'],
  },
  access: {
    read: ({ req }) => {
      if (!isReportingStaff(req)) return false
      if (req.user?.role === 'admin' || req.user?.role === 'staff') return true
      const where: Where = {
        or: [
          {
            owner: {
              equals: req.user?.id,
            },
          },
          {
            isShared: {
              equals: true,
            },
          },
        ],
      }
      return where
    },
    create: ({ req }) => isReportingStaff(req),
    update: ({ req }) => {
      if (!isReportingStaff(req)) return false
      if (req.user?.role === 'admin' || req.user?.role === 'staff') return true
      const where: Where = {
        owner: {
          equals: req.user?.id,
        },
      }
      return where
    },
    delete: ({ req }) => isReportingStaff(req),
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data
        const owner = req?.user?.collection === 'users' ? req.user.id : null
        return {
          ...data,
          owner: data.owner ?? owner,
        }
      },
    ],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'isShared',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'reportType',
      type: 'select',
      defaultValue: 'custom',
      options: [
        { label: 'Annual', value: 'annual' },
        { label: 'Final', value: 'final' },
        { label: 'Internal', value: 'internal' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'reportingPeriod',
      type: 'relationship',
      relationTo: 'reporting-periods',
    },
    {
      name: 'startDate',
      type: 'date',
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'filters',
      type: 'json',
      required: true,
    },
    {
      name: 'metricKeys',
      type: 'array',
      fields: [
        {
          name: 'metricKey',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
