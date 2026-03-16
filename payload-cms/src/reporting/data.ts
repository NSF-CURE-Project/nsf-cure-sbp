import type { Payload } from 'payload'
import { buildPeriodWhere, mergeWhere, resolveReportingPeriod, type ReportingPeriod } from './period.ts'
import { isMissingColumnError, isSchemaMismatchError } from './schema.ts'

type PayloadFindResult = {
  docs: unknown[]
  hasNextPage?: boolean
}

type PayloadFindFn = (args: {
  collection: string
  depth?: number
  limit?: number
  page?: number
  sort?: string
  where?: Record<string, unknown>
}) => Promise<PayloadFindResult>

export const findAllDocs = async (
  payload: Payload,
  collection: string,
  options?: {
    where?: Record<string, unknown>
    sort?: string
    depth?: number
    limit?: number
    failSoftOnSchemaMismatch?: boolean
    retryWithoutWhereOnMissingColumn?: boolean
  },
): Promise<Record<string, unknown>[]> => {
  const find = payload.find as unknown as PayloadFindFn
  const docs: Record<string, unknown>[] = []
  let page = 1
  let hasNextPage = true
  const limit = options?.limit ?? 500
  const failSoftOnSchemaMismatch = options?.failSoftOnSchemaMismatch ?? true

  while (hasNextPage) {
    let result: PayloadFindResult
    try {
      result = await find({
        collection,
        depth: options?.depth ?? 0,
        limit,
        page,
        sort: options?.sort ?? 'id',
        where: options?.where,
      })
    } catch (error) {
      const shouldRetryUnfiltered =
        Boolean(options?.retryWithoutWhereOnMissingColumn && options?.where) &&
        isMissingColumnError(error)
      if (shouldRetryUnfiltered) {
        try {
          result = await find({
            collection,
            depth: options?.depth ?? 0,
            limit,
            page,
            sort: options?.sort ?? 'id',
          })
        } catch (retryError) {
          if (!failSoftOnSchemaMismatch || !isSchemaMismatchError(retryError)) throw retryError
          payload.logger.warn(
            {
              collection,
              page,
              err: retryError,
            },
            'Reporting query fallback returned empty result because schema is incomplete.',
          )
          return docs
        }
      } else if (failSoftOnSchemaMismatch && isSchemaMismatchError(error)) {
        payload.logger.warn(
          {
            collection,
            page,
            err: error,
          },
          'Reporting query returned empty result because schema is incomplete.',
        )
        return docs
      } else {
        throw error
      }
    }

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
  const periodId =
    typeof query?.periodId === 'string' && query.periodId.trim()
      ? (() => {
          const parsed = Number(query.periodId)
          return Number.isInteger(parsed) ? parsed : null
        })()
      : null
  if (periodId) {
    let periodDoc: unknown
    try {
      periodDoc = await payload.findByID({
        collection: 'reporting-periods',
        id: periodId,
        depth: 0,
      })
    } catch (error) {
      if (!isSchemaMismatchError(error)) throw error
      payload.logger.warn(
        {
          periodId,
          err: error,
        },
        'Unable to resolve reporting period because schema is incomplete.',
      )
      throw error
    }

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
