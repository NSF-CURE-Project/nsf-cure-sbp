'use client'

import React from 'react'
import type { StudentStatus } from './shared'
import { getStatusMeta } from './shared'

export const StatusBadge = ({ status }: { status: StudentStatus }) => {
  const meta = getStatusMeta(status)

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        border: `1px solid ${meta.border}`,
        background: meta.background,
        color: meta.color,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.02em',
        padding: '5px 10px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: meta.color,
          display: 'inline-block',
        }}
      />
      {meta.label}
    </span>
  )
}
