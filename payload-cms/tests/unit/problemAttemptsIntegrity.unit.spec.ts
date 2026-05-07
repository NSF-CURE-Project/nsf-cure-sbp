import { describe, expect, it, vi } from 'vitest'

import { ProblemAttempts } from '@/collections/ProblemAttempts'

const beforeChangeHook = ProblemAttempts.hooks?.beforeChange?.[0]

describe('ProblemAttempts integrity guards', () => {
  it('rejects submissions that include problems outside the assigned problem set', async () => {
    if (!beforeChangeHook) throw new Error('ProblemAttempts beforeChange hook is not configured')

    const findByID = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'problem-sets') {
        return {
          id: 'set-1',
          problems: ['problem-1'],
        }
      }
      throw new Error(`Unexpected collection: ${collection}`)
    })

    await expect(
      beforeChangeHook({
        operation: 'update',
        data: {
          problemSet: 'set-1',
          answers: [{ problem: 'problem-2', parts: [] }],
        },
        req: {
          payload: { findByID },
        },
      } as never),
    ).rejects.toThrow('Submission includes a problem that is not part of this problem set.')
  })

  it('grades using the canonical problem set list even when answers are missing', async () => {
    if (!beforeChangeHook) throw new Error('ProblemAttempts beforeChange hook is not configured')

    const findByID = vi.fn(async ({ collection, id }: { collection: string; id: string }) => {
      if (collection === 'problem-sets') {
        return {
          id: 'set-1',
          problems: ['problem-1', 'problem-2'],
        }
      }
      if (collection === 'problems' && id === 'problem-1') {
        return {
          id: 'problem-1',
          parts: [
            {
              partType: 'numeric',
              correctAnswer: 10,
              tolerance: 0.1,
              toleranceType: 'absolute',
            },
          ],
        }
      }
      if (collection === 'problems' && id === 'problem-2') {
        return {
          id: 'problem-2',
          parts: [
            {
              partType: 'numeric',
              correctAnswer: 20,
              tolerance: 0.1,
              toleranceType: 'absolute',
            },
          ],
        }
      }
      throw new Error(`Unexpected lookup: ${collection}:${id}`)
    })

    const updated = await beforeChangeHook({
      operation: 'update',
      data: {
        problemSet: 'set-1',
        answers: [
          {
            problem: 'problem-1',
            parts: [{ partIndex: 0, studentAnswer: 10 }],
          },
        ],
      },
      req: {
        payload: { findByID },
      },
    } as never)

    const answers = (updated as { answers?: Array<{ problem?: string; parts?: unknown[] }> }).answers ?? []
    expect(answers).toHaveLength(2)
    expect(answers[0]?.problem).toBe('problem-1')
    expect(answers[1]?.problem).toBe('problem-2')

    expect((updated as { score?: number }).score).toBe(1)
    expect((updated as { maxScore?: number }).maxScore).toBe(2)
    expect((updated as { correctCount?: number }).correctCount).toBe(1)
  })
})
