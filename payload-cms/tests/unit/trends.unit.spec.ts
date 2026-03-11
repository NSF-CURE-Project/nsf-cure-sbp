import { describe, expect, it } from 'vitest'
import { buildKpiTrendComparisons } from '@/reporting/trends'
import { resolveReportingPeriod } from '@/reporting/period'
import type { ReportingSummary } from '@/reporting/types'

const buildSummary = (active: number, completionRate: number, masteryRate: number): ReportingSummary => ({
  reportMeta: {
    mode: 'rppr',
    reportType: 'annual',
    period: resolveReportingPeriod({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      reportType: 'annual',
    }),
    filters: { classId: 'class-1' },
    generatedAt: '2026-03-01T00:00:00.000Z',
  },
  participation: {
    uniqueLearnersActive: active,
    uniqueLearnersWithProgress: active,
    uniqueLearnersWithQuizAttempts: active,
  },
  classCompletion: [
    {
      id: 'class-1',
      title: 'Class 1',
      uniqueLearnersStarted: 10,
      uniqueLearnersCompleted: Math.round(10 * completionRate),
      completionRate,
    },
  ],
  chapterCompletion: [],
  quizPerformance: [
    {
      quizId: 'quiz-1',
      title: 'Quiz 1',
      uniqueLearnersAttempted: 10,
      uniqueLearnersMastered: Math.round(10 * masteryRate),
      masteryRate,
      attempts: 12,
    },
  ],
  quizMasteryDistribution: [],
  weeklyEngagement: [],
  productsInPeriod: {
    total: 3,
    byCollection: {},
    artifacts: [],
  },
  warnings: [],
})

describe('buildKpiTrendComparisons', () => {
  it('compares current metrics to previous snapshot in same scope', () => {
    const current = buildSummary(25, 0.6, 0.7)
    const previous = buildSummary(20, 0.5, 0.6)

    const comparisons = buildKpiTrendComparisons(current, [
      {
        id: 'snap-prev',
        reportType: 'annual',
        periodEnd: '2026-01-31T23:59:59.999Z',
        filterScope: { classId: 'class-1' },
        metricPayload: previous,
      },
    ])

    const active = comparisons.find((item) => item.metricKey === 'unique_learners_active')
    expect(active?.previousSnapshotId).toBe('snap-prev')
    expect(active?.direction).toBe('up')
    expect(active?.deltaAbsolute).toBe(5)
  })
})
