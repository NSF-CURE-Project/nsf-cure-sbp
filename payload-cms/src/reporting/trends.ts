import type { ReportingSummary } from './types'

export type KpiTrendComparison = {
  metricKey:
    | 'unique_learners_active'
    | 'avg_class_completion_rate'
    | 'avg_quiz_mastery_rate'
    | 'products_in_period'
  label: string
  currentValue: number
  previousValue: number | null
  deltaAbsolute: number | null
  deltaPercent: number | null
  direction: 'up' | 'down' | 'flat' | 'na'
  previousSnapshotId: string | null
}

const stable = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map((item) => stable(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, stable(child)] as const),
    )
  }
  return value
}

const token = (value: unknown): string => JSON.stringify(stable(value ?? null))

const avg = (values: number[]): number => (values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : 0)

const summaryMetricMap = (summary: ReportingSummary) => ({
  unique_learners_active: summary.participation.uniqueLearnersActive,
  avg_class_completion_rate: avg(summary.classCompletion.map((item) => item.completionRate)),
  avg_quiz_mastery_rate: avg(summary.quizPerformance.map((item) => item.masteryRate)),
  products_in_period: summary.productsInPeriod.total,
})

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null
  }
  return null
}

const isReportingSummaryLike = (value: unknown): value is ReportingSummary =>
  Boolean(
    value &&
      typeof value === 'object' &&
      'participation' in value &&
      'classCompletion' in value &&
      'quizPerformance' in value &&
      'productsInPeriod' in value,
  )

export const buildKpiTrendComparisons = (
  summary: ReportingSummary,
  snapshots: Record<string, unknown>[],
): KpiTrendComparison[] => {
  const currentMetrics = summaryMetricMap(summary)
  const currentScopeToken = token(summary.reportMeta.filters)
  const currentPeriodEndTs = summary.reportMeta.period
    ? new Date(summary.reportMeta.period.endDate).getTime()
    : Number.POSITIVE_INFINITY

  const comparable = snapshots
    .filter((snapshot) => snapshot.reportType === summary.reportMeta.reportType)
    .filter((snapshot) => token(snapshot.filterScope) === currentScopeToken)
    .map((snapshot) => {
      const metricPayload = snapshot.metricPayload
      if (!isReportingSummaryLike(metricPayload)) return null
      const periodEndRaw = typeof snapshot.periodEnd === 'string' ? snapshot.periodEnd : null
      const periodEndTs = periodEndRaw ? new Date(periodEndRaw).getTime() : Number.NaN
      return {
        id: toId(snapshot.id),
        periodEndTs,
        metricPayload,
      }
    })
    .filter((item): item is { id: string | null; periodEndTs: number; metricPayload: ReportingSummary } => Boolean(item))
    .filter((item) => Number.isFinite(item.periodEndTs))
    .sort((a, b) => b.periodEndTs - a.periodEndTs)

  const previous = comparable.find((candidate) => candidate.periodEndTs < currentPeriodEndTs) ?? null
  const previousMetrics = previous ? summaryMetricMap(previous.metricPayload) : null

  const defs: Array<{ key: KpiTrendComparison['metricKey']; label: string }> = [
    { key: 'unique_learners_active', label: 'Unique learners active' },
    { key: 'avg_class_completion_rate', label: 'Average class completion rate' },
    { key: 'avg_quiz_mastery_rate', label: 'Average quiz mastery rate' },
    { key: 'products_in_period', label: 'Products in period' },
  ]

  return defs.map(({ key, label }) => {
    const currentValue = currentMetrics[key]
    const previousValue = previousMetrics ? previousMetrics[key] : null
    const deltaAbsolute = previousValue == null ? null : currentValue - previousValue
    const deltaPercent =
      previousValue == null || previousValue === 0 ? null : (currentValue - previousValue) / previousValue
    const direction =
      deltaAbsolute == null
        ? 'na'
        : deltaAbsolute > 0
          ? 'up'
          : deltaAbsolute < 0
            ? 'down'
            : 'flat'

    return {
      metricKey: key,
      label,
      currentValue,
      previousValue,
      deltaAbsolute,
      deltaPercent,
      direction,
      previousSnapshotId: previous?.id ?? null,
    }
  })
}
