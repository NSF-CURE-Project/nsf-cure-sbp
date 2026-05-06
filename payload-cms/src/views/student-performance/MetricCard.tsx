'use client'

import React from 'react'
import { cardStyle } from './shared'

export const MetricCard = ({
  eyebrow,
  value,
  title,
  detail,
  accent = '#1553cf',
  emphasize = false,
}: {
  eyebrow: string
  value: string
  title: string
  detail: string
  accent?: string
  emphasize?: boolean
}) => (
  <div
    style={{
      ...cardStyle,
      padding: emphasize ? '18px 18px 16px' : cardStyle.padding,
      background: emphasize ? 'var(--admin-panel-bg)' : cardStyle.background,
      boxShadow: emphasize ? '0 8px 24px rgba(21, 83, 207, 0.08)' : undefined,
    }}
  >
    <div
      style={{
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        color: accent,
        fontWeight: 800,
      }}
    >
      {eyebrow}
    </div>
    <div
      style={{
        fontSize: emphasize ? 38 : 30,
        fontWeight: 900,
        color: 'var(--cpp-ink)',
        marginTop: 10,
        lineHeight: 1,
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 13, color: 'var(--cpp-ink)', fontWeight: 700, marginTop: 10 }}>{title}</div>
    <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 6, lineHeight: 1.5 }}>{detail}</div>
  </div>
)
