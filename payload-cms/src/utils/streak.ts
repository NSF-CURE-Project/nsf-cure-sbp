export type StreakInput = {
  lastStreakDate?: string | null
  currentStreak?: number | null
  longestStreak?: number | null
  todayDate?: string
}

export type StreakResult = {
  changed: boolean
  currentStreak: number
  longestStreak: number
  lastStreakDate: string
}

const toUtcDateString = (input: string | Date): string => {
  if (input instanceof Date) return input.toISOString().slice(0, 10)
  const parsed = new Date(input)
  if (!Number.isFinite(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const previousUtcDate = (dateText: string): string => {
  const date = new Date(`${dateText}T00:00:00.000Z`)
  if (!Number.isFinite(date.getTime())) return ''
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export const computeNextStreak = (input: StreakInput): StreakResult => {
  const today = input.todayDate ?? new Date().toISOString().slice(0, 10)
  const lastDate = input.lastStreakDate ? toUtcDateString(input.lastStreakDate) : ''
  const currentValue = Math.max(0, Math.trunc(input.currentStreak ?? 0))
  const longestValue = Math.max(0, Math.trunc(input.longestStreak ?? 0))

  if (lastDate === today) {
    return {
      changed: false,
      currentStreak: currentValue,
      longestStreak: Math.max(longestValue, currentValue),
      lastStreakDate: today,
    }
  }

  const yesterday = previousUtcDate(today)
  const nextCurrent = lastDate === yesterday ? currentValue + 1 : 1
  const nextLongest = Math.max(longestValue, nextCurrent)

  return {
    changed: true,
    currentStreak: nextCurrent,
    longestStreak: nextLongest,
    lastStreakDate: today,
  }
}
