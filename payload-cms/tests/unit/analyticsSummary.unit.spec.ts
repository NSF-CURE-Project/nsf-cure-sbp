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

    expect(csv).toBe(
      'name,note\nAlice,Simple\n"Bob, Jr.","He said ""hi""\nthen left"',
    )
  })
})

describe('getReportingSummary', () => {
  it('aggregates class/chapter completion, mastery bands, and weekly engagement', async () => {
    const find = vi.fn(async ({ collection, page = 1 }: { collection: string; page?: number }) => {
      if (collection === 'classes') {
        if (page === 1) {
          return {
            docs: [
              { id: 'class-1', title: 'Biology 101' },
              { id: 'class-2', title: '' },
            ],
            hasNextPage: false,
          }
        }
      }

      if (collection === 'chapters') {
        return {
          docs: [
            { id: 'chapter-1', title: 'Cells' },
            { id: 'chapter-2' },
          ],
          hasNextPage: false,
        }
      }

      if (collection === 'lesson-progress') {
        return {
          docs: [
            {
              class: 'class-1',
              chapter: 'chapter-1',
              user: 'u1',
              completed: true,
              updatedAt: '2026-01-06T10:00:00.000Z',
            },
            {
              class: 'class-1',
              chapter: 'chapter-1',
              user: 'u2',
              completed: false,
              updatedAt: '2026-01-08T12:00:00.000Z',
            },
            {
              class: 'class-2',
              chapter: 'chapter-2',
              user: 'u1',
              completed: true,
              updatedAt: '2026-01-13T11:00:00.000Z',
            },
          ],
          hasNextPage: false,
        }
      }

      if (collection === 'quiz-attempts') {
        return {
          docs: [
            { score: 55, maxScore: 100 },
            { score: 0.74 },
            { score: '95', maxScore: '100' },
          ],
          hasNextPage: false,
        }
      }

      throw new Error(`Unexpected collection: ${collection}`)
    })

    const summary = await getReportingSummary({ find } as never)

    expect(summary.classCompletion).toEqual([
      {
        id: 'class-2',
        title: 'Class class-2',
        total: 1,
        completed: 1,
        completionRate: 1,
      },
      {
        id: 'class-1',
        title: 'Biology 101',
        total: 2,
        completed: 1,
        completionRate: 0.5,
      },
    ])

    expect(summary.chapterCompletion).toEqual([
      {
        id: 'chapter-2',
        title: 'Chapter chapter-2',
        total: 1,
        completed: 1,
        completionRate: 1,
      },
      {
        id: 'chapter-1',
        title: 'Cells',
        total: 2,
        completed: 1,
        completionRate: 0.5,
      },
    ])

    expect(summary.quizMasteryDistribution.map(({ label, count }) => ({ label, count }))).toEqual([
      { label: '0-59%', count: 1 },
      { label: '60-69%', count: 0 },
      { label: '70-79%', count: 1 },
      { label: '80-89%', count: 0 },
      { label: '90-100%', count: 1 },
    ])

    expect(summary.weeklyEngagement).toEqual([
      { weekStart: '2026-01-05', activeStudents: 2, weekOverWeekChange: null },
      { weekStart: '2026-01-12', activeStudents: 1, weekOverWeekChange: -0.5 },
    ])

    expect(summary.generatedAt).toBeTypeOf('string')
    expect(new Date(summary.generatedAt).toString()).not.toBe('Invalid Date')
    expect(find).toHaveBeenCalled()
  })
})
