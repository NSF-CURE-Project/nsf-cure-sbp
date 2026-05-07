'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'

export type OverflowAction =
  | {
      kind: 'link'
      label: string
      href: string
    }
  | {
      kind: 'button'
      label: string
      onClick: () => void
      destructive?: boolean
      disabled?: boolean
      pendingLabel?: string
    }

type RowOverflowMenuProps = {
  ariaLabel: string
  actions: OverflowAction[]
  align?: 'left' | 'right'
}

export default function RowOverflowMenu({
  ariaLabel,
  actions,
  align = 'right',
}: RowOverflowMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonId = useId()

  useEffect(() => {
    if (!open) return
    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        id={buttonId}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-sm font-semibold text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
      >
        ⋯
      </button>
      {open ? (
        <div
          role="menu"
          aria-labelledby={buttonId}
          className={`absolute top-full z-30 mt-1 w-44 overflow-hidden rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {actions.map((action, index) => {
            if (action.kind === 'link') {
              return (
                <Link
                  key={`link-${index}`}
                  href={action.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
                >
                  {action.label}
                </Link>
              )
            }
            const tone = action.destructive
              ? 'text-red-600 hover:bg-red-50'
              : 'text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]'
            const isFirst = index === 0
            return (
              <button
                key={`button-${index}`}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={() => {
                  setOpen(false)
                  action.onClick()
                }}
                className={`block w-full px-3 py-2 text-left text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${tone} ${
                  isFirst ? '' : 'border-t border-[var(--admin-surface-border)]'
                }`}
              >
                {action.disabled && action.pendingLabel ? action.pendingLabel : action.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
