'use client'

import React, { useEffect, useState } from 'react'
import {
  getLessonVersion,
  listLessonVersions,
  type LessonVersionSummary,
} from '../courses-order-api'

type VersionsPanelProps = {
  lessonId: string
  // Called when the user clicks Restore on a version. Receives the version's
  // title + raw layout (still in Payload's stored shape); caller hydrates it
  // into editor state via `fromPersistedLayout`.
  onRestore: (snapshot: { title: string; layout: unknown }) => void
}

const formatTimestamp = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const now = Date.now()
  const diffMs = now - date.getTime()
  if (diffMs < 60_000) return 'just now'
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Collapsible inline list of recent versions for a lesson. Each version row
// shows when it was saved, who saved it, whether it was an autosave or a
// manual draft/publish, and a Restore button that hydrates the editor with
// that version's content (user must still hit Save to commit the restore).
export default function VersionsPanel({ lessonId, onRestore }: VersionsPanelProps) {
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<LessonVersionSummary[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    listLessonVersions(lessonId)
      .then((docs) => {
        if (!cancelled) setVersions(docs)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load versions.')
          setVersions([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, lessonId])

  const handleRestore = async (versionId: string) => {
    setRestoringId(versionId)
    setError(null)
    try {
      const snapshot = await getLessonVersion(versionId)
      onRestore(snapshot)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not restore version.')
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <section className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
      >
        <span>Version history</span>
        <span aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div className="border-t border-[var(--admin-surface-border)] p-2">
          {loading ? (
            <div className="text-xs text-[var(--cpp-muted)]">Loading…</div>
          ) : versions == null || versions.length === 0 ? (
            <div className="text-xs text-[var(--cpp-muted)]">
              No versions yet. Each Save Draft / Publish / auto-save creates one.
            </div>
          ) : (
            <ul className="grid gap-1.5">
              {versions.map((v) => {
                const label = v.autosave ? 'auto-save' : v.status
                return (
                  <li
                    key={v.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-[var(--admin-surface-border)] px-2 py-1.5 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`cw-version-pill cw-version-pill--${v.status}`}
                          aria-label={label}
                        >
                          {label}
                        </span>
                        <span className="truncate text-[var(--cpp-ink)]">
                          {formatTimestamp(v.updatedAt)}
                        </span>
                      </div>
                      <div className="truncate text-xs text-[var(--cpp-muted)]">
                        {v.authorLabel ?? 'Unknown author'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestore(v.id)}
                      disabled={restoringId !== null}
                      className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {restoringId === v.id ? 'Restoring…' : 'Restore'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {error ? <div className="mt-2 text-xs text-red-700">{error}</div> : null}
          <p className="mt-2 text-[10px] text-[var(--cpp-muted)]">
            Restore loads the version into the editor. Press Save draft or Publish to commit
            the restore as a new version.
          </p>
        </div>
      ) : null}
      <style>{`
        .cw-version-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .cw-version-pill--published {
          background: rgba(16, 185, 129, 0.1);
          color: #047857;
          border-color: rgba(16, 185, 129, 0.18);
        }
        .cw-version-pill--draft {
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
          border-color: rgba(100, 116, 139, 0.18);
        }
      `}</style>
    </section>
  )
}
