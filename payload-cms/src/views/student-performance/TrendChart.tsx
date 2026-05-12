'use client'

import React, { useMemo } from 'react'
import type { StudentPerformancePayload } from '../../utils/studentPerformance'
import { formatPercent } from './shared'

const chartHeight = 200
const chartWidth = 720
const chartPadding = { top: 18, right: 18, bottom: 28, left: 28 }

const averagePointScore = (point: StudentPerformancePayload['weeklyTrend'][number]) =>
  point.averageQuizScore ?? null

export const TrendChart = ({
  data,
  summary,
}: {
  data: StudentPerformancePayload['weeklyTrend']
  summary: StudentPerformancePayload['summary']
}) => {
  const points = useMemo(() => {
    if (!data.length) return []

    const maxActiveStudents = Math.max(1, ...data.map((point) => point.activeStudents))
    const innerWidth = chartWidth - chartPadding.left - chartPadding.right
    const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom

    return data.map((point, index) => {
      const x =
        chartPadding.left +
        (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth)
      const activeY =
        chartPadding.top + innerHeight - (point.activeStudents / maxActiveStudents) * innerHeight
      const averageScore = averagePointScore(point)
      const averageY =
        averageScore == null
          ? null
          : chartPadding.top + innerHeight - Math.max(0, Math.min(100, averageScore)) / 100 * innerHeight

      return { ...point, x, activeY, averageY, averageScore }
    })
  }, [data])

  const averageScorePath = useMemo(() => {
    const visiblePoints = points.filter((point) => point.averageY != null)
    if (!visiblePoints.length) return ''
    return visiblePoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.averageY}`)
      .join(' ')
  }, [points])

  const activeBars = useMemo(() => {
    const innerWidth = chartWidth - chartPadding.left - chartPadding.right
    const barWidth = Math.max(16, Math.min(54, innerWidth / Math.max(points.length * 1.8, 8)))
    const bottom = chartHeight - chartPadding.bottom

    return points.map((point) => ({
      ...point,
      width: barWidth,
      xBar: point.x - barWidth / 2,
      height: bottom - point.activeY,
    }))
  }, [points])

  const empty = !data.length

  return (
    <section
    style={{
      borderRadius: 16,
      border: '1px solid var(--admin-surface-border)',
      background: 'var(--admin-panel-bg)',
      padding: 16,
      boxShadow: '0 1px 0 rgba(18, 65, 147, 0.08)',
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.9, color: '#1553cf', fontWeight: 800 }}>
            Performance Trend
          </div>
          <div style={{ fontSize: 13, color: 'var(--cpp-muted)', marginTop: 4 }}>
            Weekly participation and score trend across the last eight weeks.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--cpp-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(21, 83, 207, 0.18)', display: 'inline-block' }} />
            Active students
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--cpp-muted)' }}>
            <span style={{ width: 16, height: 3, borderRadius: 999, background: '#0a89c2', display: 'inline-block' }} />
            Average score
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          borderRadius: 14,
          border: '1px solid rgba(21, 83, 207, 0.10)',
          background: 'var(--admin-panel-bg-muted)',
          padding: 12,
        }}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          width="100%"
          height="240"
          role="img"
          aria-label="Student performance trend chart"
        >
          {[0, 25, 50, 75, 100].map((tick) => {
            const y =
              chartPadding.top +
              (chartHeight - chartPadding.top - chartPadding.bottom) -
              (tick / 100) * (chartHeight - chartPadding.top - chartPadding.bottom)
            return (
              <g key={tick}>
                <line
                  x1={chartPadding.left}
                  x2={chartWidth - chartPadding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(21,83,207,0.08)"
                  strokeDasharray="4 6"
                />
                <text x={2} y={y + 4} fill="var(--cpp-muted)" fontSize="11">
                  {tick}%
                </text>
              </g>
            )
          })}

          {!empty
            ? activeBars.map((point) => (
                <rect
                  key={point.weekStart}
                  x={point.xBar}
                  y={point.activeY}
                  width={point.width}
                  height={point.height}
                  rx={point.width > 18 ? 8 : 4}
                  fill="rgba(21, 83, 207, 0.18)"
                />
              ))
            : null}

          {averageScorePath ? (
            <path
              d={averageScorePath}
              fill="none"
              stroke="#0a89c2"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points
            .filter((point) => point.averageY != null)
            .map((point) => (
              <circle key={`${point.weekStart}-score`} cx={point.x} cy={point.averageY ?? 0} r={4} fill="#0a89c2" />
            ))}

          {!empty
            ? points.map((point) => (
                <text
                  key={`${point.weekStart}-label`}
                  x={point.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fill="var(--cpp-muted)"
                  fontSize="11"
                >
                  {point.weekStart.slice(5)}
                </text>
              ))
            : null}

          {empty ? (
            <>
              <rect
                x={chartPadding.left}
                y={chartPadding.top}
                width={chartWidth - chartPadding.left - chartPadding.right}
                height={chartHeight - chartPadding.top - chartPadding.bottom}
                rx="12"
                fill="rgba(21, 83, 207, 0.03)"
                stroke="rgba(21, 83, 207, 0.08)"
                strokeDasharray="6 8"
              />
              <text
                x={chartWidth / 2}
                y={chartHeight / 2 - 6}
                textAnchor="middle"
                fill="var(--cpp-ink)"
                fontSize="16"
                fontWeight="700"
              >
                No trend data yet
              </text>
              <text
                x={chartWidth / 2}
                y={chartHeight / 2 + 18}
                textAnchor="middle"
                fill="var(--cpp-muted)"
                fontSize="12"
              >
                Weekly score and activity trends will appear after students begin submitting work.
              </text>
            </>
          ) : null}
        </svg>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          marginTop: 14,
        }}
      >
        <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.72)', border: '1px solid var(--admin-surface-border)', padding: '12px 14px' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--cpp-muted)', fontWeight: 800 }}>
            Latest Avg Score
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--cpp-ink)', marginTop: 8 }}>
            {points.length ? formatPercent(points[points.length - 1]?.averageScore, 'No score data') : 'No score data'}
          </div>
        </div>
        <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.72)', border: '1px solid var(--admin-surface-border)', padding: '12px 14px' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--cpp-muted)', fontWeight: 800 }}>
            Active Students
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--cpp-ink)', marginTop: 8 }}>
            {summary.activeStudents30d} / {summary.studentCount}
          </div>
        </div>
      </div>
    </section>
  )
}
