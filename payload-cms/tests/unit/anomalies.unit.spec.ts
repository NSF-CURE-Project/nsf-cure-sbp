import { describe, expect, it } from 'vitest'
import { detectReportingAnomalies } from '@/reporting/anomalies'

describe('detectReportingAnomalies', () => {
  it('flags large engagement and performance drops', () => {
    const anomalies = detectReportingAnomalies({
      reportMeta: {
        mode: 'rppr',
        reportType: 'annual',
        period: null,
        filters: {
          classId: null,
          professorId: null,
          classroomId: null,
          firstGen: null,
          transfer: null,
        },
        generatedAt: new Date().toISOString(),
      },
      participation: {
        uniqueLearnersActive: 10,
        uniqueLearnersWithProgress: 10,
        uniqueLearnersWithQuizAttempts: 8,
      },
      classCompletion: [
        {
          id: 'class-1',
          title: 'Class 1',
          uniqueLearnersStarted: 10,
          uniqueLearnersCompleted: 2,
          completionRate: 0.2,
        },
      ],
      chapterCompletion: [],
      quizPerformance: [
        {
          quizId: 'quiz-1',
          title: 'Quiz 1',
          uniqueLearnersAttempted: 10,
          uniqueLearnersMastered: 2,
          masteryRate: 0.2,
          attempts: 12,
        },
      ],
      quizMasteryDistribution: [],
      weeklyEngagement: [
        { weekStart: '2026-01-01', activeStudents: 20, weekOverWeekChange: null },
        { weekStart: '2026-01-08', activeStudents: 8, weekOverWeekChange: -0.6 },
      ],
      productsInPeriod: {
        total: 0,
        byCollection: {},
        artifacts: [],
      },
      warnings: [],
    })

    expect(anomalies.some((item) => item.metricKey === 'weekly_active_learners')).toBe(true)
    expect(anomalies.some((item) => item.metricKey === 'class_completion_rate')).toBe(true)
    expect(anomalies.some((item) => item.metricKey === 'quiz_mastery_rate')).toBe(true)
  })
})
