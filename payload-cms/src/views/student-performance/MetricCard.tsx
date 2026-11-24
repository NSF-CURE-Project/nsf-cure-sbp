'use client'

import React from 'react'
import { cardStyle, formatSignedNumber, formatSignedPercent } from './shared'

type DeltaKind = 'count' | 'percent'

type DeltaProps = {
  value: number | null | undefined
  kind?: DeltaKind
  positiveIsGood?: boolean
  suffix?: string
}

const Delta = ({ value, kind = 'count', positiveIsGood = true, suffix }: DeltaProps) => {
  if (value == null || Number.isNaN(value)) {
    return (
      <span style={{ fontSize: 11, color: 'var(--cpp-muted)', fontWeight: 700 }}>
        — no change
      </span>
    )
  }

  const formatted = kind === 'percent' ? formatSignedPercent(value) : formatSignedNumber(value)
  const isPositive = value > 0
  const isNeutral = value === 0
  const tone = isNeutral
    ? { color: 'var(--cpp-muted)', background: 'rgba(100,116,139,0.08)', arrow: '·' }
    : (isPositive === positiveIsGood)
      ? { color: '#127455', background: 'rgba(20,131,92,0.10)', arrow: isPositive ? '↑' : '↓' }
      : { color: '#b91c1c', background: 'rgba(220,38,38,0.10)', arrow: isPositive ? '↑' : '↓' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 800,
        color: tone.color,
        background: tone.background,
        padding: '2px 6px',
        borderRadius: 999,
      }}
    >
      <span aria-hidden style={{ fontSize: 12, lineHeight: 1 }}>{tone.arrow}</span>
      {formatted}
      {suffix ? <span style={{ opacity: 0.75, fontWeight: 700 }}>{suffix}</span> : null}
    </span>
  )
}

type SparklineProps = {
  values: (number | null)[]
  color: string
  height?: number
  ariaLabel?: string
}

const Sparkline = ({ values, color, height = 28, ariaLabel }: SparklineProps) => {
  const numeric = values.map((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : null))
  const valid = numeric.filter((v): v is number => v != null)
  if (valid.length < 2) {
    return (
      <div
        aria-hidden
        style={{
          height,
          borderRadius: 6,
          background:
            'repeating-linear-gradient(90deg, rgba(21,83,207,0.06) 0 6px, transparent 6px 12px)',
        }}
      />
    )
  }

  const max = Math.max(...valid)
  const min = Math.min(...valid)
  const span = max - min || 1
  const width = 120
  const stepX = numeric.length > 1 ? width / (numeric.length - 1) : width

  let lastValid: { x: number; y: number } | null = null
  const segments: string[] = []
  numeric.forEach((value, index) => {
    if (value == null) return
    const x = index * stepX
    const y = height - ((value - min) / span) * (height - 4) - 2
    if (!lastValid) {
      segments.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`)
    } else {
      segments.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`)
    }
    lastValid = { x, y }
  })

  const last = numeric.reduce<{ x: number; y: number } | null>((acc, value, index) => {
    if (value == null) return acc
    const x = index * stepX
    const y = height - ((value - min) / span) * (height - 4) - 2
    return { x, y }
  }, null)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={ariaLabel ?? 'Trend sparkline'}
      preserveAspectRatio="none"
    >
      <path d={segments.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {last ? <circle cx={last.x} cy={last.y} r={2.25} fill={color} /> : null}
    </svg>
  )
}

export type MetricCardProps = {
  eyebrow: string
  value: string
  detail?: string
  accent?: string
  emphasize?: boolean
  delta?: number | null
  deltaKind?: DeltaKind
  deltaPositiveIsGood?: boolean
  deltaSuffix?: string
  sparkline?: (number | null)[]
  footnote?: string
  progress?: number | null
}

export const MetricCard = ({
  eyebrow,
  value,
  detail,
  accent = '#1553cf',
  emphasize = false,
  delta,
  deltaKind = 'count',
  deltaPositiveIsGood = true,
  deltaSuffix,
  sparkline,
  footnote,
  progress,
}: MetricCardProps) => {
  const hasProgress = typeof progress === 'number' && !Number.isNaN(progress)
  const clampedProgress = hasProgress ? Math.max(0, Math.min(100, progress as number)) : 0

  return (
    <div
      style={{
        ...cardStyle,
        padding: emphasize ? '14px 14px 12px' : cardStyle.padding,
        background: emphasize ? 'var(--admin-panel-bg)' : cardStyle.background,
        boxShadow: emphasize ? '0 6px 18px rgba(21, 83, 207, 0.10)' : undefined,
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div
          style={{
            fontSize: 10.5,
            textTransform: 'uppercase',
            letterSpacing: 0.7,
            color: accent,
            fontWeight: 800,
          }}
        >
          {eyebrow}
        </div>
        <Delta value={delta} kind={deltaKind} positiveIsGood={deltaPositiveIsGood} suffix={deltaSuffix} />
      </div>

      <div
        style={{
          fontSize: emphasize ? 30 : 24,
          fontWeight: 900,
          color: 'var(--cpp-ink)',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>

      {detail ? (
        <div style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.45 }}>{detail}</div>
      ) : null}

      {sparkline ? (
        <Sparkline values={sparkline} color={accent} ariaLabel={`${eyebrow} trend`} />
      ) : null}

      {hasProgress ? (
        <div
          aria-hidden
          style={{
            height: 4,
            borderRadius: 999,
            background: 'rgba(21,83,207,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${clampedProgress}%`,
              background: accent,
              borderRadius: 999,
              transition: 'width 220ms ease',
            }}
          />
        </div>
      ) : null}

      {footnote ? (
        <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>{footnote}</div>
      ) : null}
    </div>
  )
}
