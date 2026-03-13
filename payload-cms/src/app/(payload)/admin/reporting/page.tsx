import React from 'react'
import Link from 'next/link'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { resolveReportingPeriod } from '@/reporting/period'
import { getReportingCenterPayload } from '@/reporting/reportingCenter'
import type { ReportingCohortFilters } from '@/reporting/types'
import { isSchemaMismatchError, schemaRepairHint } from '@/reporting/schema'

type ReportingPeriodDoc = {
  id: string | number
  label?: string
  budgetPeriodName?: string | null
  reportType?: 'annual' | 'final' | 'internal' | 'custom'
  startDate?: string
  endDate?: string
  status?: string
}

type SavedViewDoc = {
  id: string | number
  label?: string
  filters?: Record<string, unknown>
  reportType?: 'annual' | 'final' | 'internal' | 'custom'
  reportingPeriod?: string | number | { id?: string | number } | null
  startDate?: string
  endDate?: string
  isShared?: boolean
}

type OptionDoc = {
  id: string | number
  title?: string
  firstName?: string
  lastName?: string
  email?: string
}

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const statusBadge = (status: string | undefined) => {
  if (status === 'submitted') return { bg: '#dcfce7', color: '#166534', label: 'Submitted' }
  if (status === 'in_progress' || status === 'active') return { bg: '#fef9c3', color: '#854d0e', label: 'Active' }
  return { bg: '#e2e8f0', color: '#334155', label: 'Draft' }
}

