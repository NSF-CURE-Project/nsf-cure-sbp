import { describe, expect, it, vi } from 'vitest'
import { runReportingCrossChecks } from '@/reporting/validations'

describe('runReportingCrossChecks', () => {
  it('returns warn/fail states for inconsistent source coverage', async () => {
    const find = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'classroom-memberships') {
        return {
          docs: [{ student: 'u1' }],
          hasNextPage: false,
        }
      }
      if (collection === 'lesson-progress') {
        return {
          docs: [{ user: 'u1' }, { user: 'u2' }],
          hasNextPage: false,
        }
      }
      if (collection === 'quiz-attempts') {
        return {
          docs: [{ user: 'u3' }],
          hasNextPage: false,
        }
      }
      return { docs: [], hasNextPage: false }
    })

    const checks = await runReportingCrossChecks(
      { find } as never,
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
          generatedAt: new Date().toISOString(),
        },
        participation: {
          uniqueLearnersActive: 1,
          uniqueLearnersWithProgress: 2,
          uniqueLearnersWithQuizAttempts: 1,
        },
        classCompletion: [],
        chapterCompletion: [],
        quizPerformance: [],
        quizMasteryDistribution: [],
        weeklyEngagement: [],
        productsInPeriod: { total: 0, byCollection: {}, artifacts: [] },
        warnings: [],
      },
    )

    expect(checks.find((check) => check.key === 'active_learners_consistency')?.status).toBe('fail')
    expect(checks.find((check) => check.key === 'progress_membership_alignment')?.status).toBe('warn')
    expect(checks.find((check) => check.key === 'attempt_progress_alignment')?.status).toBe('warn')
  })
})
