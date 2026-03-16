import type { ReportingSummary } from './types'

export type ReportingAnomaly = {
  key: string
  severity: 'low' | 'medium' | 'high'
  metricKey: string
  message: string
  observedValue: number
  baselineValue: number
}

export const detectReportingAnomalies = (summary: ReportingSummary): ReportingAnomaly[] => {
  const anomalies: ReportingAnomaly[] = []

  const weekly = summary.weeklyEngagement
  for (let i = 1; i < weekly.length; i += 1) {
    const previous = weekly[i - 1]?.activeStudents ?? 0
    const current = weekly[i]?.activeStudents ?? 0
    if (previous <= 0) continue

    const delta = (current - previous) / previous
    if (Math.abs(delta) >= 0.5) {
      anomalies.push({
        key: `engagement_delta_${weekly[i].weekStart}`,
        severity: Math.abs(delta) >= 0.75 ? 'high' : 'medium',
        metricKey: 'weekly_active_learners',
        message:
          delta > 0
            ? `Engagement rose sharply (${Math.round(delta * 100)}%) week-over-week.`
            : `Engagement dropped sharply (${Math.round(delta * 100)}%) week-over-week.`,
        observedValue: current,
        baselineValue: previous,
      })
    }
  }

  const avgClassCompletion = summary.classCompletion.length
    ? summary.classCompletion.reduce((sum, row) => sum + row.completionRate, 0) /
      summary.classCompletion.length
    : 0
  if (summary.classCompletion.length && avgClassCompletion < 0.3) {
    anomalies.push({
      key: 'class_completion_low',
      severity: 'high',
      metricKey: 'class_completion_rate',
      message: `Average class completion is low (${Math.round(avgClassCompletion * 100)}%).`,
      observedValue: avgClassCompletion,
      baselineValue: 0.5,
    })
  }

  const avgMastery = summary.quizPerformance.length
    ? summary.quizPerformance.reduce((sum, row) => sum + row.masteryRate, 0) /
      summary.quizPerformance.length
    : 0
  if (summary.quizPerformance.length && avgMastery < 0.4) {
    anomalies.push({
      key: 'quiz_mastery_low',
      severity: 'medium',
      metricKey: 'quiz_mastery_rate',
      message: `Average quiz mastery is below expected threshold (${Math.round(avgMastery * 100)}%).`,
      observedValue: avgMastery,
      baselineValue: 0.6,
    })
  }

  return anomalies
}
