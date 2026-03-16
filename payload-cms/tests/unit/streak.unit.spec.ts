import { describe, expect, it } from 'vitest'

import { computeNextStreak } from '@/utils/streak'

describe('computeNextStreak', () => {
  it('does not change streak when already counted for today', () => {
    const result = computeNextStreak({
      lastStreakDate: '2026-03-15T00:00:00.000Z',
      currentStreak: 4,
      longestStreak: 7,
      todayDate: '2026-03-15',
    })

    expect(result).toEqual({
      changed: false,
      currentStreak: 4,
      longestStreak: 7,
      lastStreakDate: '2026-03-15',
    })
  })

  it('increments streak when last completion was yesterday', () => {
    const result = computeNextStreak({
      lastStreakDate: '2026-03-14T18:30:00.000Z',
      currentStreak: 2,
      longestStreak: 3,
      todayDate: '2026-03-15',
    })

    expect(result).toEqual({
      changed: true,
      currentStreak: 3,
      longestStreak: 3,
      lastStreakDate: '2026-03-15',
    })
  })

  it('resets streak after a date gap', () => {
    const result = computeNextStreak({
      lastStreakDate: '2026-03-10T00:00:00.000Z',
      currentStreak: 8,
      longestStreak: 8,
      todayDate: '2026-03-15',
    })

    expect(result).toEqual({
      changed: true,
      currentStreak: 1,
      longestStreak: 8,
      lastStreakDate: '2026-03-15',
    })
  })
})
