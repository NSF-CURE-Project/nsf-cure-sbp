'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createLesson, updateLesson } from './courses-order-api'
import { useBreadcrumbChain } from '../admin/breadcrumbTitle'
import BlockList from './scaffold/BlockList'
import VersionsPanel from './scaffold/VersionsPanel'
import PublishReviewModal from './scaffold/PublishReviewModal'
import { fromPersistedLayout, type ScaffoldBlock, toPersistedLayout } from './scaffold/types'

type CreateModeProps = {
  mode: 'create'
  courseId: string
  courseTitle: string
  chapterId: string
  chapterTitle: string
  initialTitle: string
  initialOrder: number
  stagedId: string | null
}

type EditModeProps = {
  mode: 'edit'
  courseId: string
  courseTitle: string
  chapterId: string
  chapterTitle: string
  lessonId: string
  initialTitle: string
  initialBlocks: ScaffoldBlock[]
  initialStatus: 'draft' | 'published'
  // Resolved server-side from WEB_PREVIEW_URL + PREVIEW_SECRET + lesson slug.
  // When null (missing env, missing slug), the publish-review modal drops the
  // iframe and just shows a summary.
  previewUrl?: string | null
}

export type LessonScaffoldEditorProps = CreateModeProps | EditModeProps

type SaveIntent = 'draft' | 'publish'

// Custom lesson editor used both for creating new lessons (Stage 0–2) and for
// editing existing ones (Stage 3). The create path defers the DB write until
// Save/Publish; the edit path PATCHes an existing row. Both share the same
// block-list UI and the same Lexical-based rich-text editor — only the save
// transport and the surrounding breadcrumb copy change.
// Build the sessionStorage key for the in-progress draft. Create-mode uses
// the stagedId (or the chapter id as a fallback) so two parallel new-lesson
// sessions in different chapters don't collide. Edit-mode uses the lesson id.
const draftKey = (props: LessonScaffoldEditorProps) =>
  props.mode === 'create'
    ? `lesson-draft:create:${props.courseId}:${props.stagedId ?? `chapter-${props.chapterId}`}`
    : `lesson-draft:edit:${props.lessonId}`

type DraftSnapshot = { title: string; blocks: ScaffoldBlock[] }

// Small "Saving… / Saved 12s ago / Save failed" status text shown next to
// Cancel in edit mode. Re-renders on a 30s tick so the relative time stays
// accurate without polling more aggressively.
function AutoSaveIndicator({
  status,
  savedAt,
}: {
  status: 'idle' | 'saving' | 'saved' | 'error'
  savedAt: number | null
}) {
  const [, force] = useState(0)
  useEffect(() => {
    if (status !== 'saved' || savedAt == null) return
    const handle = window.setInterval(() => force((n) => n + 1), 30_000)
    return () => window.clearInterval(handle)
  }, [status, savedAt])

  if (status === 'idle' && savedAt == null) return null
  if (status === 'saving') {
    return <span className="text-xs text-[var(--cpp-muted)]">Auto-saving…</span>
  }
  if (status === 'error') {
    return <span className="text-xs text-red-700">Auto-save failed</span>
  }
  if (status === 'saved' && savedAt != null) {
    const seconds = Math.max(1, Math.round((Date.now() - savedAt) / 1000))
    const label =
      seconds < 60 ? `${seconds}s ago` : `${Math.round(seconds / 60)}m ago`
    return <span className="text-xs text-[var(--cpp-muted)]">Saved {label}</span>
  }
  return null
}

// Load a prior draft snapshot if one exists. Returning `{ title: undefined,
// blocks: undefined }` signals "no draft, use server-supplied defaults".
function readDraft(key: string): { title?: string; blocks?: ScaffoldBlock[] } {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<DraftSnapshot>
    return {
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : undefined,
    }
  } catch {
    return {}
  }
}

