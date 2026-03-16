import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaffUser = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const ReportingPeriods: CollectionConfig = {
  slug: 'reporting-periods',
  admin: {
    useAsTitle: 'label',
    group: 'Reporting',
    defaultColumns: ['label', 'reportType', 'startDate', 'endDate', 'status'],
  },
  access: {
    read: ({ req }) => isStaffUser(req),
    create: ({ req }) => isStaffUser(req),
    update: ({ req }) => isStaffUser(req),
    delete: ({ req }) => req.user?.collection === 'users' && req.user.role === 'admin',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const startDate = typeof data.startDate === 'string' ? new Date(data.startDate) : null
        const endDate = typeof data.endDate === 'string' ? new Date(data.endDate) : null
        if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
          throw new Error('startDate must be before endDate.')
        }
        if (!data.label && data.startDate && data.endDate) {
          return {
            ...data,
            label: `${String(data.startDate).slice(0, 10)} to ${String(data.endDate).slice(0, 10)}`,
          }
        }
        return data
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
      name: 'budgetPeriodName',
      type: 'text',
      admin: {
        description: 'Optional award budget period label.',
      },
    },
    {
      name: 'reportType',
      type: 'select',
      required: true,
      defaultValue: 'annual',
      options: [
        { label: 'Annual', value: 'annual' },
        { label: 'Final', value: 'final' },
        { label: 'Internal', value: 'internal' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
