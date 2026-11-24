'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  StudentPerformancePayload,
  StudentPerformanceRange,
} from '../utils/studentPerformance'
import { HelpLink } from './admin/HelpLink'
import { ClassroomCombobox } from './student-performance/ClassroomCombobox'
import { InsightsPanel } from './student-performance/InsightsPanel'
import { MetricCard } from './student-performance/MetricCard'
import { StudentPerformanceTable } from './student-performance/StudentPerformanceTable'
import { TrendChart } from './student-performance/TrendChart'
import {
  type InsightAction,
  formatNumber,
  formatPercent,
  formatUpdatedAt,
  getInsightItems,
  getStudentStatus,
  rangeOptions,
  sectionStyle,
  shellStyle,
} from './student-performance/shared'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: StudentPerformancePayload }

const heroStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-hero-bg)',
  padding: '14px 16px',
  boxShadow: '0 4px 14px rgba(19, 80, 191, 0.08)',
}

const segmentControlWrap: React.CSSProperties = {
  display: 'inline-flex',
  borderRadius: 8,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-panel-bg-muted)',
  padding: 2,
}

const segmentBtn = (active: boolean): React.CSSProperties => ({
  borderRadius: 6,
  border: 'none',
  padding: '5px 10px',
  fontSize: 11.5,
  fontWeight: 800,
  cursor: 'pointer',
  background: active ? 'var(--admin-panel-bg)' : 'transparent',
  color: active ? '#1553cf' : 'var(--cpp-muted)',
  boxShadow: active ? '0 1px 2px rgba(21,83,207,0.10)' : 'none',
  transition: 'all 120ms ease',
})

const EmptyPanel = ({
  title,
  description,
}: {
  title: string
  description: string
}) => (
  <div
    style={{
      ...sectionStyle,
      textAlign: 'center',
      padding: '28px 20px',
    }}
  >
    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--cpp-ink)' }}>{title}</div>
    <div style={{ fontSize: 12.5, color: 'var(--cpp-muted)', maxWidth: 480, margin: '6px auto 0', lineHeight: 1.55 }}>
      {description}
    </div>
  </div>
)

const SnapshotPill = ({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'warning' | 'positive'
}) => {
  const palette =
    tone === 'warning'
      ? { color: '#b45309', background: 'rgba(245,158,11,0.10)', border: 'rgba(217,119,6,0.22)' }
      : tone === 'positive'
        ? { color: '#127455', background: 'rgba(16,185,129,0.10)', border: 'rgba(5,150,105,0.22)' }
        : { color: '#1553cf', background: 'rgba(21,83,207,0.08)', border: 'rgba(21,83,207,0.20)' }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        background: palette.background,
        border: `1px solid ${palette.border}`,
        color: palette.color,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      <span style={{ fontWeight: 900 }}>{value}</span>
      <span style={{ opacity: 0.85, fontWeight: 700 }}>{label}</span>
    </div>
  )
}

