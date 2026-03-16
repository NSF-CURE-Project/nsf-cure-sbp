import type { CollectionConfig, PayloadRequest } from 'payload'

const isReportingStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const ReportingAuditEvents: CollectionConfig = {
  slug: 'reporting-audit-events',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'eventType',
    group: 'Reporting',
    defaultColumns: ['eventType', 'reportType', 'periodStart', 'periodEnd', 'createdBy', 'createdAt'],
  },
  access: {
    read: ({ req }) => isReportingStaff(req),
    create: ({ req }) => isReportingStaff(req),
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data
        const createdBy = req?.user?.collection === 'users' ? req.user.id : null
        return {
          ...data,
          createdBy: data.createdBy ?? createdBy,
        }
      },
    ],
  },
  fields: [
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Report generated', value: 'report_generated' },
        { label: 'Snapshot created', value: 'snapshot_created' },
        { label: 'Snapshot reused', value: 'snapshot_reused' },
        { label: 'Export generated', value: 'export_generated' },
        { label: 'Drilldown viewed', value: 'drilldown_viewed' },
        { label: 'Saved view created', value: 'saved_view_created' },
      ],
    },
    {
      name: 'reportType',
      type: 'select',
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
      name: 'periodStart',
      type: 'date',
    },
    {
      name: 'periodEnd',
      type: 'date',
    },
    {
      name: 'filters',
      type: 'json',
    },
    {
      name: 'exportType',
      type: 'text',
    },
    {
      name: 'exportFormat',
      type: 'text',
    },
    {
      name: 'metricKey',
      type: 'text',
    },
    {
      name: 'snapshot',
      type: 'relationship',
      relationTo: 'reporting-snapshots',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
