'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { FeedbackId } from './feedback-api'

export type FeedbackItem = {
  id: FeedbackId
  message: string
  email: string | null
  pageUrl: string | null
  userAgent: string | null
  read: boolean
  createdAt: string | null
}

type FeedbackHomeCardProps = {
  feedback: FeedbackItem
  expanded: boolean
  updating: boolean
  deleting: boolean
  onToggleExpand: (id: FeedbackId) => void
  onToggleRead: (feedback: FeedbackItem) => void
  onDelete: (feedback: FeedbackItem) => void
}

const formatDateTime = (iso: string | null) => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const truncatePath = (value: string | null) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return `${url.pathname}${url.search}` || url.host
  } catch {
    return value.length > 80 ? `${value.slice(0, 77)}…` : value
  }
}

export default function FeedbackHomeCard({
  feedback,
  expanded,
  updating,
  deleting,
  onToggleExpand,
  onToggleRead,
  onDelete,
}: FeedbackHomeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handlePointer = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  const submittedLabel = formatDateTime(feedback.createdAt)
  const pageLabel = truncatePath(feedback.pageUrl)

  return (
    <article
      className={`group relative rounded-lg border bg-[var(--admin-surface)] p-4 transition ${
        feedback.read
          ? 'border-[var(--admin-surface-border)] hover:border-sky-300'
          : 'border-sky-300 ring-1 ring-sky-100 hover:border-sky-400'
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <button
          type="button"
          onClick={() => onToggleExpand(feedback.id)}
          className="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left"
          aria-expanded={expanded}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                feedback.read
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {feedback.read ? 'Read' : 'Unread'}
            </span>
            <span className="truncate text-sm text-[var(--cpp-ink)]">
              {feedback.email ?? 'Anonymous'}
            </span>
            {submittedLabel ? (
              <span className="text-xs text-[var(--cpp-muted)]">· {submittedLabel}</span>
            ) : null}
          </div>
          <div
            className={`mt-1 text-sm text-[var(--cpp-ink)] ${
              expanded ? 'whitespace-pre-wrap' : 'line-clamp-2'
            }`}
          >
            {feedback.message}
          </div>
          {pageLabel ? (
            <div className="mt-1 truncate text-xs text-[var(--cpp-muted)]">
              <span>Page: </span>
              <span className="font-mono text-[var(--cpp-ink)]">{pageLabel}</span>
            </div>
          ) : null}
          {expanded && feedback.userAgent ? (
            <div className="mt-1 truncate text-xs text-[var(--cpp-muted)]">
              <span>User agent: </span>
              <span className="font-mono">{feedback.userAgent}</span>
            </div>
          ) : null}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={updating}
            onClick={(event) => {
              event.stopPropagation()
              onToggleRead(feedback)
            }}
            className="rounded-md border border-[var(--admin-surface-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updating ? '…' : feedback.read ? 'Mark unread' : 'Mark read'}
          </button>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setMenuOpen((open) => !open)
              }}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More actions"
              className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1.5 text-sm font-semibold text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
            >
              ⋯
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] shadow-lg"
              >
                {feedback.pageUrl ? (
                  <a
                    href={feedback.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="block px-3 py-2 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Open page
                  </a>
                ) : null}
                {feedback.email ? (
                  <a
                    href={`mailto:${feedback.email}`}
                    role="menuitem"
                    className="block border-t border-[var(--admin-surface-border)] px-3 py-2 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Reply via email
                  </a>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  disabled={deleting}
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(feedback)
                  }}
                  className="block w-full border-t border-[var(--admin-surface-border)] px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete feedback'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
