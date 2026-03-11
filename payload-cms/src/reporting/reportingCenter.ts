import type { Payload } from 'payload'
import { getReportingSummary } from '../utils/analyticsSummary'
import { getNsfrpprSummary } from './nsfRpprSummary'
import { metricDefinitions } from './metricDefinitions'
import { getDataQualityPanel } from './dataQuality'
import { detectReportingAnomalies } from './anomalies'
import { buildNarrativeDrafts } from './narrativeBuilder'
import type { ReportMode, ReportingCohortFilters } from './types'
import type { ReportingPeriodInput } from './period'
import { findAllDocs } from './data'
import { runReportingCrossChecks } from './validations'
import { buildKpiTrendComparisons } from './trends'

export const getReportingCenterPayload = async (
  payload: Payload,
  input: {
    mode: ReportMode
    period: ReportingPeriodInput
    filters?: Partial<ReportingCohortFilters> | null
  },
) => {
  const summary = await getReportingSummary(payload, {
    mode: input.mode,
    period: input.period,
    filters: input.filters,
  })

  const [dataQuality, latestSnapshots, recentAuditEvents, savedViews, crossChecks] = await Promise.all([
    getDataQualityPanel(payload, summary),
    findAllDocs(payload, 'reporting-snapshots', {
      sort: '-createdAt',
      limit: 100,
    }),
    findAllDocs(payload, 'reporting-audit-events', {
      sort: '-createdAt',
      limit: 20,
    }),
    findAllDocs(payload, 'reporting-saved-views', {
      sort: '-updatedAt',
      limit: 20,
    }),
    runReportingCrossChecks(payload, summary),
  ])

  const anomalies = detectReportingAnomalies(summary)
  const drafts = buildNarrativeDrafts(summary, dataQuality, anomalies)
  const trendComparisons = buildKpiTrendComparisons(summary, latestSnapshots)
  const rppr = summary.reportMeta.period
    ? await getNsfrpprSummary(payload, summary.reportMeta.period, {
        filters: summary.reportMeta.filters,
      })
    : null

  return {
    summary,
    rppr,
    metricDefinitions,
    dataQuality,
    anomalies,
    trendComparisons,
    narrativeDrafts: drafts,
    latestSnapshots,
    recentAuditEvents,
    savedViews,
    crossChecks,
  }
}
