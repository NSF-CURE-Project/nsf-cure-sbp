import { describe, expect, it } from 'vitest'
import { buildNarrativeDrafts } from '@/reporting/narrativeBuilder'

describe('buildNarrativeDrafts', () => {
  it('produces deterministic draft text with draft markers', () => {
    const drafts = buildNarrativeDrafts(
      {
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
          generatedAt: '2026-01-01T00:00:00.000Z',
        },
        participation: {
          uniqueLearnersActive: 12,
          uniqueLearnersWithProgress: 10,
          uniqueLearnersWithQuizAttempts: 8,
        },
        classCompletion: [
          {
            id: 'c1',
            title: 'Class 1',
            uniqueLearnersStarted: 10,
            uniqueLearnersCompleted: 8,
            completionRate: 0.8,
          },
        ],
        chapterCompletion: [],
        quizPerformance: [
          {
            quizId: 'q1',
            title: 'Quiz 1',
            uniqueLearnersAttempted: 8,
            uniqueLearnersMastered: 6,
            masteryRate: 0.75,
            attempts: 10,
          },
        ],
        quizMasteryDistribution: [],
        weeklyEngagement: [],
        productsInPeriod: {
          total: 1,
          byCollection: { lessons: 1 },
          artifacts: [],
        },
        warnings: [],
      },
      { issues: [], confidence: 'high' },
      [],
    )

    expect(drafts.accomplishmentsDraft).toContain('DRAFT - STAFF EDIT REQUIRED.')
    expect(drafts.impactDraft).toContain('Average class completion')
    expect(drafts.changesProblemsDraft).toContain('DRAFT - STAFF EDIT REQUIRED.')
  })
})
