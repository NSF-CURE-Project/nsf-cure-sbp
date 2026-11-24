'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BlockList from '../courses/scaffold/BlockList'
import OutlinePanel from '../courses/scaffold/OutlinePanel'
import InspectorPanel from '../courses/scaffold/InspectorPanel'
import PublishReviewModal from '../courses/scaffold/PublishReviewModal'
import ScaffoldStyles from '../courses/scaffold/scaffoldStyles'
import {
  fromPersistedLayout,
  toPersistedLayout,
  type AuthorableBlockTypeSlug,
  type ScaffoldBlock,
} from '../courses/scaffold/types'
import {
  getLastPublishedPageVersion,
  getPageVersion,
  updatePage,
  type EntityId,
} from './pages-api'
import { useBreadcrumbChain } from '../admin/breadcrumbTitle'

type PageStatus = 'draft' | 'published'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type PageScaffoldEditorProps = {
  pageId: EntityId
  initialTitle: string
  initialSlug: string
  initialStatus: PageStatus
  initialLayout: unknown
  // Resolved server-side from WEB_PREVIEW_URL + PREVIEW_SECRET + page slug.
  // When null (missing env, missing slug), the publish-review modal drops the
  // iframe and just shows a summary.
  previewUrl?: string | null
}

const AUTOSAVE_DEBOUNCE_MS = 1500

// Pages may use every block in the picker. Order picks Hero first since it's
// the most common opening block on marketing pages.
const PAGE_ALLOWED_BLOCK_TYPES: AuthorableBlockTypeSlug[] = [
  'heroBlock',
  'sectionTitle',
  'textSection',
  'richTextBlock',
  'videoBlock',
  'listBlock',
  'stepsList',
  'buttonBlock',
  'resourcesList',
  'contactsList',
  'quizBlock',
]