export default function LessonScaffoldEditor(props: LessonScaffoldEditorProps) {
  const router = useRouter()
  const isCreate = props.mode === 'create'

  // Initial render must match the server's HTML exactly, so we only seed
  // state from the server-supplied props here. sessionStorage drafts get
  // applied in a post-hydration effect below — that flicker is acceptable
  // and avoids a "hydration text didn't match" warning when a draft existed.
  const storageKey = draftKey(props)
  const [title, setTitle] = useState(props.initialTitle)
  const [blocks, setBlocks] = useState<ScaffoldBlock[]>(
    props.mode === 'create' ? [] : props.initialBlocks,
  )
  const [busy, setBusy] = useState<SaveIntent | null>(null)
  const [error, setError] = useState<string | null>(null)

  // After mount, restore any in-progress draft from sessionStorage. Two flags
  // coordinate with the persist effect below: `hydratedRef` flips true once
  // the restore attempt has run, and `skipNextPersistRef` swallows the very
  // next persist tick so we don't immediately overwrite the restored draft
  // with the still-stale state from before setState propagated.
  const hydratedRef = useRef(false)
  const skipNextPersistRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    const draft = readDraft(storageKey)
    if (draft.title !== undefined || draft.blocks !== undefined) {
      skipNextPersistRef.current = true
      if (draft.title !== undefined) setTitle(draft.title)
      if (draft.blocks !== undefined) setBlocks(draft.blocks)
    }
  }, [storageKey])

  // Persist (title + blocks) on every change. sessionStorage writes are
  // synchronous + cheap; no debounce needed. Skipped until hydration restore
  // has run so we don't trample a draft with the server-supplied seed.
  useEffect(() => {
    if (!hydratedRef.current) return
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return
    }
    if (typeof window === 'undefined') return
    try {
      const snapshot: DraftSnapshot = { title, blocks }
      window.sessionStorage.setItem(storageKey, JSON.stringify(snapshot))
    } catch {
      // sessionStorage may be unavailable (private mode, quota exceeded);
      // dropping the draft is the right failure mode.
    }
  }, [title, blocks, storageKey])

  const clearDraft = () => {
    skipNextPersistRef.current = true
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.removeItem(storageKey)
    } catch {
      /* ignore */
    }
  }

  // Explicit 4-segment chain: the generic URL parser would surface record-id
  // segments as "Details" placeholders; this slots the actual course name in.
  useBreadcrumbChain([
    { label: 'Dashboard', href: '/admin' },
    { label: 'Manage Courses', href: '/admin/courses' },
    { label: props.courseTitle, href: `/admin/courses/${props.courseId}` },
    {
      label: isCreate ? 'New lesson' : 'Edit lesson',
      href: null,
    },
  ])

  const clearStaged = () => {
    if (!isCreate) return
    if (typeof window === 'undefined' || !props.stagedId) return
    try {
      const key = `staged-lessons:${props.courseId}`
      const raw = window.sessionStorage.getItem(key)
      if (!raw) return
      const list = JSON.parse(raw) as Array<{ id: string }>
      const next = list.filter((entry) => entry.id !== props.stagedId)
      if (next.length === 0) window.sessionStorage.removeItem(key)
      else window.sessionStorage.setItem(key, JSON.stringify(next))
    } catch {
      // sessionStorage corruption shouldn't block save
    }
  }

  const validate = (intent: SaveIntent): string | null => {
    if (!title.trim()) return 'Title is required.'
    for (const [i, block] of blocks.entries()) {
      if (block.blockType === 'sectionTitle' && !block.title.trim()) {
        return `Block ${i + 1} (section title) needs a title.`
      }
      if (block.blockType === 'buttonBlock') {
        if (!block.label.trim()) return `Block ${i + 1} (button) needs a label.`
        if (!block.href.trim()) return `Block ${i + 1} (button) needs a link.`
      }
      if (block.blockType === 'stepsList') {
        const steps = block.steps ?? []
        for (const [si, step] of steps.entries()) {
          if (!step.heading.trim()) {
            return `Block ${i + 1} (steps) step ${si + 1} needs a heading.`
          }
        }
      }
      if (block.blockType === 'richTextBlock' && !block.body) {
        return `Block ${i + 1} (rich text) needs content.`
      }
      if (block.blockType === 'quizBlock' && block.quiz == null) {
        return `Block ${i + 1} (quiz) needs a quiz selected.`
      }
      if (block.blockType === 'problemSetBlock' && block.problemSet == null) {
        return `Block ${i + 1} (problem set) needs a problem set selected.`
      }
    }
    if (intent === 'publish' && blocks.length === 0) {
      return 'Add at least one block before publishing.'
    }
    return null
  }

  // Tracks the last successfully-saved snapshot string. Auto-save compares
  // against this to skip no-op saves between debounce ticks. Updated by both
  // explicit saves and auto-saves so they share the same "what's on the
  // server" reference point.
  const lastSavedSnapshotRef = useRef<string>(
    JSON.stringify({ title: props.initialTitle, blocks: isCreate ? [] : props.initialBlocks }),
  )
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  )
  const [autoSaveAt, setAutoSaveAt] = useState<number | null>(null)
  // Publish gate: click "Publish" opens a review modal first; the actual
  // save fires only after the user confirms.
  const [reviewOpen, setReviewOpen] = useState(false)

  const save = async (intent: SaveIntent) => {
    const message = validate(intent)
    if (message) {
      setError(message)
      return
    }
    setBusy(intent)
    setError(null)
    try {
      const layout = toPersistedLayout(blocks)

      if (isCreate) {
        await createLesson(props.chapterId, title.trim(), props.initialOrder, {
          layout,
          status: intent === 'publish' ? 'published' : 'draft',
        })
        clearStaged()
      } else {
        await updateLesson(props.lessonId, {
          title: title.trim(),
          layout,
          intent: intent === 'publish' ? 'publish' : 'draft',
        })
      }
      clearDraft()
      router.push(`/admin/courses/${props.courseId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save lesson.')
      setBusy(null)
    }
  }

  // Background auto-save: edit mode only. The debounce timer is reset on
  // every keystroke; auto-save fires after `AUTOSAVE_DEBOUNCE_MS` of idle.
  // It's deliberately silent on validation failures (incomplete blocks etc.)
  // — the explicit Save Draft button surfaces those.
  const AUTOSAVE_DEBOUNCE_MS = 2000
  useEffect(() => {
    if (props.mode !== 'edit') return
    if (busy !== null) return
    if (!title.trim()) return
    const snapshot = JSON.stringify({ title, blocks: toPersistedLayout(blocks) })
    if (snapshot === lastSavedSnapshotRef.current) return
    const handle = window.setTimeout(async () => {
      // Re-check the snapshot at fire time in case the user's still typing
      // (we'd race ourselves into stale data otherwise).
      const fresh = JSON.stringify({ title, blocks: toPersistedLayout(blocks) })
      if (fresh !== snapshot) return
      if (validate('draft') !== null) return // silent skip if invalid
      setAutoSaveStatus('saving')
      try {
        await updateLesson(props.lessonId, {
          title: title.trim(),
          layout: toPersistedLayout(blocks),
          intent: 'autosave',
        })
        lastSavedSnapshotRef.current = snapshot
        setAutoSaveStatus('saved')
        setAutoSaveAt(Date.now())
      } catch {
        setAutoSaveStatus('error')
      }
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
    // `props` includes lessonId; including the whole object would re-arm the
    // timer needlessly on rerenders. List the pieces we actually depend on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode, title, blocks, busy])

  // Publish goes through a confirmation modal. Pre-validate here so invalid
  // states surface inline instead of inside the modal — opening the modal
  // implies "ready to publish". In edit mode, flush any unsaved edits as a
  // draft first so the modal's preview iframe shows the current state rather
  // than the last debounced snapshot (which could be up to AUTOSAVE_DEBOUNCE_MS
  // stale).
  const [preparingReview, setPreparingReview] = useState(false)
  const handlePublishClick = async () => {
    const message = validate('publish')
    if (message) {
      setError(message)
      return
    }
    setError(null)

    if (props.mode === 'edit') {
      const layout = toPersistedLayout(blocks)
      const snapshot = JSON.stringify({ title, blocks: layout })
      if (snapshot !== lastSavedSnapshotRef.current) {
        setPreparingReview(true)
        setAutoSaveStatus('saving')
        try {
          await updateLesson(props.lessonId, {
            title: title.trim(),
            layout,
            intent: 'autosave',
          })
          lastSavedSnapshotRef.current = snapshot
          setAutoSaveStatus('saved')
          setAutoSaveAt(Date.now())
        } catch (err) {
          setAutoSaveStatus('error')
          setError(
            err instanceof Error
              ? `Could not save latest edits before review: ${err.message}`
              : 'Could not save latest edits before review.',
          )
          setPreparingReview(false)
          return
        }
        setPreparingReview(false)
      }
    }

    setReviewOpen(true)
  }

  const handleCancel = () => {
    // Discard the in-progress editor draft (so a future entry starts fresh).
    // Create-mode still keeps the bare staged title in the outline's own
    // sessionStorage entry — that's a different key, handled by the outline.
    clearDraft()
    router.push(`/admin/courses/${props.courseId}`)
  }

  return (
    <div className="grid gap-5">
      <style>{`
        .cw-rt {
          display: grid;
          grid-template-rows: auto 1fr;
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
          background: var(--admin-surface, #fff);
        }
        .cw-rt__toolbar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 6px;
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
          background: var(--admin-surface-muted, #f5f7fa);
          border-radius: 8px 8px 0 0;
        }
        .cw-rt__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          font-size: 13px;
          color: var(--cpp-ink, #1b1f24);
          background: transparent;
          border: 0;
          border-radius: 4px;
          cursor: pointer;
        }
        .cw-rt__btn:hover { background: var(--admin-surface, #fff); }
        .cw-rt__sep {
          width: 1px;
          height: 18px;
          margin: 0 4px;
          background: var(--admin-surface-border, #d6dce5);
        }
        .cw-rt__surface { position: relative; }
        .cw-rt__editable {
          padding: 8px 12px;
          min-height: 80px;
          font-size: 14px;
          line-height: 1.55;
          color: var(--cpp-ink, #1b1f24);
          outline: none;
        }
        .cw-rt__placeholder {
          position: absolute;
          top: 8px;
          left: 12px;
          font-size: 14px;
          color: var(--cpp-muted, #5d6b80);
          pointer-events: none;
          user-select: none;
        }
        .cw-rt__paragraph { margin: 0 0 6px; }
        .cw-rt__paragraph:last-child { margin-bottom: 0; }
        .cw-rt__h1 { font-size: 20px; font-weight: 700; margin: 8px 0; }
        .cw-rt__h2 { font-size: 17px; font-weight: 700; margin: 8px 0; }
        .cw-rt__h3 { font-size: 15px; font-weight: 700; margin: 6px 0; }
        .cw-rt__ul, .cw-rt__ol { margin: 4px 0 4px 20px; padding: 0; }
        .cw-rt__li { margin: 2px 0; }
        .cw-rt__bold { font-weight: 700; }
        .cw-rt__italic { font-style: italic; }
        .cw-rt__underline { text-decoration: underline; }
        .cw-rt__link {
          color: var(--cw-accent, #0d6efd);
          text-decoration: underline;
        }
      `}</style>
      <header className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--cpp-muted)]">
          <Link
            href="/admin/courses"
            className="font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
          >
            Courses
          </Link>
          <span aria-hidden>›</span>
          <Link
            href={`/admin/courses/${props.courseId}`}
            className="font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
          >
            {props.courseTitle}
          </Link>
          <span aria-hidden>›</span>
          <span>
            {isCreate
              ? `New lesson · ${props.chapterTitle}`
              : `Edit · ${props.initialTitle || 'Lesson'}`}
          </span>
        </div>
        <h1 className="m-0 text-2xl font-semibold text-[var(--cpp-ink)]">
          {isCreate ? 'New lesson' : 'Edit lesson'}
        </h1>
        <p className="text-sm text-[var(--cpp-muted)]">
          {isCreate
            ? 'Nothing is saved until you press Save draft or Publish. Cancel keeps your work staged on the course outline.'
            : 'Changes apply when you press Save draft or Publish. Cancel discards unsaved edits.'}
        </p>
      </header>

      <section className="grid max-w-3xl gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
            Lesson title <span className="text-red-600">*</span>
          </span>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Vector Operations"
            className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          {isCreate ? (
            <span className="text-xs text-[var(--cpp-muted)]">
              Position {props.initialOrder} in {props.chapterTitle}.
            </span>
          ) : (
            <span className="text-xs text-[var(--cpp-muted)]">
              Currently {props.initialStatus === 'published' ? 'published' : 'draft'} in{' '}
              {props.chapterTitle}.
            </span>
          )}
        </label>
      </section>

      <div className="max-w-3xl">
        <BlockList blocks={blocks} onChange={setBlocks} />
      </div>

      {props.mode === 'edit' ? (
        <div className="max-w-3xl">
          <VersionsPanel
            lessonId={props.lessonId}
            onRestore={(snapshot) => {
              setTitle(snapshot.title)
              setBlocks(fromPersistedLayout(snapshot.layout))
              // Resetting the saved-snapshot ref ensures the very next
              // change triggers an auto-save — the restored state hasn't
              // been committed yet, only loaded into the editor.
              lastSavedSnapshotRef.current = ''
              setError(null)
            }}
          />
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          aria-live="assertive"
          className="max-w-3xl text-xs text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="flex max-w-3xl flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-surface-border)] pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={busy !== null}
            className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          {!isCreate ? (
            <AutoSaveIndicator status={autoSaveStatus} savedAt={autoSaveAt} />
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={busy !== null || !title.trim()}
            className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === 'draft' ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={handlePublishClick}
            disabled={busy !== null || preparingReview || !title.trim()}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === 'publish'
              ? 'Publishing…'
              : preparingReview
                ? 'Saving latest…'
                : 'Publish'}
          </button>
        </div>
      </div>

      <PublishReviewModal
        open={reviewOpen}
        title={title}
        blocks={blocks}
        mode={isCreate ? 'create' : 'edit'}
        busy={busy === 'publish'}
        // Iframes the lesson's preview URL in edit mode (the route exists);
        // create-mode has no row yet, so the modal shows the summary only.
        previewUrl={isCreate ? null : (props.previewUrl ?? null)}
        // Auto-save timestamp doubles as the iframe cache-buster — whenever a
        // background save lands while the modal is open, the iframe reloads
        // and shows the up-to-date preview.
        previewRefreshKey={autoSaveAt}
        onCancel={() => setReviewOpen(false)}
        onConfirm={async () => {
          await save('publish')
          // save() navigates on success and re-enables on error. Close the
          // modal in both cases — on error the inline alert takes over.
          setReviewOpen(false)
        }}
      />
    </div>
  )
}
