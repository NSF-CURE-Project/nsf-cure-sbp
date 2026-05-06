'use client'

import React from 'react'

type SectionItem<T extends string> = {
  id: T
  label: string
  description?: string
}

type Props<T extends string> = {
  items: readonly SectionItem<T>[]
  activeId: T
  onChange: (id: T) => void
  ariaLabel: string
  compact?: boolean
  style?: React.CSSProperties
}

const getListStyle = (compact: boolean): React.CSSProperties => ({
  display: 'grid',
  gap: compact ? 5 : 6,
  gridTemplateColumns: compact
    ? 'repeat(auto-fit, minmax(150px, 1fr))'
    : 'repeat(auto-fit, minmax(190px, 1fr))',
  padding: compact ? 3 : 4,
  borderRadius: compact ? 10 : 12,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  background: 'rgba(15, 23, 42, 0.035)',
  alignItems: 'stretch',
})

const getButtonStyle = (active: boolean, compact: boolean): React.CSSProperties => ({
  position: 'relative',
  borderRadius: compact ? 9 : 10,
  border: active ? '1px solid rgba(15, 23, 42, 0.08)' : '1px solid transparent',
  background: active ? 'rgba(255, 255, 255, 0.96)' : 'transparent',
  color: active ? 'var(--cpp-ink)' : 'var(--cpp-muted)',
  padding: compact ? '9px 11px 10px' : '11px 13px 12px',
  fontSize: compact ? 12 : 13,
  fontWeight: active ? 700 : 600,
  cursor: 'pointer',
  display: 'grid',
  gap: compact ? 1 : 2,
  textAlign: 'left',
  alignContent: 'start',
  minHeight: compact ? 54 : 64,
  boxShadow: active ? '0 1px 2px rgba(15, 23, 42, 0.05)' : 'none',
  transition: 'background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
})

export function AdminSectionSwitcher<T extends string>({
  items,
  activeId,
  onChange,
  ariaLabel,
  compact = false,
  style,
}: Props<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} style={{ ...getListStyle(compact), ...style }}>
      {items.map((item) => {
        const active = activeId === item.id

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            style={getButtonStyle(active, compact)}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: compact ? 7 : 8,
                minWidth: 0,
              }}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: 3,
                    height: compact ? 14 : 16,
                    borderRadius: 999,
                    background: '#0b61b9',
                    flexShrink: 0,
                  }}
                />
              ) : null}
              <span>{item.label}</span>
            </span>
            {item.description ? (
              <span
                style={{
                  fontSize: compact ? 10 : 11,
                  lineHeight: compact ? 1.35 : 1.4,
                  fontWeight: 500,
                  color: active ? 'var(--cpp-muted)' : 'rgba(81, 104, 137, 0.92)',
                  paddingLeft: active ? (compact ? 10 : 11) : 0,
                }}
              >
                {item.description}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
