'use client'

import React from 'react'
import type {
  StudentPerformancePayload,
  StudentPerformanceStudent,
} from '../../utils/studentPerformance'
import { ProgressBar } from './ProgressBar'
import { StatusBadge } from './StatusBadge'
import {
  formatDate,
  formatPercent,
  formatRelativeTime,
  getStudentStatus,
  participantLabel,
} from './shared'

const rowBorder = '1px solid rgba(18, 65, 147, 0.08)'

const emptyFieldStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--cpp-muted)',
}

const metricText = (value: number | null, label: string) =>
  value == null ? `${label} unavailable` : `${label} ${value.toFixed(1)}%`

const StudentTableRow = ({
  student,
  publishedLessonCount,
}: {
  student: StudentPerformanceStudent
  publishedLessonCount: number
}) => {
  const status = getStudentStatus(student)
  const totalAttempts = student.quizAttempts + student.problemAttempts

  return (
    <tr style={{ borderTop: rowBorder }}>
      <td style={{ padding: '14px 12px', verticalAlign: 'top' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--cpp-ink)' }}>{student.name}</div>
            <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
              {student.email ?? 'No email available'}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
            {participantLabel(student.participantType)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.45 }}>
            {student.classroomTitles.length
              ? student.classroomTitles.slice(0, 3).join(', ')
              : 'No classrooms assigned'}
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 12px', verticalAlign: 'top' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <StatusBadge status={status} />
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{formatRelativeTime(student.lastActivityAt)}</div>
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{formatDate(student.lastActivityAt)}</div>
        </div>
      </td>
      <td style={{ padding: '14px 12px', verticalAlign: 'top' }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--cpp-ink)' }}>
            {formatPercent(student.overallAverage, 'No scores yet')}
          </div>
          <div style={emptyFieldStyle}>{metricText(student.quizAverage, 'Quiz avg')}</div>
          <div style={emptyFieldStyle}>{metricText(student.problemAverage, 'Problem avg')}</div>
          <div style={emptyFieldStyle}>
            {student.overallStdDev == null
              ? 'Consistency unavailable'
              : `Std. dev. ${student.overallStdDev.toFixed(1)}`}
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 12px', verticalAlign: 'top', minWidth: 240 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <ProgressBar value={student.lessonCompletionRate} label="Completion rate" />
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
            {student.lessonsCompleted} of {publishedLessonCount} published lessons completed
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 12px', verticalAlign: 'top' }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cpp-ink)' }}>
            {totalAttempts > 0 ? `${totalAttempts} total attempts` : 'No attempts yet'}
          </div>
          <div style={emptyFieldStyle}>
            {student.quizAttempts} quizzes, {student.problemAttempts} problem sets
          </div>
          <div style={emptyFieldStyle}>
            Streak {student.currentStreak} current, {student.longestStreak} best
          </div>
        </div>
      </td>
    </tr>
  )
}

export const StudentPerformanceTable = ({
  students,
  publishedLessonCount,
}: {
  students: StudentPerformancePayload['students']
  publishedLessonCount: number
}) => (
  <section
    style={{
      borderRadius: 16,
      border: '1px solid var(--admin-surface-border)',
      background: 'var(--admin-panel-bg)',
      padding: 16,
      boxShadow: '0 1px 0 rgba(18, 65, 147, 0.08)',
    }}
  >
    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.9, color: '#1553cf', fontWeight: 800 }}>
      Student Table
    </div>
    <div style={{ fontSize: 13, color: 'var(--cpp-muted)', marginTop: 4, marginBottom: 14 }}>
      Review current status, completion progress, recent activity, and score quality for every tracked student.
    </div>

    {!students.length ? (
      <div
        style={{
          borderRadius: 14,
          border: '1px dashed rgba(21, 83, 207, 0.2)',
          background: 'var(--admin-panel-bg-muted)',
          padding: '28px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--cpp-ink)' }}>No students to display</div>
        <div style={{ fontSize: 13, color: 'var(--cpp-muted)', marginTop: 8 }}>
          Student rows will appear here once learners enroll and generate progress data.
        </div>
      </div>
    ) : (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1120 }}>
          <thead>
            <tr style={{ borderBottom: rowBorder }}>
              <th style={{ textAlign: 'left', padding: '0 12px 12px', fontSize: 12, color: 'var(--cpp-muted)' }}>Student</th>
              <th style={{ textAlign: 'left', padding: '0 12px 12px', fontSize: 12, color: 'var(--cpp-muted)' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0 12px 12px', fontSize: 12, color: 'var(--cpp-muted)' }}>Average score</th>
              <th style={{ textAlign: 'left', padding: '0 12px 12px', fontSize: 12, color: 'var(--cpp-muted)' }}>Completion</th>
              <th style={{ textAlign: 'left', padding: '0 12px 12px', fontSize: 12, color: 'var(--cpp-muted)' }}>Attempts</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <StudentTableRow
                key={student.accountId}
                student={student}
                publishedLessonCount={publishedLessonCount}
              />
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)
