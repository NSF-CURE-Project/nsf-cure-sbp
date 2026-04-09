import { describe, expect, it, vi } from 'vitest'

import { sanitizeProblemSetForPublic } from '@/lib/problemSet/publicProblemSet'
import {
  getAttemptLimitContext,
  isProblemAttemptRateLimited,
  isProblemAttemptRateLimitedDistributed,
} from '@/lib/problemSet/submissionGuards'

describe('problem set public sanitization', () => {
  it('strips grading answer-key fields from problem parts', () => {
    const result = sanitizeProblemSetForPublic({
      id: 1,
      title: 'Set',
      problems: [
        {
          id: 2,
          title: 'Problem',
          parts: [
            {
              label: 'A',
              partType: 'numeric',
              correctAnswer: 42,
              tolerance: 0.1,
              toleranceType: 'relative',
              significantFigures: 3,
              scoringMode: 'stepped',
              scoringSteps: [{ errorBound: 0.1, score: 0.5 }],
              symbolicAnswer: 'x',
              symbolicVariables: [{ variable: 'x', testMin: 1, testMax: 2 }],
              symbolicTolerance: 0.0001,
              fbdRubric: { requiredForces: [{ id: 'F1', correctAngle: 90 }] },
              explanation: { root: {} },
              prompt: { root: {} },
              unit: 'N',
            },
          ],
        },
      ],
    })

    const part = (result.problems as Array<{ parts: Array<Record<string, unknown>> }>)[0]?.parts?.[0]
    expect(part.correctAnswer).toBeUndefined()
    expect(part.tolerance).toBeUndefined()
    expect(part.toleranceType).toBeUndefined()
    expect(part.significantFigures).toBeUndefined()
    expect(part.scoringMode).toBeUndefined()
    expect(part.scoringSteps).toBeUndefined()
    expect(part.symbolicAnswer).toBeUndefined()
    expect(part.symbolicVariables).toBeUndefined()
    expect(part.symbolicTolerance).toBeUndefined()
    expect(part.fbdRubric).toBeUndefined()
    expect(part.explanation).toBeUndefined()
    expect(part.label).toBe('A')
    expect(part.unit).toBe('N')
  })
})

describe('problem attempt submission guards', () => {
  it('rate limits rapid submissions for same user key', () => {
    const req = {
      user: { id: 'account-1' },
      headers: {},
    } as never

    const first = isProblemAttemptRateLimited(req, 1_000)
    expect(first.blocked).toBe(false)

    for (let i = 0; i < 19; i += 1) {
      const next = isProblemAttemptRateLimited(req, 1_100 + i)
      expect(next.blocked).toBe(false)
    }

    const blocked = isProblemAttemptRateLimited(req, 1_200)
    expect(blocked.blocked).toBe(true)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })

  it('computes max-attempt context from problem set and user scoped attempts', async () => {
    const findByID = vi.fn(async () => ({ id: 'set-1', maxAttempts: 3 }))
    const count = vi.fn(async () => ({ totalDocs: 2 }))
    const req = {
      user: { id: 'account-22' },
      payload: { findByID, count },
    } as never

    const result = await getAttemptLimitContext(req, {
      problemSet: 'set-1',
      lesson: 'lesson-7',
    })

    expect(result).toEqual({ maxAttempts: 3, attemptCount: 2 })
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'problem-sets',
        id: 'set-1',
      }),
    )
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'problem-attempts',
        where: {
          user: { equals: 'account-22' },
          problemSet: { equals: 'set-1' },
          lesson: { equals: 'lesson-7' },
        },
      }),
    )
  })

  it('uses persisted attempts to enforce distributed rate limits', async () => {
    const count = vi.fn(async () => ({ totalDocs: 20 }))
    const find = vi.fn(async () => ({
      docs: [{ createdAt: new Date(1_000).toISOString() }],
    }))
    const req = {
      user: { id: 'account-distributed' },
      headers: {},
      payload: { count, find },
    } as never

    const result = await isProblemAttemptRateLimitedDistributed(req, 120_000)
    expect(result.blocked).toBe(true)
    expect(result.retryAfterSec).toBeGreaterThan(0)
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'problem-attempts',
      }),
    )
  })
})