const parseBool = (value: string | undefined): boolean | null => {
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

const formatTrendValue = (metricKey: string, value: number | null) => {
  if (value == null || Number.isNaN(value)) return 'N/A'
  if (metricKey.includes('rate')) return `${Math.round(value * 1000) / 10}%`
  return String(Math.round(value))
}

export default async function AdminReportingPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {}
  const selectedPeriodId = typeof params.periodId === 'string' ? params.periodId : ''
  const selectedStartDate = typeof params.startDate === 'string' ? params.startDate : ''
  const selectedEndDate = typeof params.endDate === 'string' ? params.endDate : ''
  const selectedViewId = typeof params.viewId === 'string' ? params.viewId : ''

  const payload = await getPayload({ config: configPromise })

  const [classes, classrooms, professors] = await Promise.all([
    payload.find({
      collection: 'classes',
      depth: 0,
      limit: 200,
      sort: 'title',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'classrooms',
      depth: 0,
      limit: 300,
      sort: 'title',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'users',
      depth: 0,
      limit: 200,
      sort: 'lastName',
      where: {
        role: {
          equals: 'professor',
        },
      },
      overrideAccess: true,
    }),
  ])

  let setupError: string | null = null
  let periods: { docs: ReportingPeriodDoc[] } = { docs: [] }
  let savedViews: { docs: SavedViewDoc[] } = { docs: [] }

  try {
    const [periodResult, savedViewResult] = await Promise.all([
      payload.find({
        collection: 'reporting-periods',
        depth: 0,
        limit: 100,
        sort: '-startDate',
        overrideAccess: true,
      }),
      payload.find({
        collection: 'reporting-saved-views',
        depth: 0,
        limit: 100,
        sort: '-updatedAt',
        overrideAccess: true,
      }),
    ])
    periods = { docs: periodResult.docs as ReportingPeriodDoc[] }
    savedViews = { docs: savedViewResult.docs as SavedViewDoc[] }
  } catch (error) {
    if (!isSchemaMismatchError(error)) throw error
    setupError = schemaRepairHint
  }

  const savedView = selectedViewId
    ? (savedViews.docs as SavedViewDoc[]).find((view) => String(view.id) === selectedViewId) ?? null
    : null

  const filterFromView = (savedView?.filters ?? {}) as Record<string, unknown>

  const cohortFilters: Partial<ReportingCohortFilters> = {
    classId:
      typeof params.classId === 'string'
        ? params.classId
        : typeof filterFromView.classId === 'string'
          ? filterFromView.classId
          : null,
    professorId:
      typeof params.professorId === 'string'
        ? params.professorId
        : typeof filterFromView.professorId === 'string'
          ? filterFromView.professorId
          : null,
    classroomId:
      typeof params.classroomId === 'string'
        ? params.classroomId
        : typeof filterFromView.classroomId === 'string'
          ? filterFromView.classroomId
          : null,
    firstGen:
      typeof params.firstGen === 'string'
        ? parseBool(params.firstGen)
        : typeof filterFromView.firstGen === 'boolean'
          ? filterFromView.firstGen
          : null,
    transfer:
      typeof params.transfer === 'string'
        ? parseBool(params.transfer)
        : typeof filterFromView.transfer === 'boolean'
          ? filterFromView.transfer
          : null,
  }

  const periodQuery = selectedPeriodId
    ? `periodId=${encodeURIComponent(selectedPeriodId)}`
    : selectedStartDate && selectedEndDate
      ? `startDate=${encodeURIComponent(selectedStartDate)}&endDate=${encodeURIComponent(selectedEndDate)}`
      : ''

  const filterQuery = new URLSearchParams()
  if (cohortFilters.classId) filterQuery.set('classId', String(cohortFilters.classId))
  if (cohortFilters.professorId) filterQuery.set('professorId', String(cohortFilters.professorId))
  if (cohortFilters.classroomId) filterQuery.set('classroomId', String(cohortFilters.classroomId))
  if (cohortFilters.firstGen != null) filterQuery.set('firstGen', String(cohortFilters.firstGen))
  if (cohortFilters.transfer != null) filterQuery.set('transfer', String(cohortFilters.transfer))
  const scopedQuery = [periodQuery, filterQuery.toString()].filter(Boolean).join('&')
  const buildScopedQuery = (
    updates: Record<string, string | number | boolean | null | undefined>,
    removeKeys: string[] = [],
  ) => {
    const next = new URLSearchParams(scopedQuery)
    removeKeys.forEach((key) => next.delete(key))
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === '') {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    })
    return next.toString()
  }

  let centerPayload:
    | Awaited<ReturnType<typeof getReportingCenterPayload>>
    | null = null
  let periodError: string | null = null

  if (selectedPeriodId || (selectedStartDate && selectedEndDate)) {
    try {
      const period = selectedPeriodId
        ? (() => {
            const selected = periods.docs.find(
              (periodDoc) => String((periodDoc as ReportingPeriodDoc).id) === selectedPeriodId,
            ) as ReportingPeriodDoc | undefined
            if (!selected) throw new Error('Selected period not found.')
            return resolveReportingPeriod({
              startDate: String(selected.startDate ?? ''),
              endDate: String(selected.endDate ?? ''),
              label: selected.label ?? null,
              budgetPeriodName: selected.budgetPeriodName ?? null,
              reportType: selected.reportType ?? 'custom',
            })
          })()
        : resolveReportingPeriod({
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            reportType: 'custom',
            label: 'Custom date range',
          })

      centerPayload = await getReportingCenterPayload(payload, {
        mode: period.reportType === 'internal' ? 'internal' : 'rppr',
        period,
        filters: cohortFilters,
      })
    } catch (error) {
      payload.logger.error(
        { err: error },
        'Reporting center summary generation failed for admin/reporting page',
      )
      periodError = isSchemaMismatchError(error)
        ? schemaRepairHint
        : 'Unable to generate reporting center summary for the selected period.'
    }
  }

  const selectedMetric = typeof params.metricKey === 'string' ? params.metricKey : ''

  return (
    <Gutter>
      <div style={{ maxWidth: 1220, margin: '24px auto 80px' }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: 'var(--cpp-muted)',
            fontWeight: 700,
          }}
        >
          Reporting Center
        </div>
        <h1 style={{ fontSize: 30, margin: '8px 0 10px', color: 'var(--cpp-ink)' }}>
          NSF Reporting Center
        </h1>
        <p style={{ color: 'var(--cpp-muted)', lineHeight: 1.6, maxWidth: 820 }}>
          Period-specific reporting workspace for official exports, drilldowns, data quality checks,
          narrative drafts, and provenance history. Operational dashboard metrics remain separate.
        </p>
        {setupError ? (
          <div
            style={{
              marginTop: 12,
              borderRadius: 8,
              border: '1px solid #fbbf24',
              background: '#fffbeb',
              color: '#92400e',
              padding: '10px 12px',
              fontSize: 14,
            }}
          >
            {setupError}
          </div>
        ) : null}

        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/collections/reporting-periods" style={{ textDecoration: 'none' }}>
            <div style={{ borderRadius: 8, border: '1px solid var(--admin-surface-border)', padding: '8px 12px', color: 'var(--cpp-ink)' }}>
              Reporting periods
            </div>
          </Link>
          <Link href="/admin/collections/reporting-saved-views" style={{ textDecoration: 'none' }}>
            <div style={{ borderRadius: 8, border: '1px solid var(--admin-surface-border)', padding: '8px 12px', color: 'var(--cpp-ink)' }}>
              Saved views
            </div>
          </Link>
          <Link href="/admin/collections/rppr-reports" style={{ textDecoration: 'none' }}>
            <div style={{ borderRadius: 8, border: '1px solid var(--admin-surface-border)', padding: '8px 12px', color: 'var(--cpp-ink)' }}>
              RPPR narratives
            </div>
          </Link>
          <Link href="/admin/collections/reporting-snapshots" style={{ textDecoration: 'none' }}>
            <div style={{ borderRadius: 8, border: '1px solid var(--admin-surface-border)', padding: '8px 12px', color: 'var(--cpp-ink)' }}>
              Snapshots
            </div>
          </Link>
          <Link href="/admin/collections/reporting-evidence-links" style={{ textDecoration: 'none' }}>
            <div style={{ borderRadius: 8, border: '1px solid var(--admin-surface-border)', padding: '8px 12px', color: 'var(--cpp-ink)' }}>
              Evidence links
            </div>
          </Link>
          <Link href="/admin/collections/reporting-product-records" style={{ textDecoration: 'none' }}>
            <div style={{ borderRadius: 8, border: '1px solid var(--admin-surface-border)', padding: '8px 12px', color: 'var(--cpp-ink)' }}>
              Product records
            </div>
          </Link>
        </div>

        <div
          style={{
            marginTop: 16,
            border: '1px solid var(--admin-surface-border)',
            borderRadius: 10,
            padding: 14,
            background: 'var(--admin-surface)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--cpp-ink)' }}>Date range selector</div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--cpp-muted)' }}>
            Current custom range: {selectedStartDate || 'n/a'} to {selectedEndDate || 'n/a'}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link
              href={`/admin/reporting?${buildScopedQuery(
                { startDate: '2026-01-01', endDate: '2026-03-31' },
                ['periodId'],
              )}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '6px 10px', color: 'var(--cpp-ink)', fontSize: 12 }}>
                Q1 2026
              </div>
            </Link>
            <Link
              href={`/admin/reporting?${buildScopedQuery(
                { startDate: '2026-01-01', endDate: '2026-12-31' },
                ['periodId'],
              )}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '6px 10px', color: 'var(--cpp-ink)', fontSize: 12 }}>
                2026 YTD
              </div>
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            border: '1px solid var(--admin-surface-border)',
            borderRadius: 10,
            padding: 14,
            background: 'var(--admin-surface)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--cpp-ink)' }}>Saved views</div>
          <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
            {(savedViews.docs as SavedViewDoc[]).slice(0, 8).map((view) => {
              const periodId = toId(view.reportingPeriod)
              const viewStart =
                typeof view.startDate === 'string' ? view.startDate.slice(0, 10) : null
              const viewEnd = typeof view.endDate === 'string' ? view.endDate.slice(0, 10) : null
              const href = periodId
                ? `/admin/reporting?viewId=${view.id}&periodId=${periodId}`
                : viewStart && viewEnd
                  ? `/admin/reporting?viewId=${view.id}&startDate=${encodeURIComponent(viewStart)}&endDate=${encodeURIComponent(viewEnd)}`
                  : `/admin/reporting?viewId=${view.id}`
              return (
                <Link
                  key={String(view.id)}
                  href={href}
                  style={{
                    textDecoration: 'none',
                    border: selectedViewId === String(view.id) ? '1px solid #334155' : '1px solid var(--admin-surface-border)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    color: 'var(--cpp-ink)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span>{view.label ?? `Saved view ${view.id}`}</span>
                    {view.isShared ? (
                      <span style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>shared</span>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            border: '1px solid var(--admin-surface-border)',
            borderRadius: 10,
            padding: 14,
            background: 'var(--admin-surface)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--cpp-ink)' }}>Select reporting period</div>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {(periods.docs as ReportingPeriodDoc[]).map((period) => {
              const badge = statusBadge(period.status)
              return (
                <Link
                  key={String(period.id)}
                  href={`/admin/reporting?${buildScopedQuery({ periodId: period.id }, ['startDate', 'endDate'])}`}
                  style={{
                    textDecoration: 'none',
                    border:
                      selectedPeriodId === String(period.id)
                        ? '1px solid #334155'
                        : '1px solid var(--admin-surface-border)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'var(--cpp-ink)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{period.label ?? `Period ${period.id}`}</div>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                      {(period.startDate ?? '').slice(0, 10)} to {(period.endDate ?? '').slice(0, 10)}
                      {period.budgetPeriodName ? ` | ${period.budgetPeriodName}` : ''}
                    </div>
                  </div>
                  <div
                    style={{
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      background: badge.bg,
                      color: badge.color,
                    }}
                  >
                    {badge.label}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {selectedPeriodId || (selectedStartDate && selectedEndDate) ? (
          <div
            style={{
              marginTop: 16,
              border: '1px solid var(--admin-surface-border)',
              borderRadius: 10,
              padding: 14,
              background: 'var(--admin-surface)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--cpp-ink)' }}>Cohort filters</div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Class</div>
                <div style={{ marginTop: 4, display: 'grid', gap: 4 }}>
                  <Link href={`/admin/reporting?${buildScopedQuery({}, ['classId'])}`} style={{ textDecoration: 'none', color: 'var(--cpp-ink)' }}>All</Link>
                  {(classes.docs as OptionDoc[]).slice(0, 8).map((item) => (
                    <Link key={String(item.id)} href={`/admin/reporting?${buildScopedQuery({ classId: item.id })}`} style={{ textDecoration: 'none', color: cohortFilters.classId === String(item.id) ? 'var(--cpp-ink)' : 'var(--cpp-muted)', fontWeight: cohortFilters.classId === String(item.id) ? 700 : 400 }}>
                      {item.title ?? `Class ${item.id}`}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Professor</div>
                <div style={{ marginTop: 4, display: 'grid', gap: 4 }}>
                  <Link href={`/admin/reporting?${buildScopedQuery({}, ['professorId'])}`} style={{ textDecoration: 'none', color: 'var(--cpp-ink)' }}>All</Link>
                  {(professors.docs as OptionDoc[]).slice(0, 8).map((item) => (
                    <Link key={String(item.id)} href={`/admin/reporting?${buildScopedQuery({ professorId: item.id })}`} style={{ textDecoration: 'none', color: cohortFilters.professorId === String(item.id) ? 'var(--cpp-ink)' : 'var(--cpp-muted)', fontWeight: cohortFilters.professorId === String(item.id) ? 700 : 400 }}>
                      {`${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || item.email || `Professor ${item.id}`}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Classroom</div>
                <div style={{ marginTop: 4, display: 'grid', gap: 4 }}>
                  <Link href={`/admin/reporting?${buildScopedQuery({}, ['classroomId'])}`} style={{ textDecoration: 'none', color: 'var(--cpp-ink)' }}>All</Link>
                  {(classrooms.docs as OptionDoc[]).slice(0, 8).map((item) => (
                    <Link key={String(item.id)} href={`/admin/reporting?${buildScopedQuery({ classroomId: item.id })}`} style={{ textDecoration: 'none', color: cohortFilters.classroomId === String(item.id) ? 'var(--cpp-ink)' : 'var(--cpp-muted)', fontWeight: cohortFilters.classroomId === String(item.id) ? 700 : 400 }}>
                      {item.title ?? `Classroom ${item.id}`}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>First-gen / Transfer</div>
                <div style={{ marginTop: 4, display: 'grid', gap: 4 }}>
                  <Link href={`/admin/reporting?${buildScopedQuery({ firstGen: true })}`} style={{ textDecoration: 'none', color: cohortFilters.firstGen === true ? 'var(--cpp-ink)' : 'var(--cpp-muted)', fontWeight: cohortFilters.firstGen === true ? 700 : 400 }}>First-gen only</Link>
                  <Link href={`/admin/reporting?${buildScopedQuery({ transfer: true })}`} style={{ textDecoration: 'none', color: cohortFilters.transfer === true ? 'var(--cpp-ink)' : 'var(--cpp-muted)', fontWeight: cohortFilters.transfer === true ? 700 : 400 }}>Transfer only</Link>
                  <Link href={`/admin/reporting?${buildScopedQuery({}, ['firstGen', 'transfer'])}`} style={{ textDecoration: 'none', color: cohortFilters.firstGen == null && cohortFilters.transfer == null ? 'var(--cpp-ink)' : 'var(--cpp-muted)', fontWeight: cohortFilters.firstGen == null && cohortFilters.transfer == null ? 700 : 400 }}>Clear cohort flags</Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {periodError ? (
          <div style={{ marginTop: 16, color: '#b91c1c', fontWeight: 600 }}>{periodError}</div>
        ) : null}

        {centerPayload ? (
          <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700, color: 'var(--cpp-ink)' }}>Official reporting summary</div>
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--cpp-muted)' }}>
                Completeness: {centerPayload.rppr?.completeness.overallStatus ?? 'n/a'} ({centerPayload.rppr?.completeness.readinessScore ?? 0}%)
              </div>
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                <Link href={`/admin/reporting?${buildScopedQuery({ metricKey: 'class_completion_rate' })}`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px', color: 'var(--cpp-ink)' }}>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Unique active learners</div>
                    <div style={{ fontWeight: 800, fontSize: 22 }}>{centerPayload.summary.participation.uniqueLearnersActive}</div>
                  </div>
                </Link>
                <Link href={`/admin/reporting?${buildScopedQuery({ metricKey: 'class_completion_rate' })}`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px', color: 'var(--cpp-ink)' }}>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Classes tracked</div>
                    <div style={{ fontWeight: 800, fontSize: 22 }}>{centerPayload.summary.classCompletion.length}</div>
                  </div>
                </Link>
                <Link href={`/admin/reporting?${buildScopedQuery({ metricKey: 'quiz_mastery_rate' })}`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px', color: 'var(--cpp-ink)' }}>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Quizzes tracked</div>
                    <div style={{ fontWeight: 800, fontSize: 22 }}>{centerPayload.summary.quizPerformance.length}</div>
                  </div>
                </Link>
                <Link href={`/admin/reporting?${buildScopedQuery({ metricKey: 'weekly_active_learners' })}`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px', color: 'var(--cpp-ink)' }}>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Product artifacts</div>
                    <div style={{ fontWeight: 800, fontSize: 22 }}>{centerPayload.summary.productsInPeriod.total}</div>
                  </div>
                </Link>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&format=json`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Reporting Center JSON</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=summary`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Summary CSV</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=participants`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Participants CSV</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=organizations`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Organizations CSV</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=products`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Products CSV</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=evidence`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Evidence CSV</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=data-quality`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Data quality CSV</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=compliance`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Compliance CSV</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&action=save-view&label=Reporting%20Center%20View&shared=false`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Save private view</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&action=save-view&label=Reporting%20Center%20Shared%20View&shared=true`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Save shared view</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&action=create-snapshot&reuseIfUnchanged=true`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-ink)' }}>Create immutable snapshot</div>
                </Link>
                <Link href={`/api/analytics/reporting-center?${scopedQuery}&format=pdf`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--cpp-muted)' }}>PDF export scaffold</div>
                </Link>
              </div>
            </div>

            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700 }}>KPI trend vs previous snapshot</div>
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {centerPayload.trendComparisons.map((trend) => (
                  <div key={trend.metricKey} style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{trend.label}</div>
                    <div style={{ marginTop: 4, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                      {formatTrendValue(trend.metricKey, trend.currentValue)}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--cpp-muted)' }}>
                      {trend.previousValue == null
                        ? 'No previous comparable snapshot'
                        : `Prev: ${formatTrendValue(trend.metricKey, trend.previousValue)} | Delta: ${trend.deltaPercent == null ? 'n/a' : `${Math.round(trend.deltaPercent * 1000) / 10}%`}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700 }}>Evidence linking</div>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--cpp-muted)' }}>
                Linked evidence items in period: {centerPayload.rppr?.evidence.totalEvidenceLinks ?? 0}
              </div>
              <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {(centerPayload.rppr?.evidence.bySection ?? []).map((entry) => (
                  <div key={entry.section} style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{entry.section}</div>
                    <div style={{ marginTop: 2, fontWeight: 800 }}>{entry.count}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link href={`/api/analytics/nsf-rppr?${scopedQuery}&format=csv&type=evidence`} style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '7px 10px', color: 'var(--cpp-ink)' }}>RPPR evidence CSV</div>
                </Link>
                <Link href="/admin/collections/reporting-evidence-links" style={{ textDecoration: 'none' }}>
                  <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '7px 10px', color: 'var(--cpp-ink)' }}>Manage evidence links</div>
                </Link>
              </div>
            </div>

            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700 }}>Metric definition registry</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {centerPayload.metricDefinitions.map((metric) => (
                  <div key={metric.key} style={{ border: '1px dashed var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700 }}>{metric.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 3 }}>{metric.description}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--cpp-muted)' }}>
                      Numerator: {metric.numerator}
                    </div>
                    <div style={{ marginTop: 2, fontSize: 12, color: 'var(--cpp-muted)' }}>
                      Denominator: {metric.denominator}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {centerPayload.complianceChecklist ? (
              <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
                <div style={{ fontWeight: 700 }}>NSF RPPR compliance checklist</div>
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--cpp-muted)' }}>
                  Overall status: {centerPayload.complianceChecklist.overallStatus} | Met {centerPayload.complianceChecklist.metCount} of {centerPayload.complianceChecklist.checks.length}
                </div>
                <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                  {centerPayload.complianceChecklist.checks.map((check) => (
                    <div key={check.key} style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontWeight: 700, color: check.status === 'missing' ? '#b91c1c' : 'var(--cpp-ink)' }}>
                        [{check.status.toUpperCase()}] {check.label}
                      </div>
                      <div style={{ marginTop: 3, fontSize: 12, color: 'var(--cpp-muted)' }}>{check.detail}</div>
                      <div style={{ marginTop: 4, fontSize: 12, color: 'var(--cpp-muted)' }}>
                        Action: {check.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700 }}>Data quality panel</div>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--cpp-muted)' }}>
                Confidence: {centerPayload.dataQuality.confidence}
              </div>
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                {centerPayload.dataQuality.issues.length ? (
                  centerPayload.dataQuality.issues.map((issue) => (
                    <div key={issue.key} style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontWeight: 700, color: issue.severity === 'high' ? '#b91c1c' : 'var(--cpp-ink)' }}>
                        [{issue.severity.toUpperCase()}] {issue.message}
                      </div>
                      {issue.recommendation ? (
                        <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 3 }}>
                          {issue.recommendation}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                    No quality blockers detected for this scope.
                  </div>
                )}
              </div>
            </div>

            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700 }}>Anomaly checks</div>
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                {centerPayload.anomalies.length ? (
                  centerPayload.anomalies.map((anomaly) => (
                    <div key={anomaly.key} style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontWeight: 700 }}>{anomaly.message}</div>
                      <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 3 }}>
                        Metric: {anomaly.metricKey} | Severity: {anomaly.severity}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                    No threshold anomalies detected.
                  </div>
                )}
              </div>
            </div>

            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700 }}>Cross-check validations</div>
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                {centerPayload.crossChecks.map((check) => (
                  <div key={check.key} style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700 }}>{check.message}</div>
                    <div style={{ marginTop: 3, fontSize: 12, color: 'var(--cpp-muted)' }}>
                      Status: {check.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700 }}>Narrative builder (draft only)</div>
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontWeight: 700 }}>Accomplishments</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.5 }}>
                    {centerPayload.narrativeDrafts.accomplishmentsDraft}
                  </div>
                </div>
                <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontWeight: 700 }}>Impact</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.5 }}>
                    {centerPayload.narrativeDrafts.impactDraft}
                  </div>
                </div>
                <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontWeight: 700 }}>Changes / Problems</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.5 }}>
                    {centerPayload.narrativeDrafts.changesProblemsDraft}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700 }}>Metric drilldown</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {centerPayload.metricDefinitions.map((metric) => (
                  <Link
                    key={metric.key}
                    href={`/admin/reporting?${buildScopedQuery({ metricKey: metric.key })}`}
                    style={{
                      textDecoration: 'none',
                      border: selectedMetric === metric.key ? '1px solid #334155' : '1px solid var(--admin-surface-border)',
                      borderRadius: 8,
                      padding: '6px 10px',
                      color: 'var(--cpp-ink)',
                      fontSize: 12,
                    }}
                  >
                    {metric.name}
                  </Link>
                ))}
              </div>
              {selectedMetric ? (
                <div style={{ marginTop: 10, border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontWeight: 700 }}>Drilldown API</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--cpp-muted)' }}>
                    Learner-level drilldown rows are available to authorized roles via:
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12 }}>
                    <Link href={`/api/analytics/reporting-center?${buildScopedQuery({ action: 'drilldown', metricKey: selectedMetric })}`}>
                      /api/analytics/reporting-center?action=drilldown&metricKey={selectedMetric}
                    </Link>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12 }}>
                    <Link href={`/api/analytics/reporting-center?${buildScopedQuery({ action: 'drilldown', metricKey: selectedMetric, format: 'csv' })}`}>
                      Download drilldown CSV
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            <div style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 10, padding: 14, background: 'var(--admin-surface)' }}>
              <div style={{ fontWeight: 700 }}>Audit timeline and provenance</div>
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                {centerPayload.recentAuditEvents.slice(0, 8).map((event) => (
                  <div key={String(event.id)} style={{ border: '1px solid var(--admin-surface-border)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700 }}>{String(event.eventType ?? 'event')}</div>
                    <div style={{ marginTop: 3, fontSize: 12, color: 'var(--cpp-muted)' }}>
                      {String((event as { createdAt?: string }).createdAt ?? '')} | {String((event as { exportType?: string }).exportType ?? '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Gutter>
  )
}
