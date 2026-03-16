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

export default function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  if (status === 'idle') return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        status === 'error'
          ? 'text-sm font-medium text-red-700'
          : 'text-sm font-medium text-[var(--cpp-muted)]'
      }
    >
      {statusText[status]}
    </div>
  )
}
