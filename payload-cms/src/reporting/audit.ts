import type { PayloadRequest } from 'payload'
import type { ReportType } from './period'

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
    await req.payload.create({
      collection: 'reporting-audit-events',
      data: {
        eventType: input.eventType,
        reportType: input.reportType,
        reportingPeriod: input.reportingPeriod ?? undefined,
        periodStart: input.periodStart ?? undefined,
        periodEnd: input.periodEnd ?? undefined,
        filters: input.filters ?? undefined,
        exportType: input.exportType,
        exportFormat: input.exportFormat,
        metricKey: input.metricKey,
        snapshot: input.snapshot ?? undefined,
        notes: input.notes,
      },
      overrideAccess: true,
      depth: 0,
    })
  } catch {
    // Intentionally swallow audit write failures so exports/reports still complete.
  }
}
