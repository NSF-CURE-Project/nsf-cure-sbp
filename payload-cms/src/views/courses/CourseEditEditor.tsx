'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateCourseSettings } from './courses-order-api'
import { useBreadcrumbChain } from '../admin/breadcrumbTitle'

type CourseEditEditorProps = {
  courseId: string
  initialTitle: string
  initialDescription: string
  initialSlug: string
  lessonCount: number
  publishedCount: number
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const AUTOSAVE_DEBOUNCE_MS = 1500

// Custom edit screen for courses. Mirrors LessonScaffoldEditor's chrome —
// sticky topbar with breadcrumb + status chip + Cancel/Save, auto-saving
// body — so the two editors feel like one product. Class fields are limited
// to what staff actually need (title, description, slug); order and the
// chapters relationship are managed via the Course Workspace outline.
export default function CourseEditEditor({
  courseId,
  initialTitle,
  initialDescription,
  initialSlug,
  lessonCount,
  publishedCount,
}: CourseEditEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [slug, setSlug] = useState(initialSlug)
  const [showSlug, setShowSlug] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Snapshot of the last successfully-persisted (title, description, slug).
  // Auto-save skips no-ops by comparing the current values against this.
  const lastSavedRef = useRef(
    JSON.stringify({ title: initialTitle, description: initialDescription, slug: initialSlug }),
  )

  useBreadcrumbChain([
    { label: 'Dashboard', href: '/admin' },
    { label: 'Manage Courses', href: '/admin/courses' },
    { label: initialTitle || 'Course', href: `/admin/courses/${courseId}` },
    { label: 'Edit', href: null },
  ])

  const statusChipLabel = lessonCount === 0 ? 'Empty' : 'Active'
  const statusChipTone: 'ok' | 'draft' = lessonCount === 0 ? 'draft' : 'ok'

  // Debounced auto-save. Same shape as the lesson editor's:
  // - Skip while an explicit save is in flight.
  // - Skip if the current snapshot matches the last persisted one.
  // - Require a non-empty title (matches Payload's required validation —
  //   we don't want to ship a 400 every keystroke during typing).
  useEffect(() => {
    if (busy) return
    if (!title.trim()) return
    const snapshot = JSON.stringify({ title, description, slug })
    if (snapshot === lastSavedRef.current) return
    const handle = window.setTimeout(async () => {
      // Re-check at fire time so we don't race a faster typist.
      const fresh = JSON.stringify({ title, description, slug })
      if (fresh !== snapshot) return
      setStatus('saving')
      try {
        await updateCourseSettings(courseId, {
          title: title.trim(),
          description,
          // Slug is optional on edit (Payload's beforeValidate fills a blank
          // slug from title); only send it when the user typed something.
          ...(slug.trim() ? { slug: slug.trim() } : {}),
        })
        lastSavedRef.current = snapshot
        setStatus('saved')
        setSavedAt(Date.now())
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Auto-save failed')
      }
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [courseId, title, description, slug, busy])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const snapshot = JSON.stringify({ title, description, slug })
      await updateCourseSettings(courseId, {
        title: title.trim(),
        description,
        ...(slug.trim() ? { slug: slug.trim() } : {}),
      })
      lastSavedRef.current = snapshot
      setStatus('saved')
      setSavedAt(Date.now())
      router.push(`/admin/courses/${courseId}`)
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Save failed')
      setBusy(false)
    }
  }

  const handleCancel = () => {
    router.push(`/admin/courses/${courseId}`)
  }

  // Tiny status indicator. Re-renders every 30s so "Saved 2m ago" stays
  // current without aggressive polling.
  const [, forceTick] = useState(0)
  useEffect(() => {
    if (status !== 'saved' || savedAt == null) return
    const handle = window.setInterval(() => forceTick((n) => n + 1), 30_000)
    return () => window.clearInterval(handle)
  }, [status, savedAt])

  let saveLabel: string | null = null
  if (status === 'saving') saveLabel = 'Auto-saving…'
  else if (status === 'error') saveLabel = 'Auto-save failed'
  else if (status === 'saved' && savedAt != null) {
    const seconds = Math.max(1, Math.round((Date.now() - savedAt) / 1000))
    saveLabel = `Saved ${seconds < 60 ? `${seconds}s ago` : `${Math.round(seconds / 60)}m ago`}`
  }

  return (
    <div className="cee-shell">
      <style>{`
        .cee-shell { display: grid; gap: 16px; }
        .cee-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          padding: 10px 18px;
          margin: 0 -18px;
          background: var(--admin-surface, #fff);
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .cee-topbar {
          background: var(--admin-surface, #161a23);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .cee-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
        }
        .cee-breadcrumb a {
          color: var(--cpp-ink, #1b1f24);
          text-decoration: none;
          font-weight: 600;
        }
        .cee-breadcrumb a:hover { text-decoration: underline; }
        .cee-breadcrumb__current { color: var(--cpp-ink, #1b1f24); font-weight: 600; }
        .cee-chip {
          display: inline-flex;
          align-items: center;
          padding: 1px 8px;
          margin-left: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .cee-chip--ok {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          border-color: rgba(16, 185, 129, 0.22);
        }
        .cee-chip--draft {
          background: rgba(217, 119, 6, 0.1);
          color: #b45309;
          border-color: rgba(217, 119, 6, 0.2);
        }
        :root[data-theme='dark'] .cee-chip--ok { color: #6ee7b7; }
        :root[data-theme='dark'] .cee-chip--draft { color: #fcd34d; }
        .cee-topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cee-autosave {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
          min-width: 110px;
          text-align: right;
        }
        .cee-autosave--err { color: #b91c1c; }
        .cee-btn {
          display: inline-flex;
          align-items: center;
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid var(--admin-surface-border, #d6dce5);
          background: var(--admin-surface, #fff);
          color: var(--cpp-ink, #1b1f24);
          cursor: pointer;
        }
        .cee-btn:hover { background: var(--admin-surface-muted, #f5f7fa); }
        .cee-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .cee-btn--primary {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
        .cee-btn--primary:hover { background: #1e293b; }
        :root[data-theme='dark'] .cee-btn {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
          color: var(--cpp-ink, #e6e8eb);
        }
        :root[data-theme='dark'] .cee-btn--primary {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #e2e8f0;
        }

        .cee-body {
          display: grid;
          gap: 18px;
          padding: 16px 4px;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }
        .cee-intro h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--cpp-ink, #1b1f24);
        }
        .cee-intro p {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: var(--cpp-muted, #5d6b80);
        }
        .cee-section {
          display: grid;
          gap: 12px;
          padding: 16px 18px;
          border-radius: 10px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .cee-section {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .cee-label { display: grid; gap: 4px; }
        .cee-label__text {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
        }
        .cee-input,
        .cee-textarea {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--cpp-ink, #1b1f24);
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
          font-family: inherit;
        }
        .cee-textarea { min-height: 110px; resize: vertical; }
        .cee-input:focus, .cee-textarea:focus {
          outline: 2px solid rgba(14, 165, 233, 0.4);
          outline-offset: 1px;
          border-color: rgba(14, 165, 233, 0.55);
        }
        :root[data-theme='dark'] .cee-input,
        :root[data-theme='dark'] .cee-textarea {
          background: var(--admin-surface-muted, #232938);
          border-color: var(--admin-surface-border, #2a3140);
          color: var(--cpp-ink, #e6e8eb);
        }
        .cee-hint { font-size: 11px; color: var(--cpp-muted, #5d6b80); }
        .cee-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 16px;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
        }
        .cee-stats strong { color: var(--cpp-ink, #1b1f24); font-weight: 600; }
        :root[data-theme='dark'] .cee-stats strong { color: var(--cpp-ink, #e6e8eb); }
        .cee-disclosure {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--cpp-muted, #5d6b80);
          background: transparent;
          border: 1px dashed var(--admin-surface-border, #d6dce5);
          border-radius: 6px;
          cursor: pointer;
        }
        .cee-disclosure:hover { background: var(--admin-surface-muted, #f5f7fa); }
        .cee-error {
          font-size: 12px;
          color: #b91c1c;
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
        }
      `}</style>

      <div className="cee-topbar">
        <div className="cee-breadcrumb">
          <Link href="/admin/courses">Courses</Link>
          <span aria-hidden>›</span>
          <Link href={`/admin/courses/${courseId}`}>{initialTitle || 'Course'}</Link>
          <span aria-hidden>›</span>
          <span className="cee-breadcrumb__current">Edit</span>
          <span className={`cee-chip cee-chip--${statusChipTone}`}>{statusChipLabel}</span>
        </div>
        <div className="cee-topbar-actions">
          <span
            className={`cee-autosave${status === 'error' ? ' cee-autosave--err' : ''}`}
            aria-live="polite"
          >
            {saveLabel}
          </span>
          <button type="button" onClick={handleCancel} disabled={busy} className="cee-btn">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || !title.trim()}
            className="cee-btn cee-btn--primary"
          >
            {busy ? 'Saving…' : 'Save & close'}
          </button>
        </div>
      </div>

      <div className="cee-body">
        <header className="cee-intro">
          <h1>Edit course</h1>
          <p>
            Auto-saves a couple of seconds after you stop typing. Save &amp; close persists and
            returns you to the course outline.
          </p>
          <div className="cee-stats" style={{ marginTop: 8 }}>
            <span>
              <strong>{lessonCount}</strong> lesson{lessonCount === 1 ? '' : 's'}
            </span>
            <span aria-hidden>•</span>
            <span>
              <strong>{publishedCount}</strong> published
            </span>
          </div>
        </header>

        <section className="cee-section">
          <label className="cee-label">
            <span className="cee-label__text">
              Title <span style={{ color: '#b91c1c' }}>*</span>
            </span>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder='e.g. "Statics Fundamentals" or "Mechanics of Materials"'
              className="cee-input"
            />
            <span className="cee-hint">Staff-facing course name.</span>
          </label>

          <label className="cee-label">
            <span className="cee-label__text">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional short summary for staff context."
              className="cee-textarea"
            />
            <span className="cee-hint">Used internally only; not shown to students.</span>
          </label>

          {showSlug ? (
            <label className="cee-label">
              <span className="cee-label__text">Slug</span>
              <input
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="auto-generated from title if blank"
                className="cee-input"
              />
              <span className="cee-hint">
                URL segment. Lowercase, hyphens only. Auto-derived from the title when empty.
              </span>
            </label>
          ) : (
            <button
              type="button"
              onClick={() => setShowSlug(true)}
              className="cee-disclosure"
              aria-expanded={false}
            >
              + Advanced: edit slug
            </button>
          )}
        </section>

        {error ? (
          <div className="cee-error" role="alert" aria-live="assertive">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}
