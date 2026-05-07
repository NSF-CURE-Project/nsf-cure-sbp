'use client'

import React from 'react'
import type { InsightItem } from './shared'

const toneStyles: Record<
  InsightItem['tone'],
  { border: string; background: string; color: string }
> = {
  neutral: {
    border: 'rgba(21, 83, 207, 0.18)',
    background: 'rgba(21, 83, 207, 0.06)',
    color: '#1553cf',
  },
  warning: {
    border: 'rgba(217, 119, 6, 0.2)',
    background: 'rgba(245, 158, 11, 0.08)',
    color: '#b45309',
  },
  danger: {
    border: 'rgba(220, 38, 38, 0.18)',
    background: 'rgba(239, 68, 68, 0.08)',
    color: '#b91c1c',
  },
  positive: {
    border: 'rgba(5, 150, 105, 0.2)',
    background: 'rgba(16, 185, 129, 0.08)',
    color: '#047857',
  },
}

export const InsightsPanel = ({ items }: { items: InsightItem[] }) => (
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
      Insights
    </div>
    <div style={{ fontSize: 13, color: 'var(--cpp-muted)', marginTop: 4, marginBottom: 14 }}>
      Focus staff attention on activity gaps, completion drop-off, and students who may need intervention.
    </div>
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}
    >
      {items.map((item) => {
        const tone = toneStyles[item.tone]

        return (
          <article
            key={item.id}
            style={{
              borderRadius: 12,
              border: `1px solid ${tone.border}`,
              background: tone.background,
              padding: '14px 14px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cpp-ink)' }}>{item.title}</div>
              <div
                style={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: 999,
                  background: '#fff',
                  color: tone.color,
                  fontWeight: 900,
                  fontSize: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${tone.border}`,
                }}
              >
                {item.count}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.55, marginTop: 8 }}>
              {item.description}
            </div>
          </article>
        )
      })}
    </div>
  </section>
)
