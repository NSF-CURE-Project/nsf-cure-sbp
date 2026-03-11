import dotenv from 'dotenv'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createReportingSnapshot } from '@/reporting/snapshots'

dotenv.config({ path: './.env' })

type PeriodDoc = {
  id: string | number
  label?: string
  reportType?: 'annual' | 'final' | 'internal' | 'custom'
  startDate?: string
  endDate?: string
}

const run = async () => {
  const payload = await getPayload({ config: configPromise })
  const payloadAny = payload as any

  const periodId = process.env.REPORTING_PERIOD_ID
  const startDate = process.env.REPORTING_START_DATE
  const endDate = process.env.REPORTING_END_DATE

  const periods: PeriodDoc[] = []
  if (periodId) {
    const period = await payloadAny.findByID({
      collection: 'reporting-periods',
      id: periodId,
      depth: 0,
      overrideAccess: true,
    })
    periods.push(period as PeriodDoc)
  } else if (startDate && endDate) {
    periods.push({
      id: 'custom',
      label: 'Custom env period',
      reportType: 'custom',
      startDate,
      endDate,
    })
  } else {
    const active = await payloadAny.find({
      collection: 'reporting-periods',
      depth: 0,
      limit: 50,
      where: {
        status: {
          equals: 'active',
        },
      },
      overrideAccess: true,
    })
    periods.push(...(active.docs as PeriodDoc[]))
  }

  if (!periods.length) {
    payload.logger.warn('No reporting periods found for snapshot generation.')
    return
  }

  for (const period of periods) {
    if (!period.startDate || !period.endDate) continue
    const reportingPeriodId =
      typeof period.id === 'number'
        ? period.id
        : typeof period.id === 'string' && period.id.trim()
          ? (() => {
              const parsed = Number(period.id)
              return Number.isInteger(parsed) ? parsed : undefined
            })()
          : undefined

    const result = await createReportingSnapshot(
      payload,
      {
        payload,
        user: null,
      } as never,
      {
        mode: period.reportType === 'internal' ? 'internal' : 'rppr',
        period: {
          startDate: period.startDate,
          endDate: period.endDate,
          reportType: period.reportType ?? 'custom',
          label: period.label,
        },
        reportingPeriodId,
        label: process.env.REPORTING_SNAPSHOT_LABEL ?? null,
      },
    )

    payload.logger.info(
      result.reused
        ? `Reused reporting snapshot ${String(result.snapshot.id)} for period ${period.id}`
        : `Created reporting snapshot ${String(result.snapshot.id)} for period ${period.id}`,
    )
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
