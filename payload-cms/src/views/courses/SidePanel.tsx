'use client'

import React, { useEffect } from 'react'

type SidePanelProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'sm' | 'md' | 'lg'
}

const widthClass = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
} as const

export default function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}: SidePanelProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30"
      />
      <aside
        className={`absolute inset-y-0 right-0 flex ${widthClass[width]} flex-col border-l border-[var(--admin-surface-border)] bg-[var(--admin-surface)] shadow-2xl`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-[var(--admin-surface-border)] px-4 py-3">
          <div className="min-w-0">
            <h2 className="m-0 truncate text-base font-semibold text-[var(--cpp-ink)]">
              {title}
            </h2>
            {subtitle ? (
              <div className="mt-0.5 truncate text-xs text-[var(--cpp-muted)]">{subtitle}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-sm font-semibold text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>
        {footer ? (
          <footer className="border-t border-[var(--admin-surface-border)] px-4 py-3">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  )
}
