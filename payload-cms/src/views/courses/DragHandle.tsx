'use client'

import React from 'react'

type DragHandleProps = {
  label: string
  listeners?: Record<string, unknown>
  attributes?: Record<string, unknown>
  disabled?: boolean
}

export default function DragHandle({ label, listeners, attributes, disabled }: DragHandleProps) {
  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] text-[var(--cpp-muted)] transition hover:text-[var(--cpp-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={label}
      {...attributes}
      {...listeners}
      disabled={disabled}
    >
      <span aria-hidden="true" className="text-sm leading-none">
        ⋮⋮
      </span>
    </button>
  )
}
