'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createLesson, updateLesson } from './courses-order-api'
import { useBreadcrumbChain } from '../admin/breadcrumbTitle'
import BlockList from './scaffold/BlockList'
import VersionsPanel from './scaffold/VersionsPanel'
import PublishReviewModal from './scaffold/PublishReviewModal'
import OutlinePanel from './scaffold/OutlinePanel'
import InspectorPanel from './scaffold/InspectorPanel'
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
      label: isCreate ? 'New lesson' : (props.initialTitle || 'Edit lesson'),
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
  // Currently-selected block key. Drives which block's settings the right
  // inspector shows; nothing selected → inspector renders its empty state.
  const [selectedBlockKey, setSelectedBlockKey] = useState<string | null>(null)
  // Phase-3 split-preview mode. When true the outline + inspector rails
  // collapse and the canvas shares its space with a docked preview iframe.
  // Only meaningful in edit mode (create mode has no row to preview).
  const [previewMode, setPreviewMode] = useState(false)
  // Viewport simulation for the preview iframe. Each mode renders the
  // iframe at the device's real CSS width (so the lesson page hits its
  // real breakpoints — desktop layout shows the sidebar etc.) and we
  // transform-scale the iframe down to fit the pane.
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'phone'>(
    'desktop',
  )
  const previewFrameRef = useRef<HTMLDivElement | null>(null)
  const [previewPaneSize, setPreviewPaneSize] = useState<{ w: number; h: number }>({
    w: 600,
    h: 800,
  })
  useEffect(() => {
    if (!previewMode) return
    const el = previewFrameRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect
      setPreviewPaneSize({ w: rect.width, h: rect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [previewMode])
  // Auto-deselect if the selected block was removed.
  useEffect(() => {
    if (selectedBlockKey && !blocks.some((b) => b._key === selectedBlockKey)) {
      setSelectedBlockKey(null)
    }
  }, [blocks, selectedBlockKey])
  const selectedBlock = selectedBlockKey
    ? blocks.find((b) => b._key === selectedBlockKey) ?? null
    : null
  const updateSelectedBlock = (next: ScaffoldBlock) => {
    setBlocks((prev) => prev.map((b) => (b._key === next._key ? next : b)))
  }

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

  const statusChipLabel =
    props.mode === 'create'
      ? 'Draft (unsaved)'
      : props.initialStatus === 'published'
        ? 'Published'
        : 'Draft'
  const statusChipClass =
    props.mode === 'create' || props.initialStatus === 'draft' ? 'lse-chip--draft' : 'lse-chip--ok'

  return (
    <div className="lse-shell">
      <style>{`
        /* === Shell + sticky toolbar === */
        .lse-shell {
          display: grid;
          gap: 16px;
        }
        .lse-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          padding: 10px 18px;
          background: var(--admin-surface-elevated, #fcfdff);
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
          box-shadow: var(--admin-shadow-soft);
          margin: 0 -18px 0 -18px;
        }
        .lse-topbar__breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-topbar__breadcrumb a {
          color: var(--cpp-ink, #1b1f24);
          text-decoration: none;
          font-weight: 600;
        }
        .lse-topbar__breadcrumb a:hover { text-decoration: underline; }
        .lse-topbar__current { color: var(--cpp-ink, #1b1f24); font-weight: 600; }
        .lse-chip {
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
        .lse-chip--ok {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          border-color: rgba(16, 185, 129, 0.22);
        }
        .lse-chip--draft {
          background: rgba(100, 116, 139, 0.14);
          color: #475569;
          border-color: rgba(100, 116, 139, 0.22);
        }
        :root[data-theme='dark'] .lse-chip--ok { color: #6ee7b7; }
        :root[data-theme='dark'] .lse-chip--draft { color: #cbd5e1; }
        .lse-topbar__actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lse-topbar__autosave {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
          min-width: 110px;
          text-align: right;
        }
        /* Button hierarchy:
         *   default (secondary) — white surface, visible border
         *   --primary           — solid dark, drives "the" action (Publish)
         *   --ghost             — transparent until hover; for tertiary
         *   --active            — accent-tinted toggle state (e.g. Preview on)
         */
        .lse-btn {
          display: inline-flex;
          align-items: center;
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid var(--admin-surface-border-strong, #c2ccda);
          background: var(--admin-surface, #fff);
          color: var(--cpp-ink, #0f172a);
          cursor: pointer;
          transition: var(--admin-transition);
        }
        .lse-btn:hover {
          background: var(--admin-surface-muted, #f3f6fb);
          border-color: var(--cpp-muted, #475569);
        }
        .lse-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px var(--admin-accent-ring, rgba(59, 130, 246, 0.32));
        }
        .lse-btn:disabled { cursor: not-allowed; opacity: 0.55; }
        .lse-btn--primary {
          background: var(--cpp-ink, #0f172a);
          color: #fff;
          border-color: var(--cpp-ink, #0f172a);
          box-shadow: var(--admin-shadow-soft);
        }
        .lse-btn--primary:hover {
          background: #1e293b;
          border-color: #1e293b;
          box-shadow: var(--admin-shadow);
        }
        :root[data-theme='dark'] .lse-btn--primary {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #e2e8f0;
        }
        :root[data-theme='dark'] .lse-btn--primary:hover {
          background: #ffffff;
          border-color: #ffffff;
        }
        .lse-btn--ghost {
          background: transparent;
          border-color: transparent;
          color: var(--cpp-muted, #475569);
        }
        .lse-btn--ghost:hover {
          background: var(--admin-surface-muted, #f3f6fb);
          border-color: transparent;
          color: var(--cpp-ink, #0f172a);
        }

        /* === Body / 3-column layout === */
        .lse-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 24px;
          padding: 16px 4px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .lse-body { grid-template-columns: 240px minmax(0, 1fr); }
        }
        @media (min-width: 1280px) {
          .lse-body { grid-template-columns: 240px minmax(0, 1fr) 300px; }
        }
        @media (min-width: 1440px) {
          .lse-body { grid-template-columns: 260px minmax(0, 1fr) 340px; }
        }
        /* Split-preview mode collapses outline + inspector and gives the
         * canvas (where authors actually type) the larger share — preview
         * is for verification, not primary work surface. 3fr/2fr ≈ 60/40. */
        .lse-body--preview {
          grid-template-columns: minmax(0, 1fr) !important;
        }
        @media (min-width: 1024px) {
          .lse-body--preview {
            grid-template-columns: minmax(0, 3fr) minmax(0, 2fr) !important;
          }
        }
        .lse-canvas { display: grid; gap: 18px; }

        /* === Active toggle button (e.g. Preview while engaged) === */
        .lse-btn--active,
        .lse-btn--active:hover {
          background: var(--admin-accent-bg, #eef4ff);
          border-color: var(--admin-accent-border, #3b82f6);
          color: var(--admin-accent-text, #1d4ed8);
        }

        /* === Preview pane === */
        .lse-preview-pane {
          display: none;
          position: sticky;
          top: 76px;
          align-self: start;
          max-height: calc(100vh - 96px);
          padding: 12px 12px 16px 12px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 10px;
          box-shadow: var(--admin-shadow-soft);
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: 10px;
        }
        .lse-preview-pane__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
        }
        .lse-preview-pane__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cpp-ink, #0f172a);
        }
        .lse-preview-pane__viewport {
          display: inline-flex;
          padding: 2px;
          background: var(--admin-surface-muted, #f3f6fb);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 7px;
        }
        .lse-preview-pane__viewport-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 22px;
          padding: 0;
          font-size: 12px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: var(--cpp-muted, #475569);
          cursor: pointer;
          transition: var(--admin-transition);
        }
        .lse-preview-pane__viewport-btn:hover {
          color: var(--cpp-ink, #0f172a);
        }
        .lse-preview-pane__viewport-btn[aria-pressed='true'] {
          background: var(--admin-surface, #fff);
          color: var(--cpp-ink, #0f172a);
          box-shadow: var(--admin-shadow-soft);
        }
        /* Quick-close affordance inside the pane head so authors don't
         * have to scroll back to the topbar Preview toggle. */
        .lse-preview-pane__close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          margin-left: 4px;
          padding: 0;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          color: var(--cpp-muted, #475569);
          cursor: pointer;
          transition: var(--admin-transition);
        }
        .lse-preview-pane__close:hover {
          background: var(--admin-surface-muted, #f3f6fb);
          border-color: var(--admin-surface-border, #d7dfea);
          color: var(--cpp-ink, #0f172a);
        }
        .lse-preview-pane__close:focus-visible {
          outline: 2px solid var(--admin-accent-border, #3b82f6);
          outline-offset: 1px;
        }
        /* Frame is the visible window onto a scaled iframe. The iframe is
         * always rendered at its true device width (1280/768/390) so the
         * lesson page hits its real breakpoints; the scaler shrinks it
         * with transform: scale so the author sees the whole layout. */
        .lse-preview-pane__frame {
          position: relative;
          overflow: hidden;
          min-height: 600px;
          height: 100%;
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 8px;
          background: #fff;
        }
        .lse-preview-pane__scaler {
          position: absolute;
          top: 0;
          left: 0;
          transform-origin: top left;
          transition: transform 180ms ease, left 180ms ease;
        }
        .lse-preview-pane__iframe {
          width: 100%;
          height: 100%;
          border: 0;
          background: #fff;
          display: block;
        }
        .lse-preview-pane__empty {
          padding: 24px 12px;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
          text-align: center;
        }

        /* === Outline (left rail) === */
        .lse-outline {
          display: none;
          position: sticky;
          top: 76px; /* clears the sticky topbar */
          align-self: start;
          max-height: calc(100vh - 96px);
          overflow-y: auto;
          padding: 12px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 10px;
          box-shadow: var(--admin-shadow-soft);
        }
        @media (min-width: 1024px) { .lse-outline { display: block; } }
        .lse-outline__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cpp-ink, #0f172a);
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
        }
        .lse-outline__empty {
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
          padding: 8px 6px;
        }
        .lse-outline__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
        .lse-outline__item {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr);
          gap: 8px;
          align-items: start;
          width: 100%;
          padding: 6px 8px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          text-align: left;
          cursor: pointer;
          transition: var(--admin-transition);
        }
        .lse-outline__item:hover {
          background: var(--admin-surface-muted, #f3f6fb);
        }
        .lse-outline__item--selected,
        .lse-outline__item--selected:hover {
          background: var(--admin-accent-bg, #eef4ff);
          border-color: var(--admin-accent-border, #3b82f6);
        }
        .lse-outline__item--selected .lse-outline__item-summary {
          color: var(--admin-accent-text, #1d4ed8);
        }
        .lse-outline__item-index {
          font-size: 10px;
          font-weight: 700;
          color: var(--cpp-muted, #5d6b80);
          line-height: 18px;
        }
        .lse-outline__item-body { display: grid; gap: 1px; min-width: 0; }
        .lse-outline__item-type {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-outline__item-summary {
          font-size: 12px;
          color: var(--cpp-ink, #1b1f24);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :root[data-theme='dark'] .lse-outline__item-summary { color: var(--cpp-ink, #e6e8eb); }

        /* === Inspector (right rail) === */
        .lse-inspector {
          display: none;
          position: sticky;
          top: 76px;
          align-self: start;
          max-height: calc(100vh - 96px);
          overflow-y: auto;
          padding: 14px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 10px;
          box-shadow: var(--admin-shadow-soft);
        }
        @media (min-width: 1280px) { .lse-inspector { display: block; } }
        .lse-inspector__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cpp-ink, #0f172a);
          padding-bottom: 10px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
        }
        .lse-inspector__empty {
          font-size: 12px;
          color: var(--cpp-muted, #475569);
          line-height: 1.5;
        }
        .lse-inspector__empty-hint {
          font-size: 11px;
          color: var(--cpp-subtle, #64748b);
        }
        .lse-inspector__body { display: grid; gap: 14px; }
        .lse-inspector__heading {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lse-inspector__heading-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--admin-block-generic-icon);
          background: var(--admin-surface-muted, #f3f6fb);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 999px;
        }
        /* Mirror the block's identity color onto the inspector badge so
         * the right rail visually echoes which block is selected. */
        .lse-inspector[data-block-type="richTextBlock"] .lse-inspector__heading-badge,
        .lse-inspector[data-block-type="textSection"] .lse-inspector__heading-badge,
        .lse-inspector[data-block-type="sectionTitle"] .lse-inspector__heading-badge {
          color: var(--admin-block-rich-icon);
        }
        .lse-inspector[data-block-type="videoBlock"] .lse-inspector__heading-badge {
          color: var(--admin-block-video-icon);
        }
        .lse-inspector[data-block-type="quizBlock"] .lse-inspector__heading-badge {
          color: var(--admin-block-quiz-icon);
        }
        .lse-inspector__heading-hint {
          font-size: 11px;
          color: var(--cpp-muted, #475569);
          font-weight: 500;
        }
        .lse-canvas__intro {
          display: grid;
          gap: 4px;
        }
        .lse-canvas__intro h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--cpp-ink, #1b1f24);
        }
        .lse-canvas__intro p {
          margin: 0;
          font-size: 13px;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-section {
          display: grid;
          gap: 12px;
          padding: 16px 18px;
          border-radius: 10px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .lse-section {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .lse-label {
          display: grid;
          gap: 4px;
        }
        .lse-label__text {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-input {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--cpp-ink, #1b1f24);
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
        }
        .lse-input:focus {
          outline: 2px solid rgba(14, 165, 233, 0.4);
          outline-offset: 1px;
          border-color: rgba(14, 165, 233, 0.55);
        }
        :root[data-theme='dark'] .lse-input {
          background: var(--admin-surface-muted, #232938);
          border-color: var(--admin-surface-border, #2a3140);
          color: var(--cpp-ink, #e6e8eb);
        }
        .lse-hint {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-error {
          font-size: 12px;
          color: #b91c1c;
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
        }

        /* === Block list + cards === */
        .lse-blocks { display: grid; gap: 6px; }
        .lse-blocks__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
          padding: 0 2px;
        }
        .lse-blocks__empty {
          padding: 28px 16px;
          font-size: 13px;
          color: var(--cpp-muted, #5d6b80);
          background: var(--admin-surface-muted, #f5f7fa);
          border: 1px dashed var(--admin-surface-border, #d6dce5);
          border-radius: 10px;
          text-align: center;
        }
        .lse-blocks__list { display: grid; gap: 0; }
        .lse-block {
          border: 1px solid var(--admin-surface-border, #d7dfea);
          background: var(--admin-surface, #fff);
          border-radius: 10px;
          box-shadow: var(--admin-shadow-soft);
          overflow: hidden;
          transition: var(--admin-transition);
        }
        .lse-block:hover { border-color: var(--admin-surface-border-strong, #c2ccda); }
        .lse-block--dragging { box-shadow: var(--admin-shadow-deep); }
        .lse-block--selected,
        .lse-block--selected:hover {
          border-color: var(--admin-accent-border, #3b82f6);
          box-shadow: 0 0 0 3px var(--admin-accent-ring, rgba(59, 130, 246, 0.32));
        }
        .lse-block__header {
          display: grid;
          grid-template-columns: auto auto auto auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--admin-surface-muted, #f3f6fb);
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
        }
        .lse-block--collapsed .lse-block__header { border-bottom-color: transparent; }

        /* === Block type identity ===
         * Subtle left-edge stripe (via ::before so it survives hover/
         * selected border changes) + icon-color tint on the type badge.
         * The card background stays neutral so block content doesn't
         * compete with the block's own visuals.
         * Mapping:
         *   rich    — richTextBlock, textSection, sectionTitle
         *   video   — videoBlock
         *   quiz    — quizBlock
         *   generic — buttonBlock, listBlock, stepsList, __passthrough
         */
        .lse-block { position: relative; }
        .lse-block[data-block-type]::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--admin-block-generic-edge);
          border-top-left-radius: inherit;
          border-bottom-left-radius: inherit;
          pointer-events: none;
        }
        .lse-block[data-block-type="richTextBlock"]::before,
        .lse-block[data-block-type="textSection"]::before,
        .lse-block[data-block-type="sectionTitle"]::before {
          background: var(--admin-block-rich-edge);
        }
        .lse-block[data-block-type="videoBlock"]::before {
          background: var(--admin-block-video-edge);
        }
        .lse-block[data-block-type="quizBlock"]::before {
          background: var(--admin-block-quiz-edge);
        }
        .lse-block[data-block-type="richTextBlock"] .lse-block__badge,
        .lse-block[data-block-type="textSection"] .lse-block__badge,
        .lse-block[data-block-type="sectionTitle"] .lse-block__badge {
          color: var(--admin-block-rich-icon);
        }
        .lse-block[data-block-type="videoBlock"] .lse-block__badge {
          color: var(--admin-block-video-icon);
        }
        .lse-block[data-block-type="quizBlock"] .lse-block__badge {
          color: var(--admin-block-quiz-icon);
        }
        .lse-block[data-block-type="buttonBlock"] .lse-block__badge,
        .lse-block[data-block-type="listBlock"] .lse-block__badge,
        .lse-block[data-block-type="stepsList"] .lse-block__badge,
        .lse-block[data-block-type="__passthrough"] .lse-block__badge {
          color: var(--admin-block-generic-icon);
        }
        .lse-block__handle,
        .lse-block__chevron {
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
          background: transparent;
          border: 0;
          border-radius: 4px;
          cursor: pointer;
        }
        .lse-block__handle { cursor: grab; }
        .lse-block__handle:active { cursor: grabbing; }
        .lse-block__handle:hover,
        .lse-block__chevron:hover { background: var(--admin-surface, #fff); }
        .lse-block__badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #334155;
          background: rgba(148, 163, 184, 0.18);
          border-radius: 999px;
        }
        :root[data-theme='dark'] .lse-block__badge {
          color: #cbd5e1;
          background: rgba(148, 163, 184, 0.22);
        }
        .lse-block__index {
          font-size: 11px;
          font-weight: 600;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-block__preview {
          background: transparent;
          border: 0;
          padding: 4px 6px;
          border-radius: 4px;
          text-align: left;
          font-size: 13px;
          color: var(--cpp-ink, #1b1f24);
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lse-block__preview:hover { background: var(--admin-surface, #fff); }
        .lse-block__remove {
          background: transparent;
          border: 1px solid transparent;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--cpp-muted, #5d6b80);
          border-radius: 4px;
          cursor: pointer;
        }
        .lse-block__remove:hover {
          color: #b91c1c;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.08);
        }
        .lse-block__body { padding: 14px 16px 16px 16px; }

        /* === Inline insertion point + bottom +Add === */
        .lse-insert {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .lse-insert--closed {
          height: 14px;
          opacity: 0;
          transition: opacity 120ms ease;
        }
        .lse-blocks__list:hover .lse-insert--closed,
        .lse-insert--closed:focus-within { opacity: 1; }
        .lse-insert--open { padding: 6px 0; }
        .lse-insert__trigger {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 4px 0;
          background: transparent;
          border: 0;
          cursor: pointer;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-insert__line {
          height: 1px;
          background: var(--admin-surface-border-strong, #b9c2d0);
        }
        .lse-insert__plus {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 999px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border-strong, #b9c2d0);
        }
        .lse-insert__trigger:hover .lse-insert__plus {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
        .lse-insert--open,
        .lse-end-picker {
          display: grid;
          gap: 4px;
          padding: 8px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
        }
        :root[data-theme='dark'] .lse-insert--open,
        :root[data-theme='dark'] .lse-end-picker {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .lse-insert__option,
        .lse-end-picker__option {
          background: transparent;
          border: 0;
          text-align: left;
          padding: 6px 10px;
          font-size: 13px;
          color: var(--cpp-ink, #1b1f24);
          border-radius: 4px;
          cursor: pointer;
        }
        .lse-insert__option:hover,
        .lse-end-picker__option:hover,
        .lse-insert__option:focus,
        .lse-end-picker__option:focus {
          background: var(--admin-surface-muted, #f5f7fa);
          outline: none;
        }
        :root[data-theme='dark'] .lse-insert__option:hover,
        :root[data-theme='dark'] .lse-end-picker__option:hover,
        :root[data-theme='dark'] .lse-insert__option:focus,
        :root[data-theme='dark'] .lse-end-picker__option:focus {
          background: var(--admin-surface-muted, #232938);
        }
        .lse-insert__option--cancel,
        .lse-end-picker__option--cancel {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-add-block {
          align-self: start;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          color: var(--cpp-ink, #1b1f24);
          background: transparent;
          border: 1px dashed var(--admin-surface-border-strong, #b9c2d0);
          border-radius: 8px;
          cursor: pointer;
        }
        .lse-add-block:hover {
          background: var(--admin-surface-muted, #f5f7fa);
          border-style: solid;
        }
        :root[data-theme='dark'] .lse-add-block { color: var(--cpp-ink, #e6e8eb); }

        /* === Original Lexical editor styles (unchanged) === */
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
      <div className="lse-topbar">
        <div className="lse-topbar__breadcrumb">
          <Link href="/admin/courses">Courses</Link>
          <span aria-hidden>›</span>
          <Link href={`/admin/courses/${props.courseId}`}>{props.courseTitle}</Link>
          <span aria-hidden>›</span>
          <span className="lse-topbar__current">
            {isCreate ? `New lesson · ${props.chapterTitle}` : (props.initialTitle || 'Lesson')}
          </span>
          <span className={`lse-chip ${statusChipClass}`}>{statusChipLabel}</span>
        </div>
        <div className="lse-topbar__actions">
          {!isCreate ? (
            <span className="lse-topbar__autosave">
              <AutoSaveIndicator status={autoSaveStatus} savedAt={autoSaveAt} />
            </span>
          ) : null}
          {!isCreate && (props as EditModeProps).previewUrl ? (
            <button
              type="button"
              onClick={() => setPreviewMode((prev) => !prev)}
              aria-pressed={previewMode}
              className={`lse-btn${previewMode ? ' lse-btn--active' : ''}`}
              title={previewMode ? 'Exit split preview' : 'Show split preview'}
            >
              {previewMode ? '◧ Editor' : '◨ Preview'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleCancel}
            disabled={busy !== null}
            className="lse-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={busy !== null || !title.trim()}
            className="lse-btn"
          >
            {busy === 'draft' ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={handlePublishClick}
            disabled={busy !== null || preparingReview || !title.trim()}
            className="lse-btn lse-btn--primary"
          >
            {busy === 'publish'
              ? 'Publishing…'
              : preparingReview
                ? 'Saving latest…'
                : 'Publish'}
          </button>
        </div>
      </div>

      <div className={`lse-body${previewMode ? ' lse-body--preview' : ''}`}>
        {previewMode ? null : (
          <OutlinePanel
            blocks={blocks}
            selectedKey={selectedBlockKey}
            onSelect={setSelectedBlockKey}
          />
        )}

        <div className="lse-canvas">
          <header className="lse-canvas__intro">
            <h1>{isCreate ? 'New lesson' : (props.initialTitle || 'Edit lesson')}</h1>
            <p>
              {isCreate
                ? 'Nothing is saved until you press Save draft or Publish. Cancel keeps your work staged on the course outline.'
                : 'Auto-saves every couple of seconds as a draft. Use Publish to promote the latest version to students.'}
            </p>
          </header>

          <section className="lse-section">
            <label className="lse-label">
              <span className="lse-label__text">
                Lesson title <span style={{ color: '#b91c1c' }}>*</span>
              </span>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Vector Operations"
                className="lse-input"
              />
              <span className="lse-hint">
                {isCreate
                  ? `Position ${props.initialOrder} in ${props.chapterTitle}.`
                  : `In ${props.chapterTitle}.`}
              </span>
            </label>
          </section>

          <BlockList
            blocks={blocks}
            onChange={setBlocks}
            selectedKey={selectedBlockKey}
            onSelect={setSelectedBlockKey}
          />

          {props.mode === 'edit' ? (
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
          ) : null}

          {error ? (
            <div className="lse-error" role="alert" aria-live="assertive">
              {error}
            </div>
          ) : null}
        </div>

        {previewMode ? (
          <aside className="lse-preview-pane" aria-label="Live preview">
            <div className="lse-preview-pane__head">
              <div className="lse-preview-pane__title">Live preview</div>
              <div
                className="lse-preview-pane__viewport"
                role="group"
                aria-label="Preview viewport size"
              >
                {(
                  [
                    {
                      id: 'desktop',
                      label: 'Desktop',
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <rect x="1.5" y="3" width="13" height="8.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M6 14.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          <path d="M8 11.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      ),
                    },
                    {
                      id: 'tablet',
                      label: 'Tablet',
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <rect x="3.5" y="1.5" width="9" height="13" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
                          <circle cx="8" cy="12.5" r="0.7" fill="currentColor" />
                        </svg>
                      ),
                    },
                    {
                      id: 'phone',
                      label: 'Phone',
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <rect x="5" y="1.5" width="6" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M7 13h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      ),
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="lse-preview-pane__viewport-btn"
                    aria-pressed={previewViewport === option.id}
                    aria-label={`Preview at ${option.label} width`}
                    title={`${option.label} preview`}
                    onClick={() => setPreviewViewport(option.id)}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="lse-preview-pane__close"
                aria-label="Close live preview"
                title="Close preview"
                onClick={() => setPreviewMode(false)}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            {!isCreate && (props as EditModeProps).previewUrl ? (
              (() => {
                // Real device widths trigger the lesson page's real
                // breakpoints inside the iframe (desktop shows sidebar etc.).
                // Transform-scale the iframe down to fit the pane so the
                // author still sees the whole layout.
                const DEVICE_WIDTH = {
                  desktop: 1280,
                  tablet: 768,
                  phone: 390,
                }[previewViewport]
                const padding = 24
                const available = Math.max(0, previewPaneSize.w - padding)
                const rawScale = available > 0 ? available / DEVICE_WIDTH : 1
                const scale = Math.min(1, rawScale)
                const unscaledHeight = scale > 0 ? previewPaneSize.h / scale : previewPaneSize.h
                const offsetX = scale === 1 ? Math.max(0, (available - DEVICE_WIDTH) / 2) : 0
                return (
                  <div className="lse-preview-pane__frame" ref={previewFrameRef}>
                    <div
                      className="lse-preview-pane__scaler"
                      style={{
                        width: `${DEVICE_WIDTH}px`,
                        height: `${unscaledHeight}px`,
                        left: `${offsetX}px`,
                        transform: `scale(${scale})`,
                      }}
                    >
                      <iframe
                        title="Lesson preview"
                        src={`${(props as EditModeProps).previewUrl}${
                          (props as EditModeProps).previewUrl!.includes('?') ? '&' : '?'
                        }_t=${autoSaveAt ?? 0}`}
                        className="lse-preview-pane__iframe"
                      />
                    </div>
                  </div>
                )
              })()
            ) : (
              <div className="lse-preview-pane__empty">
                Live preview becomes available once the lesson is saved at least once.
              </div>
            )}
          </aside>
        ) : (
          <InspectorPanel
            selectedBlock={selectedBlock}
            onChange={updateSelectedBlock}
          />
        )}
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
        lessonId={isCreate ? null : props.lessonId}
        onCancel={() => setReviewOpen(false)}
        onConfirm={async () => {
          await save('publish')
          // save() navigates on success and re-enables on error. Close the
          // modal in both cases — on error the inline alert takes over.
          setReviewOpen(false)
        }}
        // Save Draft from inside the modal: edit-mode only. save('draft')
        // navigates on success (same as the toolbar Save draft button), so
        // the modal unmounts naturally; on error the inline alert takes over.
        onSaveDraft={
          isCreate
            ? undefined
            : async () => {
                await save('draft')
                setReviewOpen(false)
              }
        }
        savingDraft={busy === 'draft'}
      />
    </div>
  )
}
