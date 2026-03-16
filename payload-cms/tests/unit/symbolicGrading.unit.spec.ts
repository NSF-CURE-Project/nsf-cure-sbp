import { describe, expect, it } from 'vitest'

import { gradeSymbolic } from '@/lib/problemSet/symbolicGrading'

const variables = [{ variable: 'F', testMin: 1, testMax: 10 }]

describe('gradeSymbolic', () => {
  it('marks equivalent expressions as correct', async () => {
    await expect(
      gradeSymbolic('sqrt(3)*F/2', '(3^0.5 * F) / 2', variables, 1e-6, 6, 'p1'),
    ).resolves.toBe(true)
  })

  it('marks non-equivalent expressions as incorrect', async () => {
    await expect(gradeSymbolic('F/2', 'sqrt(3)*F/2', variables, 1e-6, 6, 'p1')).resolves.toBe(false)
  })

  it('returns false when all points fail evaluation', async () => {
    await expect(gradeSymbolic('sqrt(-1)', 'sqrt(3)*F/2', variables, 1e-6, 5, 'p2')).resolves.toBe(
      false,
    )
  })
})

