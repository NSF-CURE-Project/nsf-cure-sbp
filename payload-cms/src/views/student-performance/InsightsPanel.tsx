'use client'

import React from 'react'
import type { InsightAction, InsightItem } from './shared'

const toneStyles: Record<
  InsightItem['tone'],
  { border: string; background: string; color: string; chip: string }
> = {
  neutral: {
    border: 'rgba(21, 83, 207, 0.18)',
    background: 'rgba(21, 83, 207, 0.05)',
    color: '#1553cf',
    chip: 'rgba(21, 83, 207, 0.12)',
  },
  warning: {
    border: 'rgba(217, 119, 6, 0.20)',
    background: 'rgba(245, 158, 11, 0.07)',
    color: '#b45309',
    chip: 'rgba(217, 119, 6, 0.16)',
  },
  danger: {
    border: 'rgba(220, 38, 38, 0.20)',
    background: 'rgba(239, 68, 68, 0.07)',
    color: '#b91c1c',
    chip: 'rgba(220, 38, 38, 0.16)',
  },
  positive: {
    border: 'rgba(5, 150, 105, 0.20)',
    background: 'rgba(16, 185, 129, 0.07)',
    color: '#047857',
    chip: 'rgba(5, 150, 105, 0.16)',
  },
}

export const InsightsPanel = ({
  items,
  onAction,
}: {
  items: InsightItem[]
  onAction?: (action: InsightAction) => void
}) => {
  const actionable = items.filter((i) => i.count > 0)
  const resolved = items.filter((i) => i.count === 0)

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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: '#1553cf', fontWeight: 800 }}>
          Action Queue
        </div>
        <div style={{ fontSize: 11, color: 'var(--cpp-muted)', fontWeight: 700 }}>
          {actionable.length} {actionable.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 2 }}>
        Route staff attention to activity gaps, completion drop-off, and students who need intervention.
      </div>

      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {actionable.length === 0 ? (
          <div
            style={{
              borderRadius: 10,
              border: '1px dashed rgba(5, 150, 105, 0.24)',
              background: 'rgba(16, 185, 129, 0.06)',
              padding: '14px 12px',
              fontSize: 12.5,
              color: '#047857',
              fontWeight: 700,
            }}
          >
            All clear — no students currently flagged for intervention.
          </div>
        ) : null}

        {actionable.map((item) => {
          const tone = toneStyles[item.tone]
          return (
            <article
              key={item.id}
              style={{
                borderRadius: 10,
                border: `1px solid ${tone.border}`,
                background: tone.background,
                padding: '10px 12px',
                display: 'grid',
                gap: 6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span
                    style={{
                      minWidth: 26,
                      height: 22,
                      padding: '0 7px',
                      borderRadius: 999,
                      background: tone.chip,
                      color: tone.color,
                      fontWeight: 900,
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.count}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: 'var(--cpp-ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </span>
                </div>
                {item.action && onAction ? (
                  <button
                    type="button"
                    onClick={() => onAction(item.action!)}
                    style={{
                      border: `1px solid ${tone.border}`,
                      background: 'var(--admin-panel-bg)',
                      color: tone.color,
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Review
                    <span aria-hidden style={{ fontSize: 11 }}>↗</span>
                  </button>
                ) : null}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--cpp-muted)', lineHeight: 1.5 }}>
                {item.description}
              </div>
            </article>
          )
        })}
      </div>

      {resolved.length > 0 ? (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(21,83,207,0.10)' }}>
          <div
            style={{
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              color: 'var(--cpp-muted)',
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Healthy
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {resolved.map((item) => (
              <span
                key={item.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  color: '#047857',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(5, 150, 105, 0.22)',
                  padding: '3px 8px',
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                <span aria-hidden>✓</span>
                {item.title}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
