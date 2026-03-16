import { describe, expect, it, vi } from 'vitest'
import { getDataQualityPanel } from '@/reporting/dataQuality'

describe('getDataQualityPanel', () => {
  it('detects missing participant metadata and duplicate memberships', async () => {
    const find = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'accounts') {
        return {
          docs: [
            {
              id: 'u1',
              includeInRppr: true,
              participantType: '',
              projectRole: '',
              organizationName: '',
              updatedAt: '2025-01-01T00:00:00.000Z',
            },
          ],
          hasNextPage: false,
        }
      }
      if (collection === 'classroom-memberships') {
        return {
          docs: [
            { classroom: 'room-1', student: 'u1' },
            { classroom: 'room-1', student: 'u1' },
          ],
          hasNextPage: false,
        }
      }
      return { docs: [], hasNextPage: false }
    })

    const panel = await getDataQualityPanel(
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
          uniqueLearnersActive: 0,
          uniqueLearnersWithProgress: 0,
          uniqueLearnersWithQuizAttempts: 0,
        },
        classCompletion: [],
        chapterCompletion: [],
        quizPerformance: [],
        quizMasteryDistribution: [],
        weeklyEngagement: [],
        productsInPeriod: { total: 0, byCollection: {}, artifacts: [] },
        warnings: [{ code: 'NO_PROGRESS_DATA', message: 'No data.' }],
      },
    )

    expect(panel.issues.some((issue) => issue.key === 'missing_participant_fields')).toBe(true)
    expect(panel.issues.some((issue) => issue.key === 'duplicate_memberships')).toBe(true)
    expect(panel.confidence).toBe('low')
  })
})
