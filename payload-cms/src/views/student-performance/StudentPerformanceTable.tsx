'use client'

import { useRouter } from 'next/navigation'
import React, { forwardRef, useMemo } from 'react'
import type {
  StudentPerformancePayload,
  StudentPerformanceStudent,
} from '../../utils/studentPerformance'
import { ProgressBar } from './ProgressBar'
import { StatusBadge } from './StatusBadge'
import {
  type InsightAction,
  filterLabel,
  formatDate,
  formatPercent,
  formatRelativeTime,
  getStudentStatus,
  participantLabel,
  studentMatchesFilter,
} from './shared'

const rowBorder = '1px solid rgba(18, 65, 147, 0.07)'

const emptyFieldStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--cpp-muted)',
}

const metricText = (value: number | null, label: string) =>
  value == null ? `${label} unavailable` : `${label} ${value.toFixed(1)}%`

const StudentTableRow = ({
  student,
  publishedLessonCount,
  onSelect,
}: {
  student: StudentPerformanceStudent
  publishedLessonCount: number
  onSelect: (accountId: string) => void
}) => {
  const status = getStudentStatus(student)
  const totalAttempts = student.quizAttempts
  const handleSelect = () => onSelect(student.accountId)

  return (
    <tr
      style={{ borderTop: rowBorder, cursor: 'pointer', transition: 'background 100ms ease' }}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleSelect()
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`View ${student.name} analytics`}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = 'rgba(21, 83, 207, 0.04)'
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = 'transparent'
      }}
    >
      <td style={{ padding: '12px 12px', verticalAlign: 'top' }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--cpp-ink)', fontSize: 13 }}>{student.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--cpp-muted)', marginTop: 2 }}>
              {student.email ?? 'No email available'}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--cpp-muted)' }}>
            {participantLabel(student.participantType)}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--cpp-muted)', lineHeight: 1.45 }}>
            {student.classroomTitles.length
              ? student.classroomTitles.slice(0, 3).join(', ')
              : 'No classrooms assigned'}
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 12px', verticalAlign: 'top' }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <StatusBadge status={status} />
          <div style={{ fontSize: 11.5, color: 'var(--cpp-muted)' }}>{formatRelativeTime(student.lastActivityAt)}</div>
          <div style={{ fontSize: 11.5, color: 'var(--cpp-muted)' }}>{formatDate(student.lastActivityAt)}</div>
        </div>
      </td>
      <td style={{ padding: '12px 12px', verticalAlign: 'top' }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--cpp-ink)', letterSpacing: '-0.01em' }}>
            {formatPercent(student.overallAverage, 'No scores yet')}
          </div>
          <div style={emptyFieldStyle}>{metricText(student.quizAverage, 'Quiz avg')}</div>
          <div style={emptyFieldStyle}>
            {student.overallStdDev == null
              ? 'Consistency unavailable'
              : `Std. dev. ${student.overallStdDev.toFixed(1)}`}
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 12px', verticalAlign: 'top', minWidth: 220 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <ProgressBar value={student.lessonCompletionRate} label="Completion" />
          <div style={{ fontSize: 11.5, color: 'var(--cpp-muted)' }}>
            {student.lessonsCompleted} of {publishedLessonCount} published lessons
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 12px', verticalAlign: 'top' }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--cpp-ink)' }}>
            {totalAttempts > 0 ? `${totalAttempts} attempts` : 'No attempts'}
          </div>
          <div style={emptyFieldStyle}>
            Streak {student.currentStreak} current · {student.longestStreak} best
          </div>
        </div>
      </td>
    </tr>
  )
}

export type StudentTableProps = {
  students: StudentPerformancePayload['students']
  publishedLessonCount: number
  filter?: InsightAction['filter']
  onClearFilter?: () => void
}

export const StudentPerformanceTable = forwardRef<HTMLDivElement, StudentTableProps>(
  ({ students, publishedLessonCount, filter = 'all', onClearFilter }, ref) => {
    const router = useRouter()
    const filtered = useMemo(
      () => students.filter((student) => studentMatchesFilter(student, filter)),
      [students, filter],
    )
    const handleSelect = (accountId: string) => {
      router.push(`/admin/student-performance/${accountId}`)
    }

    return (
      <section
        ref={ref}
        style={{
          borderRadius: 14,
          border: '1px solid var(--admin-surface-border)',
          background: 'var(--admin-panel-bg)',
          padding: 14,
          boxShadow: '0 1px 0 rgba(18, 65, 147, 0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: '#1553cf', fontWeight: 800 }}>
              Student Table
            </div>
            <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 2 }}>
              Status, completion, recent activity, and score quality per tracked student.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--cpp-muted)', fontWeight: 700 }}>
              {filtered.length} of {students.length} students
            </span>
            {filter !== 'all' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: '#1553cf',
                  background: 'rgba(21, 83, 207, 0.10)',
                  border: '1px solid rgba(21, 83, 207, 0.22)',
                  padding: '4px 8px 4px 10px',
                  borderRadius: 999,
                }}
              >
                {filterLabel(filter)}
                <button
                  type="button"
                  onClick={onClearFilter}
                  aria-label="Clear filter"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#1553cf',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 900,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ) : null}
          </div>
        </div>

        {!students.length ? (
          <div
            style={{
              marginTop: 14,
              borderRadius: 12,
              border: '1px dashed rgba(21, 83, 207, 0.18)',
              background: 'var(--admin-panel-bg-muted)',
              padding: '22px 16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--cpp-ink)' }}>No students yet</div>
            <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 6 }}>
              Rows appear here once learners enroll and start generating progress data.
            </div>
          </div>
        ) : !filtered.length ? (
          <div
            style={{
              marginTop: 14,
              borderRadius: 12,
              border: '1px dashed rgba(21, 83, 207, 0.18)',
              background: 'var(--admin-panel-bg-muted)',
              padding: '22px 16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--cpp-ink)' }}>
              No students match this filter
            </div>
            <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 6 }}>
              Clear the filter or pick a different insight to see students again.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1040 }}>
              <thead>
                <tr style={{ borderBottom: rowBorder }}>
                  <th style={{ textAlign: 'left', padding: '0 12px 10px', fontSize: 11, color: 'var(--cpp-muted)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Student</th>
                  <th style={{ textAlign: 'left', padding: '0 12px 10px', fontSize: 11, color: 'var(--cpp-muted)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0 12px 10px', fontSize: 11, color: 'var(--cpp-muted)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Score</th>
                  <th style={{ textAlign: 'left', padding: '0 12px 10px', fontSize: 11, color: 'var(--cpp-muted)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Completion</th>
                  <th style={{ textAlign: 'left', padding: '0 12px 10px', fontSize: 11, color: 'var(--cpp-muted)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <StudentTableRow
                    key={student.accountId}
                    student={student}
                    publishedLessonCount={publishedLessonCount}
                    onSelect={handleSelect}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    )
  },
)

StudentPerformanceTable.displayName = 'StudentPerformanceTable'
