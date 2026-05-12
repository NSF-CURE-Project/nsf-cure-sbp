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
  // Currently-selected block key. Drives which block's settings the right
  // inspector shows; nothing selected → inspector renders its empty state.
  const [selectedBlockKey, setSelectedBlockKey] = useState<string | null>(null)
  // Phase-3 split-preview mode. When true the outline + inspector rails
  // collapse and the canvas shares its space with a docked preview iframe.
  // Only meaningful in edit mode (create mode has no row to preview).
  const [previewMode, setPreviewMode] = useState(false)
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
          background: var(--admin-surface, #fff);
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
          margin: 0 -18px 0 -18px;
        }
        :root[data-theme='dark'] .lse-topbar {
          background: var(--admin-surface, #161a23);
          border-color: var(--admin-surface-border, #2a3140);
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
        .lse-btn {
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
          transition: background 120ms ease, border-color 120ms ease;
        }
        .lse-btn:hover { background: var(--admin-surface-muted, #f5f7fa); }
        .lse-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .lse-btn--primary {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
        .lse-btn--primary:hover { background: #1e293b; }
        :root[data-theme='dark'] .lse-btn {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
          color: var(--cpp-ink, #e6e8eb);
        }
        :root[data-theme='dark'] .lse-btn:hover { background: var(--admin-surface-muted, #232938); }
        :root[data-theme='dark'] .lse-btn--primary {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #e2e8f0;
        }
        :root[data-theme='dark'] .lse-btn--primary:hover { background: #cbd5e1; }

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
        /* Split-preview mode collapses outline + inspector and shares the
         * available width between the canvas and the preview iframe. */
        .lse-body--preview {
          grid-template-columns: minmax(0, 1fr) !important;
        }
        @media (min-width: 1024px) {
          .lse-body--preview {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
        }
        .lse-canvas { display: grid; gap: 18px; }

        /* === Active toggle button (e.g. Preview while engaged) === */
        .lse-btn--active {
          background: rgba(14, 165, 233, 0.12);
          border-color: rgba(14, 165, 233, 0.45);
          color: #0369a1;
        }
        :root[data-theme='dark'] .lse-btn--active {
          background: rgba(56, 189, 248, 0.18);
          border-color: rgba(56, 189, 248, 0.5);
          color: #7dd3fc;
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
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 10px;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: 10px;
        }
        :root[data-theme='dark'] .lse-preview-pane {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .lse-preview-pane__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-preview-pane__iframe {
          width: 100%;
          height: 100%;
          min-height: 600px;
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
          background: #fff;
        }
        :root[data-theme='dark'] .lse-preview-pane__iframe {
          border-color: var(--admin-surface-border, #2a3140);
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
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 10px;
        }
        @media (min-width: 1024px) { .lse-outline { display: block; } }
        :root[data-theme='dark'] .lse-outline {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .lse-outline__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
          margin-bottom: 8px;
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
          transition: background 120ms ease, border-color 120ms ease;
        }
        .lse-outline__item:hover {
          background: var(--admin-surface-muted, #f5f7fa);
        }
        :root[data-theme='dark'] .lse-outline__item:hover {
          background: var(--admin-surface-muted, #232938);
        }
        .lse-outline__item--selected {
          background: rgba(14, 165, 233, 0.08);
          border-color: rgba(14, 165, 233, 0.35);
        }
        :root[data-theme='dark'] .lse-outline__item--selected {
          background: rgba(56, 189, 248, 0.16);
          border-color: rgba(56, 189, 248, 0.45);
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
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 10px;
        }
        @media (min-width: 1280px) { .lse-inspector { display: block; } }
        :root[data-theme='dark'] .lse-inspector {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .lse-inspector__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
          margin-bottom: 10px;
        }
        .lse-inspector__empty {
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
          line-height: 1.5;
        }
        .lse-inspector__empty-hint {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
          opacity: 0.85;
        }
        .lse-inspector__body { display: grid; gap: 12px; }
        .lse-inspector__heading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .lse-inspector__heading {
          border-bottom-color: var(--admin-surface-border, #2a3140);
        }
        .lse-inspector__heading-badge {
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
        :root[data-theme='dark'] .lse-inspector__heading-badge { color: #cbd5e1; background: rgba(148, 163, 184, 0.22); }
        .lse-inspector__heading-hint {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
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
          border: 1px solid var(--admin-surface-border, #d6dce5);
          background: var(--admin-surface, #fff);
          border-radius: 10px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          overflow: hidden;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .lse-block:hover { border-color: var(--admin-surface-border-strong, #b9c2d0); }
        .lse-block--dragging { box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12); }
        .lse-block--selected {
          border-color: rgba(14, 165, 233, 0.55);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
        }
        :root[data-theme='dark'] .lse-block--selected {
          border-color: rgba(56, 189, 248, 0.6);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
        }
        :root[data-theme='dark'] .lse-block {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        .lse-block__header {
          display: grid;
          grid-template-columns: auto auto auto auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--admin-surface-muted, #f5f7fa);
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
        }
        .lse-block--collapsed .lse-block__header { border-bottom-color: transparent; }
        :root[data-theme='dark'] .lse-block__header {
          background: var(--admin-surface-muted, #232938);
          border-color: var(--admin-surface-border, #2a3140);
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
            <div className="lse-preview-pane__title">Live preview</div>
            {!isCreate && (props as EditModeProps).previewUrl ? (
              <iframe
                title="Lesson preview"
                src={`${(props as EditModeProps).previewUrl}${
                  (props as EditModeProps).previewUrl!.includes('?') ? '&' : '?'
                }_t=${autoSaveAt ?? 0}`}
                className="lse-preview-pane__iframe"
              />
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
