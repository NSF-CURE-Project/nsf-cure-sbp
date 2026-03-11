import type { Payload } from 'payload'
import { buildPeriodWhere, mergeWhere, resolveReportingPeriod, type ReportingPeriod } from './period'

export const findAllDocs = async (
  payload: Payload,
  collection: string,
  options?: {
    where?: Record<string, unknown>
    sort?: string
    depth?: number
    limit?: number
  },
): Promise<Record<string, unknown>[]> => {
  const docs: Record<string, unknown>[] = []
  let page = 1
  let hasNextPage = true
  const limit = options?.limit ?? 500

  while (hasNextPage) {
    const result = await payload.find({
      collection,
      depth: options?.depth ?? 0,
      limit,
      page,
      sort: options?.sort ?? 'id',
      where: options?.where,
    })

    docs.push(...(result.docs as unknown as Record<string, unknown>[]))
    hasNextPage = Boolean(result.hasNextPage)
    page += 1
  }

  return docs
}

export const findAllDocsInPeriod = async (
  payload: Payload,
  collection: string,
  dateField: string,
  period: ReportingPeriod,
  options?: {
    where?: Record<string, unknown>
    sort?: string
    depth?: number
  },
) => {
  const where = mergeWhere(options?.where, buildPeriodWhere(dateField, period))
  return findAllDocs(payload, collection, {
    ...options,
    where,
  })
}

export const resolvePeriodFromQuery = async (
  payload: Payload,
  query: Record<string, unknown> | undefined,
): Promise<ReportingPeriod | null> => {
  const periodId = typeof query?.periodId === 'string' ? query.periodId : null
  if (periodId) {
    const periodDoc = await payload.findByID({
      collection: 'reporting-periods',
      id: periodId,
      depth: 0,
    })

    return resolveReportingPeriod({
      startDate: String((periodDoc as { startDate?: string }).startDate ?? ''),
      endDate: String((periodDoc as { endDate?: string }).endDate ?? ''),
      label: (periodDoc as { label?: string | null }).label ?? null,
      budgetPeriodName: (periodDoc as { budgetPeriodName?: string | null }).budgetPeriodName ?? null,
      reportType:
        ((periodDoc as { reportType?: 'annual' | 'final' | 'internal' | 'custom' }).reportType as
          | 'annual'
          | 'final'
          | 'internal'
          | 'custom'
          | undefined) ?? 'custom',
    })
  }

  const startDate = typeof query?.startDate === 'string' ? query.startDate : null
  const endDate = typeof query?.endDate === 'string' ? query.endDate : null

  if (!startDate || !endDate) return null

  return resolveReportingPeriod({
    startDate,
    endDate,
    label: typeof query?.label === 'string' ? query.label : null,
    budgetPeriodName:
      typeof query?.budgetPeriodName === 'string' ? query.budgetPeriodName : null,
    reportType:
      typeof query?.reportType === 'string' &&
      ['annual', 'final', 'internal', 'custom'].includes(query.reportType)
        ? (query.reportType as 'annual' | 'final' | 'internal' | 'custom')
        : 'custom',
  })
}
