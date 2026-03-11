import type { CollectionConfig, PayloadRequest } from 'payload'
import { computeSnapshotHash } from '../reporting/snapshotHash'

const isReportingStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const ReportingSnapshots: CollectionConfig = {
  slug: 'reporting-snapshots',
  admin: {
    useAsTitle: 'label',
    group: 'Reporting',
    defaultColumns: ['label', 'reportType', 'versionLabel', 'createdAt'],
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
        const hashInput = {
          reportType: data.reportType,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          filterScope: data.filterScope,
          metricPayload: data.metricPayload,
          rpprPayload: data.rpprPayload,
        }
        const snapshotHash = computeSnapshotHash(hashInput)
        const reproducibilityKey = `${String(data.reportType ?? 'custom')}:${String(data.periodStart ?? '').slice(0, 10)}:${String(data.periodEnd ?? '').slice(0, 10)}:${snapshotHash.slice(0, 12)}`
        const createdAtToken = new Date().toISOString().replace(/[:.]/g, '-')

        return {
          ...data,
          createdBy: data.createdBy ?? createdBy,
          snapshotHash,
          reproducibilityKey,
          versionLabel: data.versionLabel ?? `snapshot-${createdAtToken}`,
          label:
            data.label ??
            `${String(data.reportType ?? 'report').toUpperCase()} ${String(data.periodStart ?? '').slice(0, 10)} to ${String(data.periodEnd ?? '').slice(0, 10)}`,
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
      name: 'reportType',
      type: 'select',
      required: true,
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
      name: 'periodStart',
      type: 'date',
      required: true,
    },
    {
      name: 'periodEnd',
      type: 'date',
      required: true,
    },
    {
      name: 'filterScope',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'metricPayload',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'rpprPayload',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'dataQualityPayload',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'anomaliesPayload',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'narrativeDrafts',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'snapshotHash',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'reproducibilityKey',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'versionLabel',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
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
