import { describe, expect, it } from 'vitest'
import { buildPeriodWhere, resolveReportingPeriod } from '@/reporting/period'

describe('resolveReportingPeriod', () => {
  it('normalizes date-only strings to UTC boundaries', () => {
    const period = resolveReportingPeriod({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      reportType: 'annual',
    })

    expect(period.startDate).toBe('2026-02-01T00:00:00.000Z')
    expect(period.endDate).toBe('2026-02-28T23:59:59.999Z')
  })

  it('rejects invalid ranges', () => {
    expect(() =>
      resolveReportingPeriod({
        startDate: '2026-03-10',
        endDate: '2026-03-01',
      }),
    ).toThrow('Reporting period startDate must be before endDate.')
  })

  it('builds period where clause', () => {
    const period = resolveReportingPeriod({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    })

    expect(buildPeriodWhere('updatedAt', period)).toEqual({
      updatedAt: {
        greater_than_equal: '2026-01-01T00:00:00.000Z',
        less_than_equal: '2026-01-31T23:59:59.999Z',
      },
    })
  })
})
