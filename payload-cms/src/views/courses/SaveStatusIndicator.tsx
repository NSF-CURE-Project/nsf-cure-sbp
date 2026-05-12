'use client'

import React from 'react'
import type { SaveStatus } from './types'

type SaveStatusIndicatorProps = {
  status: SaveStatus
}

const statusText: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Error saving order',
}

const SavingSpinner = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
)

const SavedCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12.5l4.5 4.5L19 7"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ErrorIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
    <path
      d="M12 7v6M12 16v.01"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

export default function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  if (status === 'idle') return null

  const palette: Record<Exclude<SaveStatus, 'idle'>, { bg: string; border: string; color: string }> = {
    saving: {
      bg: 'rgba(31, 69, 120, 0.1)',
      border: 'rgba(31, 69, 120, 0.24)',
      color: '#1f4578',
    },
    saved: {
      bg: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.28)',
      color: '#15803d',
    },
    error: {
      bg: 'rgba(220, 38, 38, 0.10)',
      border: 'rgba(220, 38, 38, 0.32)',
      color: '#b91c1c',
    },
  }

  const tone = palette[status]
  const icon =
    status === 'saving' ? <SavingSpinner /> : status === 'saved' ? <SavedCheck /> : <ErrorIcon />

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        color: tone.color,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}
    >
      {icon}
      {statusText[status]}
    </div>
  )
}