export default function PageScaffoldEditor({
  pageId,
  initialTitle,
  initialSlug,
  initialStatus,
  initialLayout,
  previewUrl = null,
}: PageScaffoldEditorProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialTitle)
  const [slug, setSlug] = useState(initialSlug)
  const [blocks, setBlocks] = useState<ScaffoldBlock[]>(() => fromPersistedLayout(initialLayout))
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [status, setStatus] = useState<PageStatus>(initialStatus)

  const [autosave, setAutosave] = useState<SaveStatus>('idle')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [busyKind, setBusyKind] = useState<'draft' | 'publish' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)

  // Snapshot of the last successfully persisted draft. Compared against the
  // current state to skip no-op autosaves.
  const lastSavedRef = useRef(
    JSON.stringify({
      title: initialTitle,
      slug: initialSlug,
      layout: toPersistedLayout(fromPersistedLayout(initialLayout)),
    }),
  )

  useBreadcrumbChain([
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pages', href: '/admin/pages' },
    { label: initialTitle || 'Page', href: null },
  ])

  const currentSnapshot = useMemo(
    () => JSON.stringify({ title, slug, layout: toPersistedLayout(blocks) }),
    [title, slug, blocks],
  )
  const isDirty = currentSnapshot !== lastSavedRef.current
  const selectedBlock = useMemo(
    () => blocks.find((block) => block._key === selectedKey) ?? null,
    [blocks, selectedKey],
  )

  // Debounced autosave — mirrors LessonScaffoldEditor / ClassroomEditor:
  // skip while a manual save is in flight, skip no-ops, require a non-empty
  // title and slug so Payload's required-field validators don't reject.
  useEffect(() => {
    if (busy) return
    if (!title.trim() || !slug.trim()) return
    if (currentSnapshot === lastSavedRef.current) return
    const handle = window.setTimeout(async () => {
      // Re-check at fire time so we don't race a faster typist.
      const fresh = JSON.stringify({ title, slug, layout: toPersistedLayout(blocks) })
      if (fresh !== currentSnapshot) return
      setAutosave('saving')
      try {
        await updatePage(pageId, {
          title: title.trim(),
          slug: slug.trim(),
          layout: toPersistedLayout(blocks),
          intent: 'autosave',
        })
        lastSavedRef.current = currentSnapshot
        setAutosave('saved')
        setSavedAt(Date.now())
        setError(null)
      } catch (err) {
        setAutosave('error')
        setError(err instanceof Error ? err.message : 'Auto-save failed')
      }
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [pageId, title, slug, blocks, busy, currentSnapshot])

  // Tick the "Saved Xs ago" string without aggressive polling.
  const [, forceTick] = useState(0)
  useEffect(() => {
    if (autosave !== 'saved' || savedAt == null) return
    const handle = window.setInterval(() => forceTick((n) => n + 1), 30_000)
    return () => window.clearInterval(handle)
  }, [autosave, savedAt])

  const handleSaveDraft = async () => {
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required.')
      return
    }
    setBusy(true)
    setBusyKind('draft')
    setError(null)
    try {
      await updatePage(pageId, {
        title: title.trim(),
        slug: slug.trim(),
        layout: toPersistedLayout(blocks),
        intent: 'draft',
      })
      lastSavedRef.current = currentSnapshot
      setAutosave('saved')
      setSavedAt(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
      setBusyKind(null)
    }
  }

  // Direct publish. Reached from the publish-review modal's confirm action —
  // the toolbar's "Publish" / "Republish" opens the modal first so the author
  // sees validation, version meta, and a live preview before committing.
  const handlePublish = async () => {
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required before publishing.')
      return
    }
    setBusy(true)
    setBusyKind('publish')
    setError(null)
    try {
      await updatePage(pageId, {
        title: title.trim(),
        slug: slug.trim(),
        layout: toPersistedLayout(blocks),
        intent: 'publish',
      })
      lastSavedRef.current = currentSnapshot
      setStatus('published')
      setAutosave('saved')
      setSavedAt(Date.now())
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setBusy(false)
      setBusyKind(null)
    }
  }

  const openReview = () => {
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required before publishing.')
      return
    }
    setError(null)
    setReviewOpen(true)
  }

  const saveLabel = useMemo(() => {
    if (autosave === 'saving') return 'Saving…'
    if (autosave === 'error') return 'Auto-save failed'
    if (isDirty) return 'Unsaved changes'
    if (autosave === 'saved' && savedAt != null) {
      const seconds = Math.max(1, Math.round((Date.now() - savedAt) / 1000))
      return `Saved ${seconds < 60 ? `${seconds}s ago` : `${Math.round(seconds / 60)}m ago`}`
    }
    return 'All changes saved'
  }, [autosave, savedAt, isDirty])

  const statusChipLabel = status === 'published' ? 'Published' : 'Draft'
  const statusChipClass = status === 'published' ? 'lse-chip--ok' : 'lse-chip--draft'

  return (
    <div className="lse-shell">
      <ScaffoldStyles />

      <div className="lse-topbar">
        <div className="lse-topbar__breadcrumb">
          <Link href="/admin/pages">Pages</Link>
          <span aria-hidden>›</span>
          <span className="lse-topbar__current">{initialTitle || 'Page'}</span>
          <span className={`lse-chip ${statusChipClass}`}>{statusChipLabel}</span>
        </div>
        <div className="lse-topbar__actions">
          <span className="lse-topbar__autosave" aria-live="polite">
            {saveLabel}
          </span>
          <Link href="/admin/pages" className="lse-btn lse-btn--ghost">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={busy || !title.trim() || !slug.trim()}
            className="lse-btn"
          >
            {busy ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={openReview}
            disabled={busy || !title.trim() || !slug.trim()}
            className="lse-btn lse-btn--primary"
          >
            {status === 'published' ? 'Republish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="lse-body">
        <OutlinePanel
          blocks={blocks}
          selectedKey={selectedKey}
          onSelect={(key) => setSelectedKey(key)}
        />

        <div className="lse-canvas">
          <header className="lse-canvas__intro">
            <h1>{initialTitle || 'Page'}</h1>
            <p>
              Auto-saves a couple of seconds after you stop typing. Publish flips the page to
              production; saving a draft keeps your changes private.
            </p>
          </header>

          <section className="lse-section">
            <label className="lse-label">
              <span className="lse-label__text">
                Title <span style={{ color: '#b91c1c' }}>*</span>
              </span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Page title"
                className="lse-input"
              />
            </label>
            <label className="lse-label">
              <span className="lse-label__text">
                URL slug <span style={{ color: '#b91c1c' }}>*</span>
              </span>
              <input
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="page-slug"
                className="lse-input"
              />
              <span className="lse-hint">
                Lowercase, hyphen-separated. Use <code>home</code> for the site root.
              </span>
            </label>
          </section>

          <BlockList
            blocks={blocks}
            onChange={setBlocks}
            selectedKey={selectedKey}
            onSelect={(key) => setSelectedKey(key)}
            allowedBlockTypes={PAGE_ALLOWED_BLOCK_TYPES}
          />

          {error ? (
            <div className="lse-error" role="alert" aria-live="assertive">
              {error}
            </div>
          ) : null}
        </div>

        <InspectorPanel
          selectedBlock={selectedBlock}
          onChange={(next) =>
            setBlocks((prev) => prev.map((block) => (block._key === next._key ? next : block)))
          }
        />
      </div>

      <PublishReviewModal
        open={reviewOpen}
        title={title}
        blocks={blocks}
        mode="edit"
        busy={busyKind === 'publish'}
        previewUrl={previewUrl}
        // savedAt doubles as the iframe cache-buster — background autosaves
        // bump it and the modal's iframe reloads with the fresh draft.
        previewRefreshKey={savedAt}
        entityId={pageId}
        entity={{ label: 'page', capitalLabel: 'Page' }}
        fetchLastPublishedVersion={getLastPublishedPageVersion}
        fetchVersionSnapshot={getPageVersion}
        // Pages don't ship quizzes the way lessons do — skip the "no quiz
        // attached" recommendation that would otherwise show as a warning.
        showQuizCoverageCheck={false}
        onCancel={() => setReviewOpen(false)}
        onConfirm={async () => {
          await handlePublish()
          setReviewOpen(false)
        }}
        onSaveDraft={async () => {
          await handleSaveDraft()
          setReviewOpen(false)
        }}
        savingDraft={busyKind === 'draft'}
      />
    </div>
  )
}
