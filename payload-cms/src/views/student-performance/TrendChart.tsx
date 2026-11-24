'use client'

import React, { useMemo, useState } from 'react'
import type {
  StudentPerformancePayload,
  StudentPerformanceRange,
} from '../../utils/studentPerformance'
import { formatPercent } from './shared'

const chartHeight = 200
const chartWidth = 720
const chartPadding = { top: 16, right: 16, bottom: 26, left: 32 }

type Metric = 'both' | 'score' | 'active'

type TrendBucket = StudentPerformancePayload['trend'][number]

export const TrendChart = ({
  data,
  summary,
  range,
}: {
  data: StudentPerformancePayload['trend']
  summary: StudentPerformancePayload['summary']
  range: StudentPerformanceRange
}) => {
  const [metric, setMetric] = useState<Metric>('both')
  const [hovered, setHovered] = useState<TrendBucket | null>(null)

  const points = useMemo(() => {
    if (!data.length) return []
    const maxActive = Math.max(1, ...data.map((p) => p.activeStudents))
    const innerWidth = chartWidth - chartPadding.left - chartPadding.right
    const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom

    return data.map((point, index) => {
      const x =
        chartPadding.left +
        (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth)
      const activeY =
        chartPadding.top + innerHeight - (point.activeStudents / maxActive) * innerHeight
      const averageY =
        point.averageQuizScore == null
          ? null
          : chartPadding.top + innerHeight - (Math.max(0, Math.min(100, point.averageQuizScore)) / 100) * innerHeight

      return { ...point, x, activeY, averageY }
    })
  }, [data])

  const averagePath = useMemo(() => {
    const visible = points.filter((p) => p.averageY != null)
    if (!visible.length) return ''
    return visible
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${(p.averageY ?? 0).toFixed(2)}`)
      .join(' ')
  }, [points])

  const averageArea = useMemo(() => {
    const visible = points.filter((p) => p.averageY != null)
    if (visible.length < 2) return ''
    const top = visible
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${(p.averageY ?? 0).toFixed(2)}`)
      .join(' ')
    const baseY = chartHeight - chartPadding.bottom
    const lastX = visible[visible.length - 1].x.toFixed(2)
    const firstX = visible[0].x.toFixed(2)
    return `${top} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`
  }, [points])

  const bars = useMemo(() => {
    const innerWidth = chartWidth - chartPadding.left - chartPadding.right
    const barWidth = Math.max(10, Math.min(48, innerWidth / Math.max(points.length * 1.8, 6)))
    const bottom = chartHeight - chartPadding.bottom
    return points.map((p) => ({
      ...p,
      width: barWidth,
      xBar: p.x - barWidth / 2,
      height: bottom - p.activeY,
    }))
  }, [points])

  const empty = !data.length
  const showActive = metric !== 'score'
  const showScore = metric !== 'active'

  const latestScore = points[points.length - 1]?.averageQuizScore ?? null
  const peakActive = Math.max(0, ...points.map((p) => p.activeStudents))

  const rangeLabel: Record<StudentPerformanceRange, string> = {
    '7d': 'last 7 days',
    '30d': 'last 30 days',
    semester: 'this semester',
    all: 'all time',
  }

  return (
    <section
      style={{
        borderRadius: 14,
        border: '1px solid var(--admin-surface-border)',
        background: 'var(--admin-panel-bg)',
        padding: 14,
        boxShadow: '0 1px 0 rgba(18, 65, 147, 0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: '#1553cf', fontWeight: 800 }}>
            Performance Trend
          </div>
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 2 }}>
            Participation and average score across the {rangeLabel[range]}.
          </div>
        </div>
        <div
          role="tablist"
          aria-label="Trend metric"
          style={{
            display: 'inline-flex',
            borderRadius: 8,
            border: '1px solid var(--admin-surface-border)',
            background: 'var(--admin-panel-bg-muted)',
            padding: 2,
          }}
        >
          {(
            [
              { value: 'both', label: 'Both' },
              { value: 'score', label: 'Score' },
              { value: 'active', label: 'Activity' },
            ] as { value: Metric; label: string }[]
          ).map((option) => {
            const active = metric === option.value
            return (
              <button
                key={option.value}
                role="tab"
                aria-selected={active}
                onClick={() => setMetric(option.value)}
                style={{
                  borderRadius: 6,
                  border: 'none',
                  padding: '4px 10px',
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: active ? 'var(--admin-panel-bg)' : 'transparent',
                  color: active ? '#1553cf' : 'var(--cpp-muted)',
                  boxShadow: active ? '0 1px 2px rgba(21,83,207,0.10)' : 'none',
                  transition: 'all 120ms ease',
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          borderRadius: 12,
          border: '1px solid rgba(21, 83, 207, 0.08)',
          background:
            'linear-gradient(180deg, rgba(21,83,207,0.025) 0%, var(--admin-panel-bg-muted) 100%)',
          padding: 10,
          position: 'relative',
        }}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          width="100%"
          height="220"
          role="img"
          aria-label="Student performance trend chart"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="trend-score-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a89c2" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0a89c2" stopOpacity="0.0" />
            </linearGradient>
          </defs>

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
                  strokeDasharray="3 5"
                />
                <text x={4} y={y + 3.5} fill="var(--cpp-muted)" fontSize="10">
                  {tick}%
                </text>
              </g>
            )
          })}

          {!empty && showActive
            ? bars.map((bar) => (
                <rect
                  key={`bar-${bar.bucketStart}`}
                  x={bar.xBar}
                  y={bar.activeY}
                  width={bar.width}
                  height={bar.height}
                  rx={bar.width > 16 ? 6 : 3}
                  fill="rgba(21, 83, 207, 0.22)"
                />
              ))
            : null}

          {!empty && showScore && averageArea ? (
            <path d={averageArea} fill="url(#trend-score-fill)" />
          ) : null}

          {!empty && showScore && averagePath ? (
            <path
              d={averagePath}
              fill="none"
              stroke="#0a89c2"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {!empty && showScore
            ? points
                .filter((p) => p.averageY != null)
                .map((p) => (
                  <circle
                    key={`score-${p.bucketStart}`}
                    cx={p.x}
                    cy={p.averageY ?? 0}
                    r={3}
                    fill="#0a89c2"
                    stroke="var(--admin-panel-bg)"
                    strokeWidth="1.5"
                  />
                ))
            : null}

          {!empty
            ? points.map((p, i) => {
                const everyOther = points.length > 8 ? i % 2 === 0 : true
                if (!everyOther) return null
                return (
                  <text
                    key={`label-${p.bucketStart}`}
                    x={p.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    fill="var(--cpp-muted)"
                    fontSize="10"
                  >
                    {p.label}
                  </text>
                )
              })
            : null}

          {!empty
            ? points.map((p) => (
                <rect
                  key={`hit-${p.bucketStart}`}
                  x={p.x - 18}
                  y={chartPadding.top}
                  width={36}
                  height={chartHeight - chartPadding.top - chartPadding.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHovered(p)}
                />
              ))
            : null}

          {empty ? (
            <>
              <rect
                x={chartPadding.left}
                y={chartPadding.top}
                width={chartWidth - chartPadding.left - chartPadding.right}
                height={chartHeight - chartPadding.top - chartPadding.bottom}
                rx="10"
                fill="rgba(21, 83, 207, 0.025)"
                stroke="rgba(21, 83, 207, 0.10)"
                strokeDasharray="5 7"
              />
              <text
                x={chartWidth / 2}
                y={chartHeight / 2 - 6}
                textAnchor="middle"
                fill="var(--cpp-ink)"
                fontSize="14"
                fontWeight="700"
              >
                No trend data for the {rangeLabel[range]}
              </text>
              <text
                x={chartWidth / 2}
                y={chartHeight / 2 + 14}
                textAnchor="middle"
                fill="var(--cpp-muted)"
                fontSize="11"
              >
                Trend lines will appear once students submit work in this window.
              </text>
            </>
          ) : null}
        </svg>

        {hovered ? (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 12,
              padding: '8px 10px',
              borderRadius: 8,
              background: 'var(--admin-panel-bg)',
              border: '1px solid var(--admin-surface-border)',
              boxShadow: '0 4px 14px rgba(18, 65, 147, 0.10)',
              fontSize: 12,
              minWidth: 140,
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--cpp-ink)' }}>{hovered.label}</div>
            <div style={{ marginTop: 4, color: 'var(--cpp-muted)' }}>
              <span style={{ fontWeight: 700, color: '#1553cf' }}>{hovered.activeStudents}</span> active
            </div>
            <div style={{ color: 'var(--cpp-muted)' }}>
              <span style={{ fontWeight: 700, color: '#0a89c2' }}>
                {formatPercent(hovered.averageQuizScore, '—')}
              </span>{' '}
              avg score
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              position: 'absolute',
              top: 10,
              right: 12,
              fontSize: 11,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--cpp-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(21, 83, 207, 0.22)' }} />
              Active
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--cpp-muted)' }}>
              <span style={{ width: 14, height: 2, borderRadius: 999, background: '#0a89c2' }} />
              Avg score
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          marginTop: 10,
        }}
      >
        <div
          style={{
            borderRadius: 8,
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid var(--admin-surface-border)',
            padding: '8px 10px',
          }}
        >
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 800 }}>
            Latest avg
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--cpp-ink)', marginTop: 4 }}>
            {formatPercent(latestScore, '—')}
          </div>
        </div>
        <div
          style={{
            borderRadius: 8,
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid var(--admin-surface-border)',
            padding: '8px 10px',
          }}
        >
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 800 }}>
            Peak active
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--cpp-ink)', marginTop: 4 }}>
            {peakActive} / {summary.studentCount}
          </div>
        </div>
        <div
          style={{
            borderRadius: 8,
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid var(--admin-surface-border)',
            padding: '8px 10px',
          }}
        >
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 800 }}>
            Buckets
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--cpp-ink)', marginTop: 4 }}>
            {data.length}
          </div>
        </div>
      </div>
    </section>
  )
}
