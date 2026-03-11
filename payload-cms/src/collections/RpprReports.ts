import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaffUser = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const RpprReports: CollectionConfig = {
  slug: 'rppr-reports',
  admin: {
    useAsTitle: 'title',
    group: 'Reporting',
    defaultColumns: ['title', 'reportType', 'startDate', 'endDate', 'updatedAt'],
  },
  access: {
    read: ({ req }) => isStaffUser(req),
    create: ({ req }) => isStaffUser(req),
    update: ({ req }) => isStaffUser(req),
    delete: ({ req }) => req.user?.collection === 'users' && req.user.role === 'admin',
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data
        const reportingPeriodId =
          typeof data.reportingPeriod === 'object' && data.reportingPeriod !== null
            ? (data.reportingPeriod as { id?: string | number }).id
            : data.reportingPeriod

        if (reportingPeriodId && req?.payload) {
          const period = await req.payload.findByID({
            collection: 'reporting-periods',
            id: reportingPeriodId,
            depth: 0,
          })
          data.startDate = data.startDate ?? (period as { startDate?: string }).startDate
          data.endDate = data.endDate ?? (period as { endDate?: string }).endDate
          data.reportType = data.reportType ?? (period as { reportType?: string }).reportType
        }

        if (!data.title && data.startDate && data.endDate) {
          return {
            ...data,
            title: `RPPR ${String(data.startDate).slice(0, 10)} to ${String(data.endDate).slice(0, 10)}`,
          }
        }
        return data
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
      name: 'reportingPeriod',
      type: 'relationship',
      relationTo: 'reporting-periods',
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
      name: 'accomplishmentsNarrative',
      type: 'textarea',
    },
    {
      name: 'productsNarrative',
      type: 'textarea',
    },
    {
      name: 'impactNarrative',
      type: 'textarea',
    },
    {
      name: 'changesProblemsNarrative',
      type: 'textarea',
    },
    {
      name: 'specialRequirementsNarrative',
      type: 'textarea',
    },
    {
      name: 'reportNotes',
      type: 'textarea',
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
    },
  ],
}
