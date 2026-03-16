import { describe, expect, it, vi } from 'vitest'

import { getReportingSummary, reportRowsToCsv } from '@/utils/analyticsSummary'

describe('reportRowsToCsv', () => {
  it('escapes commas, quotes, and line breaks', () => {
    const csv = reportRowsToCsv(
      [
        { name: 'Alice', note: 'Simple' },
        { name: 'Bob, Jr.', note: 'He said "hi"\nthen left' },
      ],
      ['name', 'note'],
    )

    expect(csv).toBe('name,note\nAlice,Simple\n"Bob, Jr.","He said ""hi""\nthen left"')
  })
})

describe('getReportingSummary', () => {
  it('aggregates unique learner completion and quiz mastery in RPPR mode', async () => {
    const find = vi.fn(async ({ collection, where }: { collection: string; where?: Record<string, unknown> }) => {
      if (collection === 'classes') {
        return {
          docs: [
            { id: 'class-1', title: 'Biology 101' },
            { id: 'class-2', title: 'Chemistry' },
          ],
          hasNextPage: false,
        }
      }

      if (collection === 'chapters') {
        return {
          docs: [
            { id: 'chapter-1', title: 'Cells' },
            { id: 'chapter-2', title: 'Bonds' },
          ],
          hasNextPage: false,
        }
      }

      if (collection === 'quizzes') {
        if (where?.createdAt) {
          return {
            docs: [{ id: 'quiz-1', title: 'Cells quiz', createdAt: '2026-01-15T00:00:00.000Z' }],
            hasNextPage: false,
          }
        }
        return {
          docs: [{ id: 'quiz-1', title: 'Cells quiz' }],
          hasNextPage: false,
        }
      }

      if (collection === 'lesson-progress') {
        if (where?.updatedAt) {
          return {
            docs: [
              {
                class: 'class-1',
                chapter: 'chapter-1',
                user: 'u1',
                completed: true,
                updatedAt: '2026-01-10T10:00:00.000Z',
              },
              {
                class: 'class-1',
                chapter: 'chapter-1',
                user: 'u1',
                completed: false,
                updatedAt: '2026-01-11T10:00:00.000Z',
              },
              {
                class: 'class-1',
                chapter: 'chapter-1',
                user: 'u2',
                completed: false,
                updatedAt: '2026-01-12T10:00:00.000Z',
              },
            ],
            hasNextPage: false,
          }
        }

        return { docs: [], hasNextPage: false }
      }

      if (collection === 'quiz-attempts') {
        return {
          docs: [
            {
              quiz: 'quiz-1',
              user: 'u1',
              score: 9,
              maxScore: 10,
              completedAt: '2026-01-14T00:00:00.000Z',
              createdAt: '2026-01-14T00:00:00.000Z',
            },
            {
              quiz: 'quiz-1',
              user: 'u2',
              score: 4,
              maxScore: 10,
              completedAt: '2026-01-16T00:00:00.000Z',
              createdAt: '2026-01-16T00:00:00.000Z',
            },
          ],
          hasNextPage: false,
        }
      }

      if (['lessons', 'pages', 'quiz-questions'].includes(collection)) {
        return {
          docs: [
            {
              id: `${collection}-1`,
              title: `${collection} title`,
              createdAt: '2026-01-20T00:00:00.000Z',
            },
          ],
          hasNextPage: false,
        }
      }

      if (collection === 'classrooms' || collection === 'classroom-memberships' || collection === 'accounts') {
        return {
          docs: [],
          hasNextPage: false,
        }
      }

      throw new Error(`Unexpected collection: ${collection}`)
    })

    const summary = await getReportingSummary({ find } as never, {
      mode: 'rppr',
      period: {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        reportType: 'annual',
      },
    })

    expect(summary.classCompletion).toEqual([
      {
        id: 'class-1',
        title: 'Biology 101',
        uniqueLearnersStarted: 2,
        uniqueLearnersCompleted: 1,
        completionRate: 0.5,
      },
    ])

    expect(summary.chapterCompletion[0]).toEqual({
      id: 'chapter-1',
      title: 'Cells',
      uniqueLearnersStarted: 2,
      uniqueLearnersCompleted: 1,
      completionRate: 0.5,
    })

    expect(summary.quizPerformance).toEqual([
      {
        quizId: 'quiz-1',
        title: 'Cells quiz',
        uniqueLearnersAttempted: 2,
        uniqueLearnersMastered: 1,
        masteryRate: 0.5,
        attempts: 2,
      },
    ])

    expect(summary.participation.uniqueLearnersActive).toBe(2)
    expect(summary.productsInPeriod.total).toBe(4)
    expect(summary.reportMeta.mode).toBe('rppr')
    expect(summary.reportMeta.filters).toEqual({
      classId: null,
      professorId: null,
      classroomId: null,
      firstGen: null,
      transfer: null,
    })
  })

  it('requires period for rppr mode', async () => {
    await expect(
      getReportingSummary({ find: vi.fn() } as never, {
        mode: 'rppr',
      }),
    ).rejects.toThrow('RPPR reporting requires a reporting period.')
  })
})
