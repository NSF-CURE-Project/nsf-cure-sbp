import { describe, expect, it, vi } from 'vitest'

import { problemAttemptReviewHandler } from '@/endpoints/problemAttemptReview'

describe('problemAttemptReviewHandler', () => {
  it('returns unauthorized when user is missing', async () => {
    const response = await problemAttemptReviewHandler({} as never)

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('returns forbidden for account users that do not own the attempt', async () => {
    const response = await problemAttemptReviewHandler({
      user: { collection: 'accounts', id: 'acct-2' },
      routeParams: { attemptId: 'attempt-1' },
      payload: {
        findByID: vi.fn(async () => ({
          id: 'attempt-1',
          user: 'acct-1',
          problemSet: { id: 'set-1', title: 'Set 1' },
          answers: [],
          createdAt: '2026-01-01T00:00:00.000Z',
        })),
      },
    } as never)

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
  })

  it('includes submitted placedForces and figure data in review response', async () => {
    const findByID = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection !== 'problem-attempts') {
        throw new Error('Unexpected collection')
      }
      return {
        id: 'attempt-1',
        user: 'acct-1',
        problemSet: { id: 'set-1', title: 'Set 1' },
        answers: [
          {
            problem: {
              id: 'problem-1',
              title: 'Problem 1',
              prompt: null,
              figure: {
                id: 'figure-1',
                type: 'fbd',
                width: 600,
                height: 400,
                figureData: {
                  type: 'fbd',
                  body: { shape: 'rect', x: 200, y: 160, width: 100, height: 60, label: 'Body' },
                  forces: [],
                },
              },
              parts: [{ partType: 'fbd-draw', fbdRubric: null }],
            },
            parts: [
              {
                partIndex: 0,
                studentAnswer: null,
                studentExpression: null,
                placedForces: {
                  forces: [{ id: 'F1', label: 'F1', origin: [0, 0], angle: 45, magnitude: 1 }],
                  moments: [{ id: 'M1', label: 'M1', direction: 'cw', x: 0, y: 0, magnitude: 2 }],
                },
                isCorrect: false,
                score: 0.5,
              },
            ],
          },
        ],
        score: 0.5,
        maxScore: 1,
        correctCount: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      }
    })

    const response = await problemAttemptReviewHandler({
      user: { collection: 'accounts', id: 'acct-1' },
      routeParams: { attemptId: 'attempt-1' },
      payload: { findByID },
    } as never)

    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      problems: Array<{
        figure?: { id?: string } | null
        parts: Array<{
          partType: string
          placedForces?: { forces?: unknown[]; moments?: unknown[] } | null
        }>
      }>
    }

    expect(body.problems[0]?.figure).toEqual(
      expect.objectContaining({
        id: 'figure-1',
      }),
    )
    expect(body.problems[0]?.parts[0]?.partType).toBe('fbd-draw')
    expect(body.problems[0]?.parts[0]?.placedForces?.forces).toHaveLength(1)
    expect(body.problems[0]?.parts[0]?.placedForces?.moments).toHaveLength(1)
  })
})
