import type { PayloadRequest } from 'payload'
import type { ReportType } from './period'

type PayloadCreateFn = (args: {
  collection: string
  data: Record<string, unknown>
  overrideAccess?: boolean
  depth?: number
}) => Promise<Record<string, unknown>>

export const createReportingAuditEvent = async (
  req: PayloadRequest,
  input: {
    eventType:
      | 'report_generated'
      | 'snapshot_created'
      | 'snapshot_reused'
      | 'export_generated'
      | 'drilldown_viewed'
      | 'saved_view_created'
    reportType?: ReportType
    reportingPeriod?: string | number | null
    periodStart?: string | null
    periodEnd?: string | null
    filters?: Record<string, unknown>
    exportType?: string
    exportFormat?: string
    metricKey?: string
    snapshot?: string | number | null
    notes?: string
  },
) => {
  try {
    const create = req.payload.create as unknown as PayloadCreateFn
    const reportingPeriod =
      typeof input.reportingPeriod === 'number'
        ? input.reportingPeriod
        : typeof input.reportingPeriod === 'string' && input.reportingPeriod.trim()
          ? (() => {
              const parsed = Number(input.reportingPeriod)
              return Number.isInteger(parsed) ? parsed : undefined
            })()
          : undefined
    const snapshotId =
      typeof input.snapshot === 'number'
        ? input.snapshot
        : typeof input.snapshot === 'string' && input.snapshot.trim()
          ? (() => {
              const parsed = Number(input.snapshot)
              return Number.isInteger(parsed) ? parsed : undefined
            })()
          : undefined

    await create({
      collection: 'reporting-audit-events',
      data: {
        eventType: input.eventType,
        reportType: input.reportType,
        reportingPeriod,
        periodStart: input.periodStart ?? undefined,
        periodEnd: input.periodEnd ?? undefined,
        filters: input.filters ?? undefined,
        exportType: input.exportType,
        exportFormat: input.exportFormat,
        metricKey: input.metricKey,
        snapshot: snapshotId,
        notes: input.notes,
      },
      overrideAccess: true,
      depth: 0,
    })
  } catch {
    // Intentionally swallow audit write failures so exports/reports still complete.
  }
}
