import type { Payload, PayloadRequest } from 'payload'
import { getReportingSummary } from '../utils/analyticsSummary'
import { buildNarrativeDrafts } from './narrativeBuilder'
import { getDataQualityPanel } from './dataQuality'
import { detectReportingAnomalies } from './anomalies'
import { getNsfrpprSummary } from './nsfRpprSummary'
import type { ReportingPeriodInput } from './period'
import type { ReportMode, ReportingCohortFilters } from './types'
import { createReportingAuditEvent } from './audit'
import { computeSnapshotHash } from './snapshotHash'

export const createReportingSnapshot = async (
  payload: Payload,
  req: PayloadRequest,
  input: {
    mode: ReportMode
    period: ReportingPeriodInput
    reportingPeriodId?: string | number | null
    filters?: Partial<ReportingCohortFilters> | null
    label?: string | null
    reuseIfUnchanged?: boolean
  },
) => {
  const summary = await getReportingSummary(payload, {
    mode: input.mode,
    period: input.period,
    filters: input.filters,
  })

  const dataQuality = await getDataQualityPanel(payload, summary)
  const anomalies = detectReportingAnomalies(summary)
  const drafts = buildNarrativeDrafts(summary, dataQuality, anomalies)
  const rpprPayload =
    input.mode === 'rppr' && summary.reportMeta.period
      ? await getNsfrpprSummary(payload, summary.reportMeta.period, {
          filters: summary.reportMeta.filters,
        })
      : null

  const snapshotInput = {
    label: input.label ?? undefined,
    reportType: summary.reportMeta.reportType,
    reportingPeriod: input.reportingPeriodId ?? undefined,
    periodStart: summary.reportMeta.period?.startDate ?? input.period.startDate,
    periodEnd: summary.reportMeta.period?.endDate ?? input.period.endDate,
    filterScope: summary.reportMeta.filters,
    metricPayload: summary,
    rpprPayload,
    dataQualityPayload: dataQuality,
    anomaliesPayload: anomalies,
    narrativeDrafts: drafts,
    createdBy: req.user?.collection === 'users' ? req.user.id : undefined,
  }
  const snapshotHash = computeSnapshotHash(snapshotInput)
  const reuseIfUnchanged = input.reuseIfUnchanged !== false

  if (reuseIfUnchanged) {
    const existing = await payload.find({
      collection: 'reporting-snapshots',
      depth: 0,
      limit: 1,
      sort: '-createdAt',
      where: {
        and: [
          { reportType: { equals: summary.reportMeta.reportType } },
          { periodStart: { equals: snapshotInput.periodStart } },
          { periodEnd: { equals: snapshotInput.periodEnd } },
          { snapshotHash: { equals: snapshotHash } },
        ],
      },
      overrideAccess: true,
    })

    if ((existing.totalDocs ?? 0) > 0) {
      const snapshot = existing.docs[0]
      await createReportingAuditEvent(req, {
        eventType: 'snapshot_reused',
        reportType: summary.reportMeta.reportType,
        reportingPeriod: input.reportingPeriodId ?? null,
        periodStart: summary.reportMeta.period?.startDate ?? null,
        periodEnd: summary.reportMeta.period?.endDate ?? null,
        filters: summary.reportMeta.filters,
        snapshot: snapshot.id,
        notes: 'Reused existing immutable snapshot with matching reproducibility hash.',
      })

      return {
        snapshot,
        summary,
        dataQuality,
        anomalies,
        drafts,
        rpprPayload,
        reused: true,
      }
    }
  }

  const snapshot = await payload.create({
    collection: 'reporting-snapshots',
    data: snapshotInput,
    overrideAccess: true,
    depth: 0,
  })

  await createReportingAuditEvent(req, {
    eventType: 'snapshot_created',
    reportType: summary.reportMeta.reportType,
    reportingPeriod: input.reportingPeriodId ?? null,
    periodStart: summary.reportMeta.period?.startDate ?? null,
    periodEnd: summary.reportMeta.period?.endDate ?? null,
    filters: summary.reportMeta.filters,
    snapshot: snapshot.id,
  })

  return {
    snapshot,
    summary,
    dataQuality,
    anomalies,
    drafts,
    rpprPayload,
    reused: false,
  }
}
