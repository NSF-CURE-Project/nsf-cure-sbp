export type ReportType = 'annual' | 'final' | 'internal' | 'custom'

export type ReportingPeriodInput = {
  startDate: string
  endDate: string
  label?: string | null
  budgetPeriodName?: string | null
  reportType?: ReportType | null
}

export type ReportingPeriod = {
  startDate: string
  endDate: string
  label: string | null
  budgetPeriodName: string | null
  reportType: ReportType
}

const toIso = (value: string, edge: 'start' | 'end'): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid reporting period date: ${value}`)
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    if (edge === 'start') {
      parsed.setUTCHours(0, 0, 0, 0)
    } else {
      parsed.setUTCHours(23, 59, 59, 999)
    }
  }
  return parsed.toISOString()
}

export const resolveReportingPeriod = (input: ReportingPeriodInput): ReportingPeriod => {
  const startDate = toIso(input.startDate, 'start')
  const endDate = toIso(input.endDate, 'end')
  if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
    throw new Error('Reporting period startDate must be before endDate.')
  }

  return {
    startDate,
    endDate,
    label: input.label?.trim() || null,
    budgetPeriodName: input.budgetPeriodName?.trim() || null,
    reportType: input.reportType ?? 'custom',
  }
}

export const buildPeriodWhere = (field: string, period: ReportingPeriod) => ({
  [field]: {
    greater_than_equal: period.startDate,
    less_than_equal: period.endDate,
  },
})

export const mergeWhere = (
  baseWhere: Record<string, unknown> | undefined,
  extraWhere: Record<string, unknown>,
): Record<string, unknown> => {
  if (!baseWhere) return extraWhere
  return {
    and: [baseWhere, extraWhere],
  }
}

export const periodToken = (period: ReportingPeriod): string => {
  const start = period.startDate.slice(0, 10)
  const end = period.endDate.slice(0, 10)
  return `${start}_to_${end}`
}
