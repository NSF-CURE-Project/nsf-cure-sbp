'use client'

import React from 'react'
import { clampPercent, formatPercent } from './shared'

export const ProgressBar = ({
  value,
  label,
}: {
  value: number | null | undefined
  label?: string
}) => {
  const percent = clampPercent(value)
  const isEmpty = value == null || Number.isNaN(value)

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          fontSize: 12,
        }}
      >
        <span style={{ color: 'var(--cpp-muted)' }}>{label ?? 'Completion'}</span>
        <span style={{ color: 'var(--cpp-ink)', fontWeight: 700 }}>
          {formatPercent(value, 'No progress data')}
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: isEmpty ? 'rgba(100, 116, 139, 0.10)' : 'rgba(21, 83, 207, 0.10)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            borderRadius: 999,
            background: isEmpty ? '#cbd5e1' : '#1553cf',
            transition: 'width 180ms ease',
          }}
        />
      </div>
    </div>
  )
}
