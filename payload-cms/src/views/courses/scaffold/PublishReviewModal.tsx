'use client'

import React, { useEffect } from 'react'
import { BLOCK_TYPE_LABELS, type ScaffoldBlock } from './types'

type PublishReviewModalProps = {
  open: boolean
  title: string
  blocks: ScaffoldBlock[]
  mode: 'create' | 'edit'
  busy: boolean
  // Optional preview URL — when set, the modal renders an iframe so authors
  // can sanity-check the rendered output. For create mode there's no row yet,
  // so the caller passes null and the modal just shows a summary.
  previewUrl?: string | null
  // Wall-clock timestamp of the last successful auto-save. Used as a
  // cache-buster on the iframe src so an auto-save that lands while the modal
  // is open forces a fresh load (the preview URL points at the persisted
  // version, so without this hint the iframe would keep showing pre-save
  // content).
  previewRefreshKey?: number | null
  onCancel: () => void
  onConfirm: () => void
}

// Confirmation gate between "Publish" click and the actual save. Mirrors the
// "Review changes before publishing" modal already used by Payload's native
// edit views in StaffProvider — same heading, same shape — so the staff-side
// publish ritual stays consistent across our custom and Payload screens.
export default function PublishReviewModal({
  open,
  title,
  blocks,
  mode,
  busy,
  previewUrl,
  previewRefreshKey,
  onCancel,
  onConfirm,
}: PublishReviewModalProps) {
  // Close on Escape. Focus management is intentionally minimal — the modal
  // sits at the top of the DOM via the existing admin-preview-gate styling.
  useEffect(() => {
    if (!open) return
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, busy, onCancel])

  if (!open) return null

  const blockCounts = blocks.reduce<Record<string, number>>((acc, block) => {
    const key = BLOCK_TYPE_LABELS[block.blockType] ?? block.blockType
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const blockSummary = Object.entries(blockCounts)
    .map(([label, count]) => `${count}× ${label}`)
    .join(' · ')

  return (
    <div
      className="admin-preview-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-review-title"
    >
      <div className="admin-preview-panel">
        <header>
          <div>
            <h3 id="publish-review-title">Review changes before publishing</h3>
            <p>Confirm content changes, layout, and links to proceed.</p>
          </div>
          <div className="admin-preview-actions">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="admin-preview-button admin-preview-button--ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="admin-preview-button admin-preview-button--primary"
            >
              {busy ? 'Publishing…' : 'Publish Live'}
            </button>
          </div>
        </header>

        <div style={{ padding: 16, display: 'grid', gap: 16 }}>
          <section
            style={{
              display: 'grid',
              gap: 8,
              padding: 12,
              border: '1px solid var(--admin-surface-border, #d6dce5)',
              borderRadius: 8,
              background: 'var(--admin-surface, #fff)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--cpp-muted, #5d6b80)',
              }}
            >
              Lesson
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--cpp-ink, #1b1f24)' }}>
              {title || '(untitled)'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--cpp-muted, #5d6b80)' }}>
              {blocks.length === 0
                ? 'No content blocks. The lesson will publish empty.'
                : blockSummary}
            </div>
            <div style={{ fontSize: 11, color: 'var(--cpp-muted, #5d6b80)' }}>
              {mode === 'create'
                ? 'Creates the lesson row and publishes it immediately. Students will see it on the public site.'
                : 'Promotes the current draft to live. The previously-published version is replaced.'}
            </div>
          </section>

          {previewUrl ? (
            <iframe
              title="Live preview"
              // Append a cache-buster keyed off the last auto-save. When a
              // background save lands while the modal is open the prop
              // updates, React re-renders the iframe with a new src, and the
              // browser refetches the preview.
              src={
                previewRefreshKey != null
                  ? `${previewUrl}${previewUrl.includes('?') ? '&' : '?'}_t=${previewRefreshKey}`
                  : previewUrl
              }
              style={{
                width: '100%',
                minHeight: 360,
                border: '1px solid var(--admin-surface-border, #d6dce5)',
                borderRadius: 8,
                background: '#fff',
              }}
            />
          ) : mode === 'edit' ? (
            <div style={{ fontSize: 12, color: 'var(--cpp-muted, #5d6b80)' }}>
              Live preview isn't available here. Open the course workspace's Preview tab if you
              want to confirm the rendered output before publishing.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