export default function StudentPerformanceView() {
  const [range, setRange] = useState<StudentPerformanceRange>('30d')
  const [classroomId, setClassroomId] = useState<string>('all')
  const [tableFilter, setTableFilter] = useState<InsightAction['filter']>('all')
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [updatedNow, setUpdatedNow] = useState(() => Date.now())
  const tableRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setState((prev) => (prev.status === 'ready' ? prev : { status: 'loading' }))
      try {
        const params = new URLSearchParams({ range })
        if (classroomId && classroomId !== 'all') params.set('classroomId', classroomId)
        const response = await fetch(`/api/staff/student-performance?${params.toString()}`, {
          credentials: 'include',
        })

        if (response.status === 401 && typeof window !== 'undefined') {
          window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
          return
        }
        if (!response.ok) {
          const message =
            response.status === 403
              ? 'You do not have access to this page.'
              : 'Unable to load student performance.'
          throw new Error(message)
        }

        const data = (await response.json()) as StudentPerformancePayload
        if (!cancelled) {
          setState({ status: 'ready', data })
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to load student performance.',
          })
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [range, classroomId])

  useEffect(() => {
    const interval = window.setInterval(() => setUpdatedNow(Date.now()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const updatedLabel = useMemo(() => {
    if (state.status !== 'ready') return 'Loading…'
    return formatUpdatedAt(state.data.generatedAt, updatedNow)
  }, [state, updatedNow])

  const derived = useMemo(() => {
    if (state.status !== 'ready') return null

    const activeStudents = state.data.students.filter(
      (student) => getStudentStatus(student) === 'active',
    ).length
    const atRiskStudents = state.data.students.filter(
      (student) => getStudentStatus(student) === 'at-risk',
    ).length
    const inactiveStudents = state.data.students.filter(
      (student) => getStudentStatus(student) === 'inactive',
    ).length
    const insights = getInsightItems(state.data)

    return {
      activeStudents,
      atRiskStudents,
      inactiveStudents,
      insights,
    }
  }, [state])

  const handleAction = useCallback((action: InsightAction) => {
    setTableFilter(action.filter)
    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const data = state.status === 'ready' ? state.data : null

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 10.5,
                letterSpacing: 0.9,
                textTransform: 'uppercase',
                color: '#c6982f',
                fontWeight: 800,
              }}
            >
              Student Analytics
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: state.status === 'ready' ? '#10b981' : 'rgba(100,116,139,0.5)',
                  boxShadow:
                    state.status === 'ready'
                      ? '0 0 0 4px rgba(16,185,129,0.15)'
                      : '0 0 0 4px rgba(100,116,139,0.10)',
                }}
              />
              <span style={{ fontSize: 10.5, color: 'var(--cpp-muted)', fontWeight: 700, letterSpacing: 0.4 }}>
                {updatedLabel}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 4,
                flexWrap: 'wrap',
              }}
            >
              <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.1, color: '#1553cf', letterSpacing: '-0.01em' }}>
                Student Performance
              </h1>
              <HelpLink topic="analytics" />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--cpp-muted)', lineHeight: 1.55 }}>
              Track progress, surface stalls, and route staff attention across lessons, quizzes, and problem sets.
            </p>
          </div>

          {data ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <SnapshotPill label="active" value={`${derived?.activeStudents ?? 0}`} tone="positive" />
              <SnapshotPill label="at risk" value={`${derived?.atRiskStudents ?? 0}`} tone="warning" />
              <SnapshotPill label="inactive" value={`${derived?.inactiveStudents ?? 0}`} tone="neutral" />
              <SnapshotPill label="tracked" value={`${data.summary.studentCount}`} />
              <SnapshotPill label="published lessons" value={`${data.summary.publishedLessonCount}`} />
            </div>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <div role="tablist" aria-label="Timeframe" style={segmentControlWrap}>
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                role="tab"
                aria-selected={range === option.value}
                title={option.description}
                onClick={() => setRange(option.value)}
                style={segmentBtn(range === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11.5,
              color: 'var(--cpp-muted)',
              fontWeight: 700,
            }}
          >
            <span>Cohort</span>
            <ClassroomCombobox
              value={classroomId}
              options={data?.classrooms ?? []}
              onChange={setClassroomId}
              disabled={!data || data.classrooms.length === 0}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {state.status === 'loading' ? (
          <EmptyPanel
            title="Loading student performance"
            description="Pulling current score, completion, and activity data for staff review."
          />
        ) : null}

        {state.status === 'error' ? (
          <EmptyPanel title="Unable to load student performance" description={state.message} />
        ) : null}

        {state.status === 'ready' && data ? (
          <>
            <section style={sectionStyle}>
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  gridTemplateColumns: 'minmax(220px, 1.25fr) repeat(4, minmax(160px, 1fr))',
                }}
              >
                <MetricCard
                  eyebrow="Students"
                  value={`${data.summary.studentCount}`}
                  detail={
                    data.summary.studentCount
                      ? `${derived?.activeStudents ?? 0} active · ${derived?.atRiskStudents ?? 0} at risk`
                      : 'Enrollments and activity will populate this metric.'
                  }
                  footnote={
                    data.summary.studentCount
                      ? `${derived?.inactiveStudents ?? 0} need closer attention`
                      : 'No students tracked yet'
                  }
                  emphasize
                  delta={data.deltas.activeStudentsChange}
                  deltaSuffix="active"
                  sparkline={data.trend.map((b) => b.activeStudents)}
                />
                <MetricCard
                  eyebrow="Avg Score"
                  value={formatPercent(data.summary.averageScore, '—')}
                  detail={`Median ${formatPercent(data.summary.medianScore, '—')}`}
                  accent="#0a89c2"
                  delta={data.deltas.averageScoreChange}
                  deltaKind="percent"
                  sparkline={data.trend.map((b) => b.averageQuizScore)}
                />
                <MetricCard
                  eyebrow="Completion"
                  value={formatPercent(data.summary.averageLessonCompletionRate, '—')}
                  detail={
                    data.summary.publishedLessonCount
                      ? `Across ${data.summary.publishedLessonCount} published lessons`
                      : 'Publish lessons to track completion.'
                  }
                  accent="#1553cf"
                  progress={data.summary.averageLessonCompletionRate}
                />
                <MetricCard
                  eyebrow="Score Spread"
                  value={formatNumber(data.summary.scoreStdDev, '—')}
                  detail="Lower means scores cluster tightly."
                  accent="#b45309"
                  deltaPositiveIsGood={false}
                  footnote={
                    data.summary.scoreStdDev == null
                      ? 'Spread appears once scores accumulate.'
                      : data.summary.scoreStdDev > 18
                        ? 'Wide variance — check pacing.'
                        : 'Performance is consistent.'
                  }
                />
                <MetricCard
                  eyebrow="Quiz Attempts"
                  value={formatNumber(data.summary.averageAttemptsPerStudent, '0.0')}
                  detail={`Avg quiz score ${formatPercent(data.summary.averageQuizScore, '—')}`}
                  accent="#047857"
                  footnote="Attempts per student"
                />
              </div>
            </section>

            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'minmax(0, 1.55fr) minmax(300px, 0.9fr)',
                alignItems: 'start',
              }}
            >
              <TrendChart data={data.trend} summary={data.summary} range={data.range} />
              <InsightsPanel items={derived?.insights ?? []} onAction={handleAction} />
            </div>

            <StudentPerformanceTable
              ref={tableRef}
              students={data.students}
              publishedLessonCount={data.summary.publishedLessonCount}
              filter={tableFilter}
              onClearFilter={() => setTableFilter('all')}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
