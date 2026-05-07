'use client'

import React, { useEffect, useMemo, useState } from 'react'
import type { StudentPerformancePayload } from '../utils/studentPerformance'
import { InsightsPanel } from './student-performance/InsightsPanel'
import { MetricCard } from './student-performance/MetricCard'
import { StudentPerformanceTable } from './student-performance/StudentPerformanceTable'
import { TrendChart } from './student-performance/TrendChart'
import {
  formatNumber,
  formatPercent,
  getInsightItems,
  getStudentStatus,
  sectionStyle,
  shellStyle,
} from './student-performance/shared'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: StudentPerformancePayload }

const heroStyle: React.CSSProperties = {
  borderRadius: 18,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-hero-bg)',
  padding: '18px 20px',
  boxShadow: '0 8px 24px rgba(19, 80, 191, 0.12)',
}

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
      padding: '34px 24px',
    }}
  >
    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cpp-ink)' }}>{title}</div>
    <div style={{ fontSize: 13, color: 'var(--cpp-muted)', maxWidth: 520, margin: '8px auto 0', lineHeight: 1.55 }}>
      {description}
    </div>
  </div>
)

export default function StudentPerformanceView() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch('/api/staff/student-performance', {
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
  }, [])

  const derived = useMemo(() => {
    if (state.status !== 'ready') return null

    const activeStudents = state.data.students.filter(
      (student) => getStudentStatus(student) === 'active',
    ).length
    const atRiskStudents = state.data.students.filter(
      (student) => getStudentStatus(student) === 'at-risk',
    ).length
    const insights = getInsightItems(state.data)

    return {
      activeStudents,
      atRiskStudents,
      insights,
    }
  }, [state])

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: '#c6982f',
            fontWeight: 800,
          }}
        >
          Student Analytics
        </div>
        <div
          style={{
            display: 'grid',
            gap: 18,
            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 0.9fr)',
            alignItems: 'end',
            marginTop: 8,
          }}
        >
          <div>
            <h1 style={{ margin: '0 0 10px', fontSize: 30, lineHeight: 1.15, color: '#1553cf' }}>
              Student Performance
            </h1>
            <p style={{ margin: 0, maxWidth: 760, color: 'var(--cpp-muted)', lineHeight: 1.6 }}>
              Track who is progressing, who is stalled, and where staff attention is needed across
              lessons, quizzes, and problem sets.
            </p>
          </div>
          {state.status === 'ready' ? (
            <div
              style={{
                borderRadius: 14,
                border: '1px solid var(--admin-surface-border)',
                background: 'rgba(255,255,255,0.76)',
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--cpp-muted)', fontWeight: 800 }}>
                Snapshot
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--cpp-ink)', marginTop: 10 }}>
                {derived?.activeStudents ?? 0} active
              </div>
              <div style={{ fontSize: 13, color: 'var(--cpp-muted)', marginTop: 8, lineHeight: 1.55 }}>
                {derived?.atRiskStudents ?? 0} at risk, {state.data.summary.studentCount} students tracked,
                and {state.data.summary.publishedLessonCount} published lessons contributing to progress.
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
        {state.status === 'loading' ? (
          <EmptyPanel
            title="Loading student performance"
            description="Pulling current score, completion, and activity data for staff review."
          />
        ) : null}

        {state.status === 'error' ? (
          <EmptyPanel title="Unable to load student performance" description={state.message} />
        ) : null}

        {state.status === 'ready' ? (
          <>
            <section style={sectionStyle}>
              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'minmax(220px, 1.2fr) repeat(4, minmax(170px, 1fr))',
                }}
              >
                <MetricCard
                  eyebrow="Students"
                  value={`${state.data.summary.studentCount}`}
                  title={`${derived?.activeStudents ?? 0} active in the last 30 days`}
                  detail={
                    state.data.summary.studentCount
                      ? `${derived?.atRiskStudents ?? 0} students currently need closer attention.`
                      : 'Student metrics will appear after enrollments and activity begin.'
                  }
                  emphasize
                />
                <MetricCard
                  eyebrow="Average Score"
                  value={formatPercent(state.data.summary.averageScore, 'No score data')}
                  title={formatPercent(state.data.summary.medianScore, 'No median yet')}
                  detail="Cohort-wide average and median across quiz and problem performance."
                  accent="#0a89c2"
                />
                <MetricCard
                  eyebrow="Completion"
                  value={formatPercent(
                    state.data.summary.averageLessonCompletionRate,
                    'No progress data',
                  )}
                  title={`${state.data.summary.publishedLessonCount} published lessons`}
                  detail="Average lesson completion rate across the currently published curriculum."
                  accent="#1553cf"
                />
                <MetricCard
                  eyebrow="Score Spread"
                  value={formatNumber(state.data.summary.scoreStdDev, 'No spread yet')}
                  title="Student score variability"
                  detail="Use this to spot whether performance is clustered or widely inconsistent."
                  accent="#b45309"
                />
                <MetricCard
                  eyebrow="Attempts"
                  value={formatNumber(state.data.summary.averageAttemptsPerStudent, 'No attempts yet')}
                  title={formatPercent(state.data.summary.averageQuizScore, 'Quiz avg unavailable')}
                  detail={`Problem avg ${formatPercent(
                    state.data.summary.averageProblemScore,
                    'unavailable',
                  )}.`}
                  accent="#047857"
                />
              </div>
            </section>

            <div
              style={{
                display: 'grid',
                gap: 16,
                gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.95fr)',
                alignItems: 'start',
              }}
            >
              <TrendChart data={state.data.weeklyTrend} summary={state.data.summary} />
              <InsightsPanel items={derived?.insights ?? []} />
            </div>

            <StudentPerformanceTable
              students={state.data.students}
              publishedLessonCount={state.data.summary.publishedLessonCount}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
