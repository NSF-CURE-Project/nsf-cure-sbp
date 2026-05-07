import React from 'react'
import Link from 'next/link'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { resolveReportingPeriod } from '@/reporting/period'
import { getReportingCenterPayload } from '@/reporting/reportingCenter'
import type { ReportingCohortFilters } from '@/reporting/types'
import { isSchemaMismatchError, schemaRepairHint } from '@/reporting/schema'
import { HBar, Donut, Sparkline, ReportingPanel } from '@/views/reporting/charts'

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

  const activePeriod = (periods.docs as ReportingPeriodDoc[]).find(
    (p) => String(p.id) === selectedPeriodId,
  )
  const hasScope = Boolean(selectedPeriodId || (selectedStartDate && selectedEndDate))

  return (
    <Gutter>
      <style>{`
        .rs-shell {
          max-width: 1240px;
          margin: 24px auto 96px;
          padding: 0 4px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .rs-hero {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(21, 83, 207, 0.18);
          background:
            radial-gradient(80% 100% at 0% 0%, rgba(21, 83, 207, 0.10) 0%, rgba(21, 83, 207, 0) 60%),
            radial-gradient(80% 100% at 100% 100%, rgba(168, 85, 247, 0.10) 0%, rgba(168, 85, 247, 0) 60%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 255, 0.95) 100%);
          padding: 24px 28px;
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.85) inset, 0 18px 38px rgba(15, 23, 42, 0.05);
        }
        .rs-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #1553cf;
          background: rgba(21, 83, 207, 0.08);
          border: 1px solid rgba(21, 83, 207, 0.16);
          padding: 4px 10px;
          border-radius: 999px;
        }
        .rs-title {
          font-size: 30px;
          font-weight: 800;
          color: var(--cpp-ink);
          letter-spacing: -0.015em;
          margin: 12px 0 6px;
          line-height: 1.15;
        }
        .rs-sub {
          color: var(--cpp-muted);
          line-height: 1.55;
          max-width: 720px;
          font-size: 14px;
        }
        .rs-meta-strip {
          margin-top: 18px;
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
        }
        .rs-meta-chip {
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
          padding: 9px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(15, 23, 42, 0.08);
          min-width: 140px;
        }
        .rs-meta-chip-label {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          color: var(--cpp-muted);
        }
        .rs-meta-chip-value {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--cpp-ink);
          font-variant-numeric: tabular-nums;
          line-height: 1.2;
        }
        .rs-meta-chip-meta {
          font-size: 11px;
          color: var(--cpp-muted);
        }
        .rs-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rs-section-head {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 2px;
        }
        .rs-section-eyebrow {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.9px;
          color: #1553cf;
        }
        .rs-section-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--cpp-ink);
          letter-spacing: -0.01em;
        }
        .rs-section-sub {
          font-size: 13px;
          color: var(--cpp-muted);
        }
        .rs-card {
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.07);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 250, 255, 0.92) 100%);
          padding: 16px 18px;
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 6px 14px rgba(15, 23, 42, 0.03);
        }
        .rs-card-title {
          font-size: 14px;
          font-weight: 800;
          color: var(--cpp-ink);
          letter-spacing: -0.005em;
        }
        .rs-card-sub {
          font-size: 12px;
          color: var(--cpp-muted);
          margin-top: 3px;
        }
        .rs-grid-2 {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .rs-grid-3 {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .rs-grid-4 {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        @media (max-width: 920px) {
          .rs-grid-3, .rs-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 600px) {
          .rs-grid-2, .rs-grid-3, .rs-grid-4 { grid-template-columns: 1fr; }
        }
        .rs-controls {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
          gap: 12px;
        }
        @media (max-width: 920px) { .rs-controls { grid-template-columns: 1fr; } }
        .rs-period-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(15, 23, 42, 0.07);
          border-radius: 10px;
          padding: 10px 12px;
          color: var(--cpp-ink);
          text-decoration: none;
          background: rgba(255, 255, 255, 0.7);
          transition: border-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;
        }
        .rs-period-row:hover {
          border-color: rgba(21, 83, 207, 0.32);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
          transform: translateY(-1px);
        }
        .rs-period-row.is-active {
          border-color: #1553cf;
          box-shadow: 0 0 0 3px rgba(21, 83, 207, 0.12);
          background: rgba(21, 83, 207, 0.04);
        }
        .rs-status-badge {
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
        }
        .rs-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--cpp-ink);
          text-decoration: none;
          background: rgba(15, 23, 42, 0.04);
          border: 1px solid rgba(15, 23, 42, 0.06);
          transition: background 140ms ease, border-color 140ms ease;
        }
        .rs-pill:hover {
          background: rgba(15, 23, 42, 0.07);
          border-color: rgba(15, 23, 42, 0.14);
        }
        .rs-pill.is-active {
          background: rgba(21, 83, 207, 0.10);
          border-color: rgba(21, 83, 207, 0.36);
          color: #1553cf;
        }
        .rs-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          text-decoration: none;
          background: linear-gradient(180deg, #1d63e3 0%, #1553cf 100%);
          box-shadow: 0 6px 14px rgba(21, 83, 207, 0.24), 0 1px 0 rgba(255, 255, 255, 0.18) inset;
          transition: transform 140ms ease, box-shadow 140ms ease, filter 140ms ease;
        }
        .rs-cta-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.04);
          box-shadow: 0 10px 22px rgba(21, 83, 207, 0.28), 0 1px 0 rgba(255, 255, 255, 0.18) inset;
        }
        .rs-kpi {
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.07);
          background: rgba(255, 255, 255, 0.92);
          padding: 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-decoration: none;
          color: var(--cpp-ink);
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
        }
        .rs-kpi:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
          border-color: rgba(21, 83, 207, 0.30);
        }
        .rs-kpi-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--cpp-muted);
        }
        .rs-kpi-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--cpp-ink);
          font-variant-numeric: tabular-nums;
          line-height: 1.1;
        }
        .rs-kpi-meta {
          font-size: 11.5px;
          color: var(--cpp-muted);
        }
        .rs-issue {
          border-left: 3px solid rgba(15, 23, 42, 0.12);
          background: rgba(15, 23, 42, 0.02);
          border-radius: 10px;
          padding: 10px 12px;
        }
        .rs-issue.is-high { border-left-color: #b91c1c; background: rgba(185, 28, 28, 0.04); }
        .rs-issue.is-warning { border-left-color: #b45309; background: rgba(180, 83, 9, 0.04); }
        .rs-issue.is-positive { border-left-color: #127455; background: rgba(20, 131, 92, 0.04); }
        .rs-issue-title { font-size: 13px; font-weight: 700; color: var(--cpp-ink); }
        .rs-issue-detail { font-size: 12px; color: var(--cpp-muted); margin-top: 3px; line-height: 1.5; }
        .rs-empty {
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.03);
          color: var(--cpp-muted);
          font-size: 12.5px;
          font-style: italic;
        }
        .rs-trend {
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.07);
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.85);
        }
        .rs-trend-label { font-size: 11px; color: var(--cpp-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700; }
        .rs-trend-value { font-weight: 800; color: var(--cpp-ink); font-size: 18px; margin-top: 4px; font-variant-numeric: tabular-nums; }
        .rs-trend-delta { font-size: 11px; margin-top: 4px; font-weight: 700; }
        .rs-trend-delta.is-up { color: #127455; }
        .rs-trend-delta.is-down { color: #b91c1c; }
        .rs-trend-delta.is-flat { color: var(--cpp-muted); }
        .rs-cohort-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        .rs-checklist-row {
          display: grid;
          grid-template-columns: 24px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.02);
        }
        .rs-checklist-icon {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }
      `}</style>
      <div className="rs-shell">
        <header className="rs-hero">
          <span className="rs-eyebrow">
            <svg
              aria-hidden="true"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="M7 14l3-3 3 3 5-5" />
            </svg>
            Reporting Suite
          </span>
          <h1 className="rs-title">NSF institutional analytics &amp; RPPR workspace</h1>
          <p className="rs-sub">
            Period-scoped cohort analytics, snapshot-backed RPPR drafts, and audit-grade exports —
            purpose-built for federal reporting and program review at Cal Poly Pomona.
          </p>
          <div className="rs-meta-strip">
            <div className="rs-meta-chip">
              <span className="rs-meta-chip-label">Active period</span>
              <span className="rs-meta-chip-value">
                {activePeriod?.label ?? (hasScope ? 'Custom range' : 'Not selected')}
              </span>
              <span className="rs-meta-chip-meta">
                {activePeriod
                  ? `${(activePeriod.startDate ?? '').slice(0, 10)} – ${(activePeriod.endDate ?? '').slice(0, 10)}`
                  : selectedStartDate && selectedEndDate
                    ? `${selectedStartDate} – ${selectedEndDate}`
                    : 'Choose a reporting period below'}
              </span>
            </div>
            <div className="rs-meta-chip">
              <span className="rs-meta-chip-label">Periods on file</span>
              <span className="rs-meta-chip-value">{periods.docs.length}</span>
              <span className="rs-meta-chip-meta">{savedViews.docs.length} saved views</span>
            </div>
            <div className="rs-meta-chip">
              <span className="rs-meta-chip-label">Snapshots</span>
              <span className="rs-meta-chip-value">
                {centerPayload?.latestSnapshots?.length ?? '—'}
              </span>
              <span className="rs-meta-chip-meta">
                {centerPayload?.latestSnapshots?.[0]
                  ? `Latest ${String(
                      (centerPayload.latestSnapshots[0] as { createdAt?: string }).createdAt ?? '',
                    ).slice(0, 10)}`
                  : 'Capture one once a period is loaded'}
              </span>
            </div>
            <div className="rs-meta-chip">
              <span className="rs-meta-chip-label">Readiness</span>
              <span className="rs-meta-chip-value">
                {centerPayload?.rppr?.completeness?.readinessScore ?? '—'}
                {centerPayload?.rppr?.completeness?.readinessScore != null ? '%' : ''}
              </span>
              <span className="rs-meta-chip-meta">
                {centerPayload?.rppr?.completeness?.overallStatus ?? 'Load a period to assess'}
              </span>
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/admin/collections/reporting-periods" className="rs-pill">
              Reporting periods
            </Link>
            <Link href="/admin/collections/reporting-saved-views" className="rs-pill">
              Saved views
            </Link>
            <Link href="/admin/collections/rppr-reports" className="rs-pill">
              RPPR narratives
            </Link>
            <Link href="/admin/collections/reporting-snapshots" className="rs-pill">
              Snapshots
            </Link>
            <Link href="/admin/collections/reporting-evidence-links" className="rs-pill">
              Evidence links
            </Link>
            <Link href="/admin/collections/reporting-product-records" className="rs-pill">
              Product records
            </Link>
          </div>
        </header>

        {setupError ? (
          <div
            style={{
              borderRadius: 12,
              border: '1px solid #fbbf24',
              background: '#fffbeb',
              color: '#92400e',
              padding: '12px 14px',
              fontSize: 13.5,
            }}
          >
            {setupError}
          </div>
        ) : null}

        <section className="rs-section">
          <div className="rs-section-head">
            <span className="rs-section-eyebrow">Controls</span>
            <h2 className="rs-section-title">Period &amp; cohort scope</h2>
            <p className="rs-section-sub">
              Pick the reporting period or a saved view; cohort filters apply once a scope is loaded.
            </p>
          </div>
          <div className="rs-controls">
            <div className="rs-card">
              <div className="rs-card-title">Reporting period</div>
              <div className="rs-card-sub">
                {periods.docs.length === 0
                  ? 'No periods configured yet — add one from the collection.'
                  : `${periods.docs.length} period${periods.docs.length === 1 ? '' : 's'} on file`}
              </div>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {(periods.docs as ReportingPeriodDoc[]).map((period) => {
                  const badge = statusBadge(period.status)
                  const isActive = selectedPeriodId === String(period.id)
                  return (
                    <Link
                      key={String(period.id)}
                      href={`/admin/reporting?${buildScopedQuery({ periodId: period.id }, ['startDate', 'endDate'])}`}
                      className={`rs-period-row${isActive ? ' is-active' : ''}`}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700 }}>{period.label ?? `Period ${period.id}`}</div>
                        <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                          {(period.startDate ?? '').slice(0, 10)} → {(period.endDate ?? '').slice(0, 10)}
                          {period.budgetPeriodName ? ` · ${period.budgetPeriodName}` : ''}
                        </div>
                      </div>
                      <span
                        className="rs-status-badge"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px dashed rgba(15, 23, 42, 0.1)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    color: 'var(--cpp-muted)',
                  }}
                >
                  Custom range
                </span>
                <span style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                  {selectedStartDate || '—'} → {selectedEndDate || '—'}
                </span>
                <Link
                  href={`/admin/reporting?${buildScopedQuery(
                    { startDate: '2026-01-01', endDate: '2026-03-31' },
                    ['periodId'],
                  )}`}
                  className="rs-pill"
                >
                  Q1 2026
                </Link>
                <Link
                  href={`/admin/reporting?${buildScopedQuery(
                    { startDate: '2026-01-01', endDate: '2026-12-31' },
                    ['periodId'],
                  )}`}
                  className="rs-pill"
                >
                  2026 YTD
                </Link>
              </div>
            </div>
            <div className="rs-card">
              <div className="rs-card-title">Saved views</div>
              <div className="rs-card-sub">
                {savedViews.docs.length === 0
                  ? 'No saved views yet — save a scope after loading a period.'
                  : `${savedViews.docs.length} view${savedViews.docs.length === 1 ? '' : 's'} on file`}
              </div>
              <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                {(savedViews.docs as SavedViewDoc[]).slice(0, 8).map((view) => {
                  const periodId = toId(view.reportingPeriod)
                  const viewStart =
                    typeof view.startDate === 'string' ? view.startDate.slice(0, 10) : null
                  const viewEnd =
                    typeof view.endDate === 'string' ? view.endDate.slice(0, 10) : null
                  const href = periodId
                    ? `/admin/reporting?viewId=${view.id}&periodId=${periodId}`
                    : viewStart && viewEnd
                      ? `/admin/reporting?viewId=${view.id}&startDate=${encodeURIComponent(viewStart)}&endDate=${encodeURIComponent(viewEnd)}`
                      : `/admin/reporting?viewId=${view.id}`
                  const isActive = selectedViewId === String(view.id)
                  return (
                    <Link
                      key={String(view.id)}
                      href={href}
                      className={`rs-period-row${isActive ? ' is-active' : ''}`}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        {view.label ?? `Saved view ${view.id}`}
                      </span>
                      {view.isShared ? (
                        <span style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>shared</span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
          {hasScope ? (
            <div className="rs-card">
              <div className="rs-card-title">Cohort filters</div>
              <div className="rs-card-sub">Drilldowns and exports will respect these filters.</div>
              <div className="rs-cohort-grid" style={{ marginTop: 12 }}>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--cpp-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                    }}
                  >
                    Class
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <Link
                      href={`/admin/reporting?${buildScopedQuery({}, ['classId'])}`}
                      className={`rs-pill${cohortFilters.classId == null ? ' is-active' : ''}`}
                    >
                      All
                    </Link>
                    {(classes.docs as OptionDoc[]).slice(0, 8).map((item) => (
                      <Link
                        key={String(item.id)}
                        href={`/admin/reporting?${buildScopedQuery({ classId: item.id })}`}
                        className={`rs-pill${
                          cohortFilters.classId === String(item.id) ? ' is-active' : ''
                        }`}
                      >
                        {item.title ?? `Class ${item.id}`}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--cpp-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                    }}
                  >
                    Professor
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <Link
                      href={`/admin/reporting?${buildScopedQuery({}, ['professorId'])}`}
                      className={`rs-pill${cohortFilters.professorId == null ? ' is-active' : ''}`}
                    >
                      All
                    </Link>
                    {(professors.docs as OptionDoc[]).slice(0, 8).map((item) => (
                      <Link
                        key={String(item.id)}
                        href={`/admin/reporting?${buildScopedQuery({ professorId: item.id })}`}
                        className={`rs-pill${
                          cohortFilters.professorId === String(item.id) ? ' is-active' : ''
                        }`}
                      >
                        {`${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() ||
                          item.email ||
                          `Professor ${item.id}`}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--cpp-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                    }}
                  >
                    Classroom
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <Link
                      href={`/admin/reporting?${buildScopedQuery({}, ['classroomId'])}`}
                      className={`rs-pill${cohortFilters.classroomId == null ? ' is-active' : ''}`}
                    >
                      All
                    </Link>
                    {(classrooms.docs as OptionDoc[]).slice(0, 8).map((item) => (
                      <Link
                        key={String(item.id)}
                        href={`/admin/reporting?${buildScopedQuery({ classroomId: item.id })}`}
                        className={`rs-pill${
                          cohortFilters.classroomId === String(item.id) ? ' is-active' : ''
                        }`}
                      >
                        {item.title ?? `Classroom ${item.id}`}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--cpp-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                    }}
                  >
                    Cohort flags
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <Link
                      href={`/admin/reporting?${buildScopedQuery({ firstGen: true })}`}
                      className={`rs-pill${cohortFilters.firstGen === true ? ' is-active' : ''}`}
                    >
                      First-gen only
                    </Link>
                    <Link
                      href={`/admin/reporting?${buildScopedQuery({ transfer: true })}`}
                      className={`rs-pill${cohortFilters.transfer === true ? ' is-active' : ''}`}
                    >
                      Transfer only
                    </Link>
                    <Link
                      href={`/admin/reporting?${buildScopedQuery({}, ['firstGen', 'transfer'])}`}
                      className={`rs-pill${
                        cohortFilters.firstGen == null && cohortFilters.transfer == null
                          ? ' is-active'
                          : ''
                      }`}
                    >
                      Clear flags
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {periodError ? (
          <div
            style={{
              borderRadius: 12,
              border: '1px solid rgba(185, 28, 28, 0.4)',
              background: 'rgba(185, 28, 28, 0.06)',
              color: '#b91c1c',
              padding: '12px 14px',
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            {periodError}
          </div>
        ) : null}

        {!hasScope ? (
          <section className="rs-section">
            <div className="rs-card">
              <div className="rs-card-title">Pick a reporting period to begin</div>
              <div className="rs-card-sub">
                Cohort analytics, RPPR exports, and snapshot-based trend comparisons unlock once a
                scope is loaded above. Most users start with the active annual period.
              </div>
            </div>
          </section>
        ) : null}

        {centerPayload ? (
          <>
            <section className="rs-section">
              <div className="rs-section-head">
                <span className="rs-section-eyebrow">Reporting Overview</span>
                <h2 className="rs-section-title">KPIs for the loaded scope</h2>
                <p className="rs-section-sub">
                  Counts and rates are computed live for the selected period and cohort filters.
                </p>
              </div>
              <div className="rs-grid-4">
                <Link
                  href={`/admin/reporting?${buildScopedQuery({ metricKey: 'class_completion_rate' })}`}
                  className="rs-kpi"
                >
                  <span className="rs-kpi-label">Active learners</span>
                  <span className="rs-kpi-value">
                    {centerPayload.summary.participation.uniqueLearnersActive}
                  </span>
                  <span className="rs-kpi-meta">unique learners in scope</span>
                </Link>
                <Link
                  href={`/admin/reporting?${buildScopedQuery({ metricKey: 'class_completion_rate' })}`}
                  className="rs-kpi"
                >
                  <span className="rs-kpi-label">Classes tracked</span>
                  <span className="rs-kpi-value">
                    {centerPayload.summary.classCompletion.length}
                  </span>
                  <span className="rs-kpi-meta">with completion data</span>
                </Link>
                <Link
                  href={`/admin/reporting?${buildScopedQuery({ metricKey: 'quiz_mastery_rate' })}`}
                  className="rs-kpi"
                >
                  <span className="rs-kpi-label">Quizzes tracked</span>
                  <span className="rs-kpi-value">
                    {centerPayload.summary.quizPerformance.length}
                  </span>
                  <span className="rs-kpi-meta">attempted in scope</span>
                </Link>
                <Link
                  href={`/admin/reporting?${buildScopedQuery({ metricKey: 'weekly_active_learners' })}`}
                  className="rs-kpi"
                >
                  <span className="rs-kpi-label">Product artifacts</span>
                  <span className="rs-kpi-value">
                    {centerPayload.summary.productsInPeriod.total}
                  </span>
                  <span className="rs-kpi-meta">publications, talks, datasets…</span>
                </Link>
              </div>
            </section>

            <section className="rs-section">
              <div className="rs-section-head">
                <span className="rs-section-eyebrow">Cohort Analytics</span>
                <h2 className="rs-section-title">Completion &amp; mastery</h2>
                <p className="rs-section-sub">
                  Top performers and engagement signals across the cohort scope.
                </p>
              </div>
              <div className="rs-grid-2">
                <ReportingPanel
                  title="Completion by class"
                  hint="Top classes by completion rate"
                >
                  {centerPayload.summary.classCompletion.length === 0 ? (
                    <div className="rs-empty">No class completion data for this scope yet.</div>
                  ) : (
                    [...centerPayload.summary.classCompletion]
                      .sort((a, b) => b.completionRate - a.completionRate)
                      .slice(0, 6)
                      .map((item) => (
                        <HBar
                          key={item.id}
                          label={item.title}
                          numerator={item.uniqueLearnersCompleted}
                          denominator={item.uniqueLearnersStarted || 1}
                          rate={item.completionRate}
                          accent="#1553cf"
                        />
                      ))
                  )}
                </ReportingPanel>
                <ReportingPanel
                  title="Completion by chapter"
                  hint="Top chapters by completion rate"
                >
                  {centerPayload.summary.chapterCompletion.length === 0 ? (
                    <div className="rs-empty">No chapter completion data for this scope yet.</div>
                  ) : (
                    [...centerPayload.summary.chapterCompletion]
                      .sort((a, b) => b.completionRate - a.completionRate)
                      .slice(0, 6)
                      .map((item) => (
                        <HBar
                          key={item.id}
                          label={item.title}
                          numerator={item.uniqueLearnersCompleted}
                          denominator={item.uniqueLearnersStarted || 1}
                          rate={item.completionRate}
                          accent="#0d9488"
                        />
                      ))
                  )}
                </ReportingPanel>
                <ReportingPanel title="Quiz mastery" hint="Share of attempts at ≥80%">
                  {(() => {
                    const attempted = centerPayload.summary.quizPerformance.reduce(
                      (sum, q) => sum + q.uniqueLearnersAttempted,
                      0,
                    )
                    const mastered = centerPayload.summary.quizPerformance.reduce(
                      (sum, q) => sum + q.uniqueLearnersMastered,
                      0,
                    )
                    const rate = attempted ? mastered / attempted : 0
                    if (attempted === 0) {
                      return <div className="rs-empty">No quiz attempts in this scope yet.</div>
                    }
                    return (
                      <Donut
                        value={rate}
                        accent="#a855f7"
                        label={`${mastered}/${attempted} mastered`}
                        sub={`across ${centerPayload.summary.quizPerformance.length} quizzes`}
                      />
                    )
                  })()}
                </ReportingPanel>
                <ReportingPanel
                  title="Weekly engagement"
                  hint={`Active learners over the past ${Math.min(centerPayload.summary.weeklyEngagement.length, 8)} weeks`}
                >
                  {centerPayload.summary.weeklyEngagement.length === 0 ? (
                    <div className="rs-empty">No engagement data for this scope yet.</div>
                  ) : (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 22,
                              fontWeight: 800,
                              color: 'var(--cpp-ink)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {centerPayload.summary.weeklyEngagement[
                              centerPayload.summary.weeklyEngagement.length - 1
                            ]?.activeStudents ?? 0}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>
                            most recent week
                          </div>
                        </div>
                        {(() => {
                          const last =
                            centerPayload.summary.weeklyEngagement[
                              centerPayload.summary.weeklyEngagement.length - 1
                            ]
                          if (last?.weekOverWeekChange == null) return null
                          const pct = Math.round(last.weekOverWeekChange * 100)
                          if (pct === 0) return null
                          const up = pct > 0
                          return (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: up ? '#127455' : '#b91c1c',
                                background: up
                                  ? 'rgba(18,116,85,0.1)'
                                  : 'rgba(185,28,28,0.1)',
                                padding: '3px 8px',
                                borderRadius: 999,
                              }}
                            >
                              {up ? '↑' : '↓'} {Math.abs(pct)}% WoW
                            </span>
                          )
                        })()}
                      </div>
                      <Sparkline
                        values={centerPayload.summary.weeklyEngagement.map(
                          (w) => w.activeStudents,
                        )}
                        color="#1553cf"
                        width={300}
                        height={64}
                      />
                    </>
                  )}
                </ReportingPanel>
              </div>
            </section>

            <section className="rs-section">
              <div className="rs-section-head">
                <span className="rs-section-eyebrow">RPPR Export Center</span>
                <h2 className="rs-section-title">Generate, snapshot, and export</h2>
                <p className="rs-section-sub">
                  Capture immutable snapshots, export CSV/JSON for upload, and save scoped views
                  for reuse.
                </p>
              </div>
              <div className="rs-card">
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div className="rs-card-title">Period readiness</div>
                    <div className="rs-card-sub">
                      Status:{' '}
                      <strong style={{ color: 'var(--cpp-ink)' }}>
                        {centerPayload.rppr?.completeness.overallStatus ?? 'n/a'}
                      </strong>
                      {' '}·{' '}
                      {centerPayload.rppr?.completeness.readinessScore ?? 0}% ready
                    </div>
                  </div>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&action=create-snapshot&reuseIfUnchanged=true`}
                    className="rs-cta-primary"
                  >
                    Capture snapshot
                  </Link>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&format=json`}
                    className="rs-pill"
                  >
                    Center JSON
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=summary`}
                    className="rs-pill"
                  >
                    Summary CSV
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=participants`}
                    className="rs-pill"
                  >
                    Participants CSV
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=organizations`}
                    className="rs-pill"
                  >
                    Organizations CSV
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=products`}
                    className="rs-pill"
                  >
                    Products CSV
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=evidence`}
                    className="rs-pill"
                  >
                    Evidence CSV
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=data-quality`}
                    className="rs-pill"
                  >
                    Data quality CSV
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&format=csv&type=compliance`}
                    className="rs-pill"
                  >
                    Compliance CSV
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&format=pdf`}
                    className="rs-pill"
                  >
                    PDF (scaffold)
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&action=save-view&label=Reporting%20Center%20View&shared=false`}
                    className="rs-pill"
                  >
                    Save private view
                  </Link>
                  <Link
                    href={`/api/analytics/reporting-center?${scopedQuery}&action=save-view&label=Reporting%20Center%20Shared%20View&shared=true`}
                    className="rs-pill"
                  >
                    Save shared view
                  </Link>
                </div>
              </div>
              {centerPayload.rppr ? (
                <div className="rs-grid-2">
                  <div className="rs-card">
                    <div className="rs-card-title">Evidence linking</div>
                    <div className="rs-card-sub">
                      {centerPayload.rppr.evidence.totalEvidenceLinks} link
                      {centerPayload.rppr.evidence.totalEvidenceLinks === 1 ? '' : 's'} attached in
                      this period
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 8,
                      }}
                    >
                      {centerPayload.rppr.evidence.bySection.length === 0 ? (
                        <div className="rs-empty">No evidence attached yet.</div>
                      ) : (
                        centerPayload.rppr.evidence.bySection.map((entry) => (
                          <div key={entry.section} className="rs-trend">
                            <div className="rs-trend-label">{entry.section}</div>
                            <div className="rs-trend-value">{entry.count}</div>
                          </div>
                        ))
                      )}
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Link
                        href={`/api/analytics/nsf-rppr?${scopedQuery}&format=csv&type=evidence`}
                        className="rs-pill"
                      >
                        Evidence CSV
                      </Link>
                      <Link
                        href="/admin/collections/reporting-evidence-links"
                        className="rs-pill"
                      >
                        Manage links
                      </Link>
                    </div>
                  </div>
                  {centerPayload.complianceChecklist ? (
                    <div className="rs-card">
                      <div className="rs-card-title">RPPR compliance checklist</div>
                      <div className="rs-card-sub">
                        {centerPayload.complianceChecklist.metCount} of{' '}
                        {centerPayload.complianceChecklist.checks.length} checks met ·{' '}
                        {centerPayload.complianceChecklist.overallStatus}
                      </div>
                      <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                        {centerPayload.complianceChecklist.checks.slice(0, 8).map((check) => {
                          const isMissing = check.status === 'missing'
                          return (
                            <div key={check.key} className="rs-checklist-row">
                              <span
                                className="rs-checklist-icon"
                                style={{
                                  background: isMissing
                                    ? 'rgba(185, 28, 28, 0.12)'
                                    : 'rgba(20, 131, 92, 0.14)',
                                  color: isMissing ? '#b91c1c' : '#127455',
                                }}
                              >
                                {isMissing ? '!' : '✓'}
                              </span>
                              <div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: 'var(--cpp-ink)',
                                  }}
                                >
                                  {check.label}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: 'var(--cpp-muted)',
                                    marginTop: 2,
                                    lineHeight: 1.45,
                                  }}
                                >
                                  {check.detail}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="rs-section">
              <div className="rs-section-head">
                <span className="rs-section-eyebrow">Data Quality &amp; Validation</span>
                <h2 className="rs-section-title">Confidence checks &amp; anomalies</h2>
                <p className="rs-section-sub">
                  Surface gaps before exporting — issues here block a clean RPPR submission.
                </p>
              </div>
              <div className="rs-grid-3">
                <div className="rs-card">
                  <div className="rs-card-title">Data quality</div>
                  <div className="rs-card-sub">
                    Confidence:{' '}
                    <strong style={{ color: 'var(--cpp-ink)' }}>
                      {centerPayload.dataQuality.confidence}
                    </strong>
                  </div>
                  <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                    {centerPayload.dataQuality.issues.length === 0 ? (
                      <div className="rs-issue is-positive">
                        <div className="rs-issue-title">No quality blockers detected</div>
                        <div className="rs-issue-detail">
                          All quality checks passed for this scope.
                        </div>
                      </div>
                    ) : (
                      centerPayload.dataQuality.issues.map((issue) => {
                        const cls =
                          issue.severity === 'high'
                            ? 'rs-issue is-high'
                            : issue.severity === 'medium'
                              ? 'rs-issue is-warning'
                              : 'rs-issue'
                        return (
                          <div key={issue.key} className={cls}>
                            <div className="rs-issue-title">{issue.message}</div>
                            {issue.recommendation ? (
                              <div className="rs-issue-detail">{issue.recommendation}</div>
                            ) : null}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                <div className="rs-card">
                  <div className="rs-card-title">Anomaly checks</div>
                  <div className="rs-card-sub">Threshold-based deviations from prior periods</div>
                  <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                    {centerPayload.anomalies.length === 0 ? (
                      <div className="rs-issue is-positive">
                        <div className="rs-issue-title">No threshold anomalies</div>
                        <div className="rs-issue-detail">
                          Engagement, completion, and mastery are within tolerance.
                        </div>
                      </div>
                    ) : (
                      centerPayload.anomalies.map((anomaly) => {
                        const cls =
                          anomaly.severity === 'high'
                            ? 'rs-issue is-high'
                            : anomaly.severity === 'medium'
                              ? 'rs-issue is-warning'
                              : 'rs-issue'
                        return (
                          <div key={anomaly.key} className={cls}>
                            <div className="rs-issue-title">{anomaly.message}</div>
                            <div className="rs-issue-detail">
                              Metric: {anomaly.metricKey} · severity {anomaly.severity}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                <div className="rs-card">
                  <div className="rs-card-title">Cross-checks</div>
                  <div className="rs-card-sub">Cross-collection integrity validations</div>
                  <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                    {centerPayload.crossChecks.length === 0 ? (
                      <div className="rs-empty">No cross-checks configured.</div>
                    ) : (
                      centerPayload.crossChecks.map((check) => {
                        const cls =
                          check.status === 'fail'
                            ? 'rs-issue is-high'
                            : check.status === 'warn'
                              ? 'rs-issue is-warning'
                              : 'rs-issue is-positive'
                        return (
                          <div key={check.key} className={cls}>
                            <div className="rs-issue-title">{check.message}</div>
                            <div className="rs-issue-detail">Status: {check.status}</div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rs-section">
              <div className="rs-section-head">
                <span className="rs-section-eyebrow">Historical Trends</span>
                <h2 className="rs-section-title">KPI movement vs. previous snapshot</h2>
                <p className="rs-section-sub">
                  Each metric is compared against the most recent prior snapshot in the same scope.
                </p>
              </div>
              <div className="rs-card">
                <div className="rs-grid-3">
                  {centerPayload.trendComparisons.map((trend) => {
                    const delta = trend.deltaPercent ?? null
                    const cls =
                      delta == null
                        ? 'rs-trend-delta is-flat'
                        : delta > 0.0001
                          ? 'rs-trend-delta is-up'
                          : delta < -0.0001
                            ? 'rs-trend-delta is-down'
                            : 'rs-trend-delta is-flat'
                    return (
                      <div key={trend.metricKey} className="rs-trend">
                        <div className="rs-trend-label">{trend.label}</div>
                        <div className="rs-trend-value">
                          {formatTrendValue(trend.metricKey, trend.currentValue)}
                        </div>
                        <div className={cls}>
                          {trend.previousValue == null
                            ? 'No prior snapshot'
                            : delta == null
                              ? `Prev ${formatTrendValue(trend.metricKey, trend.previousValue)}`
                              : `${delta > 0 ? '↑' : delta < 0 ? '↓' : '·'} ${Math.abs(
                                  Math.round(delta * 1000) / 10,
                                )}% vs prev`}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="rs-section">
              <div className="rs-section-head">
                <span className="rs-section-eyebrow">Narratives &amp; Drilldowns</span>
                <h2 className="rs-section-title">Working drafts and per-metric drilldowns</h2>
                <p className="rs-section-sub">
                  Drafts are seeded from the metrics above; pick a metric to surface the
                  learner-level CSV.
                </p>
              </div>
              <div className="rs-grid-2">
                <div className="rs-card">
                  <div className="rs-card-title">Narrative drafts</div>
                  <div className="rs-card-sub">Auto-generated starting points — copy and edit</div>
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    {[
                      ['Accomplishments', centerPayload.narrativeDrafts.accomplishmentsDraft],
                      ['Impact', centerPayload.narrativeDrafts.impactDraft],
                      ['Changes / Problems', centerPayload.narrativeDrafts.changesProblemsDraft],
                    ].map(([title, body]) => (
                      <div
                        key={title}
                        style={{
                          border: '1px solid rgba(15, 23, 42, 0.07)',
                          borderRadius: 10,
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                          {title}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: 'var(--cpp-muted)',
                            lineHeight: 1.55,
                          }}
                        >
                          {body}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rs-card">
                  <div className="rs-card-title">Metric drilldown</div>
                  <div className="rs-card-sub">Pick a metric to inspect its definition + CSV</div>
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {centerPayload.metricDefinitions.map((metric) => (
                      <Link
                        key={metric.key}
                        href={`/admin/reporting?${buildScopedQuery({ metricKey: metric.key })}`}
                        className={`rs-pill${selectedMetric === metric.key ? ' is-active' : ''}`}
                      >
                        {metric.name}
                      </Link>
                    ))}
                  </div>
                  {selectedMetric ? (
                    <div
                      style={{
                        marginTop: 12,
                        border: '1px solid rgba(15, 23, 42, 0.07)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {(() => {
                        const def = centerPayload.metricDefinitions.find(
                          (m) => m.key === selectedMetric,
                        )
                        if (!def) return null
                        return (
                          <>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--cpp-ink)',
                              }}
                            >
                              {def.name}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: 'var(--cpp-muted)',
                                marginTop: 4,
                                lineHeight: 1.5,
                              }}
                            >
                              {def.description}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--cpp-muted)', marginTop: 6 }}>
                              <strong style={{ color: 'var(--cpp-ink)' }}>Numerator:</strong>{' '}
                              {def.numerator}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--cpp-muted)' }}>
                              <strong style={{ color: 'var(--cpp-ink)' }}>Denominator:</strong>{' '}
                              {def.denominator}
                            </div>
                            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <Link
                                href={`/api/analytics/reporting-center?${buildScopedQuery({ action: 'drilldown', metricKey: selectedMetric, format: 'csv' })}`}
                                className="rs-pill"
                              >
                                Drilldown CSV
                              </Link>
                              <Link
                                href={`/api/analytics/reporting-center?${buildScopedQuery({ action: 'drilldown', metricKey: selectedMetric })}`}
                                className="rs-pill"
                              >
                                Drilldown JSON
                              </Link>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rs-section">
              <div className="rs-section-head">
                <span className="rs-section-eyebrow">Audit Trail</span>
                <h2 className="rs-section-title">Recent reporting events</h2>
                <p className="rs-section-sub">
                  Each export, snapshot, and saved view is logged with timestamp + actor for
                  provenance.
                </p>
              </div>
              <div className="rs-card">
                <div style={{ display: 'grid', gap: 6 }}>
                  {centerPayload.recentAuditEvents.length === 0 ? (
                    <div className="rs-empty">No audit events yet for this workspace.</div>
                  ) : (
                    centerPayload.recentAuditEvents.slice(0, 10).map((event) => {
                      const created = String(
                        (event as { createdAt?: string }).createdAt ?? '',
                      ).slice(0, 19)
                      return (
                        <div
                          key={String(event.id)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                            padding: '8px 12px',
                            borderRadius: 10,
                            background: 'rgba(15, 23, 42, 0.02)',
                            fontSize: 12.5,
                          }}
                        >
                          <span style={{ fontWeight: 700, color: 'var(--cpp-ink)' }}>
                            {String(event.eventType ?? 'event')}
                          </span>
                          <span
                            style={{
                              color: 'var(--cpp-muted)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {created}
                            {(event as { exportType?: string }).exportType
                              ? ` · ${String((event as { exportType?: string }).exportType)}`
                              : ''}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </Gutter>
  )
}
