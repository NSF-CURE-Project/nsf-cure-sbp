import React from 'react'

// Tiny inline sparkline with end-point marker, empty state, and accessible label.
export const Sparkline = ({
  values,
  color = '#1e3a8a',
  width = 84,
  height = 28,
  label,
}: {
  values: number[]
  color?: string
  width?: number
  height?: number
  label?: string
}) => {
  if (!values.length) {
    // Empty state: a faint flat line so the KPI tile keeps its visual rhythm.
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label ? `${label}: no data yet` : 'No trend data yet'}
      >
        <line
          x1="2"
          x2={width - 2}
          y1={height / 2}
          y2={height / 2}
          stroke="rgba(15, 23, 42, 0.18)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 4"
        />
      </svg>
    )
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const last = values[values.length - 1]
  const range = max - min || 1
  const stepX = values.length > 1 ? width / (values.length - 1) : 0
  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const linePath = `M${points.join(' L')}`
  const areaPath = `${linePath} L${width.toFixed(1)},${height} L0,${height} Z`
  const gradientId = `spark-${Math.random().toString(36).slice(2, 8)}`

  const lastX = values.length > 1 ? width : width / 2
  const lastY = height - ((last - min) / range) * height
  const direction = values.length >= 2 ? last - values[values.length - 2] : 0
  const trendWord = direction > 0 ? 'trending up' : direction < 0 ? 'trending down' : 'steady'
  const accessibleLabel = label
    ? `${label} — ${trendWord}, range ${min.toFixed(1)} to ${max.toFixed(1)}, latest ${last.toFixed(1)}`
    : `Trend ${trendWord}, latest ${last.toFixed(1)}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={accessibleLabel}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2.4" fill={color} />
      <circle cx={lastX} cy={lastY} r="3.6" fill={color} fillOpacity="0.22" />
    </svg>
  )
}

export const HBar = ({
  label,
  numerator,
  denominator,
  rate,
  accent = '#1553cf',
}: {
  label: string
  numerator: number
  denominator: number
  rate: number
  accent?: string
}) => {
  const pct = Math.max(0, Math.min(1, rate))
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--cpp-ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
          title={label}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--cpp-muted)',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          <strong style={{ color: 'var(--cpp-ink)' }}>{Math.round(pct * 100)}%</strong>
          <span style={{ opacity: 0.7 }}>
            {' '}
            · {numerator}/{denominator}
          </span>
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: 'rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${(pct * 100).toFixed(1)}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${accent}aa 0%, ${accent} 100%)`,
            borderRadius: 999,
            transition: 'width 600ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        />
      </div>
    </div>
  )
}

export const Donut = ({
  value,
  size = 90,
  stroke = 10,
  accent = '#1553cf',
  label,
  sub,
}: {
  value: number
  size?: number
  stroke?: number
  accent?: string
  label?: string
  sub?: string
}) => {
  const pct = Math.max(0, Math.min(1, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(15, 23, 42, 0.07)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22, 0.61, 0.36, 1)' }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: 16,
            fontWeight: 800,
            fill: 'var(--cpp-ink)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div style={{ minWidth: 0 }}>
        {label ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cpp-ink)' }}>{label}</div>
        ) : null}
        {sub ? (
          <div style={{ fontSize: 11, color: 'var(--cpp-muted)', marginTop: 2 }}>{sub}</div>
        ) : null}
      </div>
    </div>
  )
}

export const ReportingPanel = ({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) => (
  <div
    style={{
      borderRadius: 14,
      border: '1px solid rgba(15, 23, 42, 0.06)',
      background:
        'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 255, 0.92) 100%)',
      padding: '14px 16px',
      boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 6px 14px rgba(15, 23, 42, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minHeight: 180,
    }}
  >
    <div>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cpp-ink)' }}>{title}</div>
      {hint ? (
        <div style={{ fontSize: 11, color: 'var(--cpp-muted)', marginTop: 2 }}>{hint}</div>
      ) : null}
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
  </div>
)
