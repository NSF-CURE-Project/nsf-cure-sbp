import { describe, expect, it, vi } from 'vitest'
import { createReportingSnapshot } from '@/reporting/snapshots'

describe('createReportingSnapshot', () => {
  it('creates immutable snapshot payload and returns snapshot document', async () => {
    const find = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'classes') return { docs: [{ id: 'class-1', title: 'Class 1' }], hasNextPage: false }
      if (collection === 'chapters') return { docs: [{ id: 'chapter-1', title: 'Chapter 1' }], hasNextPage: false }
      if (collection === 'quizzes') return { docs: [{ id: 'quiz-1', title: 'Quiz 1' }], hasNextPage: false }
      if (collection === 'lesson-progress') {
        return {
          docs: [{ class: 'class-1', chapter: 'chapter-1', user: 'u1', completed: true, updatedAt: '2026-01-12T00:00:00.000Z' }],
          hasNextPage: false,
        }
      }
      if (collection === 'quiz-attempts') {
        return {
          docs: [{ quiz: 'quiz-1', user: 'u1', score: 8, maxScore: 10, createdAt: '2026-01-12T00:00:00.000Z', completedAt: '2026-01-12T00:00:00.000Z' }],
          hasNextPage: false,
        }
      }
      if (['lessons', 'pages', 'quiz-questions', 'accounts', 'classrooms', 'classroom-memberships', 'organizations', 'rppr-reports', 'reporting-snapshots', 'reporting-audit-events', 'reporting-saved-views'].includes(collection)) {
        return { docs: [], hasNextPage: false }
      }
      return { docs: [], hasNextPage: false }
    })

    const create = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'reporting-snapshots') {
        return { id: 'snapshot-1' }
      }
      return { id: 'audit-1' }
    })

    const req = {
      user: { collection: 'users', id: 'staff-1', role: 'staff' },
      payload: { create },
    }

    const result = await createReportingSnapshot(
      { find, create } as never,
      req as never,
      {
        mode: 'rppr',
        period: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          reportType: 'annual',
        },
      },
    )

    expect(result.snapshot).toEqual({ id: 'snapshot-1' })
    expect(create).toHaveBeenCalled()
  })

  it('reuses existing immutable snapshot when hash matches', async () => {
    const find = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'classes') return { docs: [{ id: 'class-1', title: 'Class 1' }], hasNextPage: false }
      if (collection === 'chapters') return { docs: [{ id: 'chapter-1', title: 'Chapter 1' }], hasNextPage: false }
      if (collection === 'quizzes') return { docs: [{ id: 'quiz-1', title: 'Quiz 1' }], hasNextPage: false }
      if (collection === 'lesson-progress') {
        return {
          docs: [{ class: 'class-1', chapter: 'chapter-1', user: 'u1', completed: true, updatedAt: '2026-01-12T00:00:00.000Z' }],
          hasNextPage: false,
        }
      }
      if (collection === 'quiz-attempts') {
        return {
          docs: [{ quiz: 'quiz-1', user: 'u1', score: 8, maxScore: 10, createdAt: '2026-01-12T00:00:00.000Z', completedAt: '2026-01-12T00:00:00.000Z' }],
          hasNextPage: false,
        }
      }
      if (collection === 'reporting-snapshots') {
        return { docs: [{ id: 'snapshot-existing' }], hasNextPage: false, totalDocs: 1 }
      }
      if (['lessons', 'pages', 'quiz-questions', 'accounts', 'classrooms', 'classroom-memberships', 'organizations', 'rppr-reports', 'reporting-audit-events', 'reporting-saved-views'].includes(collection)) {
        return { docs: [], hasNextPage: false }
      }
      return { docs: [], hasNextPage: false }
    })

    const create = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'reporting-snapshots') {
        return { id: 'should-not-create' }
      }
      return { id: 'audit-1' }
    })

    const req = {
      user: { collection: 'users', id: 'staff-1', role: 'staff' },
      payload: { create },
    }

    const result = await createReportingSnapshot(
      { find, create } as never,
      req as never,
      {
        mode: 'rppr',
        period: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          reportType: 'annual',
        },
      },
    )

    expect(result.reused).toBe(true)
    expect(result.snapshot).toEqual({ id: 'snapshot-existing' })
    expect(create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reporting-snapshots',
      }),
    )
  })
})
