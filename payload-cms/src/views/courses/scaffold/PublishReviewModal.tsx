'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { BLOCK_TYPE_LABELS, toPersistedLayout, type ScaffoldBlock } from './types'
import { describeChange, diffLessonLayouts, type LessonDiff } from './lessonDiff'

// Generic entity descriptor — the modal is shared by lessons and pages, so
// callers tell it what to call the thing being published. Lower-case noun
// only ("lesson", "page"); the modal handles capitalization where needed.
export type PublishReviewEntity = {
  label: string
  // Singular noun used in inline copy ("Promotes the current draft to live"
  // already reads correctly without this, but error/empty states use it).
  // e.g. label='lesson' → "Lesson is missing a title".
  capitalLabel: string
}

type VersionMeta = {
  versionId: string
  updatedAt: string | null
  publishedCount: number
}

type PublishReviewModalProps = {
  open: boolean
  title: string
  blocks: ScaffoldBlock[]
  mode: 'create' | 'edit'
  busy: boolean
  previewUrl?: string | null
  previewRefreshKey?: number | null
  // Entity id (edit mode only). Drives the "last published" fetch via the
  // injected fetchers below.
  entityId?: string | null
  entity?: PublishReviewEntity
  // Optional: lets the modal show "Publishing version N" + a content diff.
  // Lessons and pages pass their own version-fetching helpers; if either is
  // omitted, the modal renders without a version meta line / diff section.
  fetchLastPublishedVersion?: (entityId: string) => Promise<VersionMeta | null>
  fetchVersionSnapshot?: (
    versionId: string,
  ) => Promise<{ title: string; layout: unknown } | null>
  // Pass `false` to skip the "Has a quiz attached" recommendation (relevant
  // for lessons; not meaningful for marketing pages).
  showQuizCoverageCheck?: boolean
  onCancel: () => void
  onConfirm: () => void
  // Optional tertiary action: persist as draft without publishing. The
  // editor toolbar already owns saving, but mirroring inside the modal
  // lets an author bail out of a publish flow with a soft save instead of
  // discarding their review state. Edit mode only; the editor wires this
  // up only when there's a real row to save against.
  onSaveDraft?: () => void
  savingDraft?: boolean
}

const DEFAULT_ENTITY: PublishReviewEntity = {
  label: 'lesson',
  capitalLabel: 'Lesson',
}

type ValidationCheck = {
  id: string
  label: string
  status: 'ok' | 'warn' | 'error'
  detail?: string
}

// Walk the current state and emit a list of pre-publish checks. Anything
// `error` blocks publishing; `warn` lets it through but surfaces in the modal.
function runChecks(
  title: string,
  blocks: ScaffoldBlock[],
  entity: PublishReviewEntity,
  showQuizCoverageCheck: boolean,
): ValidationCheck[] {
  const checks: ValidationCheck[] = []
  const hasTitle = title.trim().length > 0
  checks.push({
    id: 'title',
    label: hasTitle
      ? `${entity.capitalLabel} has a title`
      : `${entity.capitalLabel} is missing a title`,
    status: hasTitle ? 'ok' : 'error',
  })
  checks.push({
    id: 'content',
    label: blocks.length > 0 ? `${blocks.length} content block${blocks.length === 1 ? '' : 's'}` : 'No content blocks',
    status: blocks.length > 0 ? 'ok' : 'error',
  })

  // Per-block content checks. We only flag blocks that the author can fix.
  const blockProblems: string[] = []
  for (const [i, block] of blocks.entries()) {
    const pos = `Block #${i + 1} (${BLOCK_TYPE_LABELS[block.blockType]})`
    if (block.blockType === 'sectionTitle' && !block.title.trim()) {
      blockProblems.push(`${pos} needs a title`)
    }
    if (block.blockType === 'buttonBlock') {
      if (!block.label.trim()) blockProblems.push(`${pos} needs a label`)
      if (!block.href.trim()) blockProblems.push(`${pos} needs a link`)
    }
    if (block.blockType === 'richTextBlock' && !block.body) {
      blockProblems.push(`${pos} is empty`)
    }
    if (block.blockType === 'videoBlock' && !block.url && block.video == null) {
      blockProblems.push(`${pos} has no video source`)
    }
    if (block.blockType === 'quizBlock' && block.quiz == null) {
      blockProblems.push(`${pos} has no quiz attached`)
    }
    if (block.blockType === 'stepsList') {
      const steps = block.steps ?? []
      for (const [si, step] of steps.entries()) {
        if (!step.heading.trim()) blockProblems.push(`${pos} step ${si + 1} needs a heading`)
      }
    }
  }
  if (blockProblems.length > 0) {
    checks.push({
      id: 'block-content',
      label: `${blockProblems.length} block issue${blockProblems.length === 1 ? '' : 's'}`,
      status: 'error',
      detail: blockProblems.join(' · '),
    })
  } else if (blocks.length > 0) {
    checks.push({
      id: 'block-content',
      label: 'All blocks have required content',
      status: 'ok',
    })
  }

  // Quiz coverage is a recommendation, not a blocker. Lessons surface this;
  // pages don't (a marketing page without a quiz is the norm).
  if (showQuizCoverageCheck) {
    const hasQuiz = blocks.some(
      (b) => b.blockType === 'quizBlock' && b.quiz != null,
    )
    checks.push({
      id: 'quiz',
      label: hasQuiz ? 'Has a quiz attached' : 'No quiz attached',
      status: hasQuiz ? 'ok' : 'warn',
      detail: hasQuiz
        ? undefined
        : 'Lessons without a quiz can still publish, but students get no comprehension check.',
    })
  }

  return checks
}

// Estimate read time at ~180 wpm (slightly slower than the typical 200 wpm
// figure to reflect technical content with formulas and diagrams).
// Non-prose blocks contribute a flat "interaction budget" in words so the
// estimate doesn't undercount videos and quizzes:
//   * Video block:   720 words ≈ 4 min — most embedded videos run 3–6 min,
//                    and the author rarely captions them with enough text
//                    to register otherwise.
//   * Quiz block:    360 words ≈ 2 min — reading questions + thinking +
//                    answering; the old 60-word constant was 18 s, which
//                    was a clear undercount even for 1-question quizzes.
//   * Steps list:    45 words per step ≈ 15 s of "think between steps"
//                    on top of the step's own heading + body word count.
// These are intentionally conservative — better to slightly overshoot than
// undersell a lesson's actual time-on-page.
const WORDS_PER_MINUTE = 180
const VIDEO_BUDGET_WORDS = 720
const QUIZ_BUDGET_WORDS = 360
const STEP_BUDGET_WORDS = 45

function estimateMinutes(title: string, blocks: ScaffoldBlock[]): number {
  let words = title.trim().split(/\s+/).filter(Boolean).length
  const countString = (s: unknown) => {
    if (typeof s !== 'string') return 0
    return s.trim().split(/\s+/).filter(Boolean).length
  }
  const countRich = (rich: unknown) => {
    if (!rich || typeof rich !== 'object') return 0
    let total = 0
    const visit = (node: unknown) => {
      if (!node || typeof node !== 'object') return
      const n = node as { text?: string; children?: unknown[] }
      if (typeof n.text === 'string') total += countString(n.text)
      if (Array.isArray(n.children)) n.children.forEach(visit)
    }
    visit((rich as { root?: unknown }).root)
    return total
  }
  for (const block of blocks) {
    switch (block.blockType) {
      case 'sectionTitle':
        words += countString(block.title) + countString(block.subtitle)
        break
      case 'textSection':
        words +=
          countString(block.title) + countString(block.subtitle) + countRich(block.body)
        break
      case 'richTextBlock':
        words += countRich(block.body)
        break
      case 'videoBlock':
        words += countString(block.caption) + VIDEO_BUDGET_WORDS
        break
      case 'buttonBlock':
        words += countString(block.label)
        break
      case 'listBlock':
        words +=
          countString(block.title) +
          (block.items ?? []).reduce((sum, item) => sum + countString(item.text), 0)
        break
      case 'stepsList': {
        const steps = block.steps ?? []
        words +=
          countString(block.title) +
          steps.reduce(
            (sum, step) => sum + countString(step.heading) + countRich(step.description),
            0,
          ) +
          steps.length * STEP_BUDGET_WORDS
        break
      }
      case 'quizBlock':
        words += countString(block.title) + QUIZ_BUDGET_WORDS
        break
      case '__passthrough':
        break
    }
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function relativeTime(iso: string | null): string | null {
  if (!iso) return null
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return null
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile'
const DEVICE_WIDTHS: Record<DeviceMode, number | null> = {
  desktop: null,
  tablet: 768,
  mobile: 390,
}

export default function PublishReviewModal({
  open,
  title,
  blocks,
  mode,
  busy,
  previewUrl,
  previewRefreshKey,
  entityId,
  entity = DEFAULT_ENTITY,
  fetchLastPublishedVersion,
  fetchVersionSnapshot,
  showQuizCoverageCheck = true,
  onCancel,
  onConfirm,
  onSaveDraft,
  savingDraft = false,
}: PublishReviewModalProps) {
  const checks = useMemo(
    () => runChecks(title, blocks, entity, showQuizCoverageCheck),
    [title, blocks, entity, showQuizCoverageCheck],
  )
  const readMinutes = useMemo(() => estimateMinutes(title, blocks), [title, blocks])
  const quizCount = useMemo(
    () =>
      blocks.filter((b) => b.blockType === 'quizBlock' && b.quiz != null).length,
    [blocks],
  )
  const errorCount = checks.filter((c) => c.status === 'error').length
  const warnCount = checks.filter((c) => c.status === 'warn').length
  const canPublish = !busy && errorCount === 0

  // Fetch last-published metadata + its full layout when the modal opens
  // (edit mode only). The layout drives the "Changes in this version" diff.
  // `publishedCount` lets the modal show the upcoming version number
  // ("Publishing version N") so authors have a stable reference point per
  // release — Payload doesn't expose sequential ints, so this approximates
  // by counting prior published versions for the lesson.
  const [lastPublished, setLastPublished] = useState<{
    updatedAt: string | null
    versionId: string | null
    publishedCount: number
  } | null>(null)
  const [previousSnapshot, setPreviousSnapshot] = useState<
    { title: string; layout: unknown } | null
  >(null)
  const [diffLoading, setDiffLoading] = useState(false)
  useEffect(() => {
    if (
      !open ||
      mode !== 'edit' ||
      !entityId ||
      !fetchLastPublishedVersion ||
      !fetchVersionSnapshot
    ) {
      setLastPublished(null)
      setPreviousSnapshot(null)
      setDiffLoading(false)
      return
    }
    let cancelled = false
    setDiffLoading(true)
    ;(async () => {
      try {
        const meta = await fetchLastPublishedVersion(entityId)
        if (cancelled) return
        if (!meta) {
          setLastPublished(null)
          setPreviousSnapshot(null)
          return
        }
        setLastPublished({
          updatedAt: meta.updatedAt,
          versionId: meta.versionId,
          publishedCount: meta.publishedCount,
        })
        const snapshot = await fetchVersionSnapshot(meta.versionId)
        if (cancelled) return
        setPreviousSnapshot(snapshot)
      } catch {
        if (!cancelled) {
          setLastPublished(null)
          setPreviousSnapshot(null)
        }
      } finally {
        if (!cancelled) setDiffLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, mode, entityId, fetchLastPublishedVersion, fetchVersionSnapshot])

  const diff: LessonDiff | null = useMemo(() => {
    if (mode !== 'edit' || !previousSnapshot) return null
    return diffLessonLayouts(
      previousSnapshot,
      { title, layout: toPersistedLayout(blocks) },
    )
  }, [mode, previousSnapshot, title, blocks])

  const [device, setDevice] = useState<DeviceMode>('desktop')

  // Keyboard shortcuts. Esc cancels; Cmd/Ctrl+Enter publishes if valid.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault()
        onCancel()
        return
      }
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && canPublish) {
        event.preventDefault()
        onConfirm()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, canPublish, onCancel, onConfirm])

  if (!open) return null

  const previewSrc = previewUrl
    ? `${previewUrl}${previewUrl.includes('?') ? '&' : '?'}_t=${previewRefreshKey ?? 0}`
    : null
  const deviceWidth = DEVICE_WIDTHS[device]
  // Show the diff row when we have a previous published snapshot to compare
  // against (edit mode, not first publish). The contents may still report
  // "No changes" — that's useful confirmation, so we still render it.
  const showDiff = mode === 'edit' && previousSnapshot != null
  // When the diff section is mounted the panel needs an extra row.
  const panelClass = showDiff ? 'prm-panel prm-panel--with-diff' : 'prm-panel'

  return (
    <div className="prm-overlay" role="dialog" aria-modal="true" aria-labelledby="prm-title">
      <style>{`
        .prm-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: grid;
          place-items: center;
          padding: 32px;
          background: rgba(15, 23, 42, 0.55);
          overflow: hidden;
        }
        .prm-panel {
          display: grid;
          grid-template-rows: auto auto 1fr auto;
          width: 100%;
          max-width: 1200px;
          max-height: 90vh;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 14px;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
          overflow: hidden;
        }
        /* Extra row for the "Changes in this version" diff section. */
        .prm-panel--with-diff {
          grid-template-rows: auto auto auto 1fr auto;
        }
        :root[data-theme='dark'] .prm-panel {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        /* === Header === */
        .prm-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .prm-header {
          border-color: var(--admin-surface-border, #2a3140);
        }
        .prm-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--cpp-ink, #1b1f24);
        }
        .prm-header p {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
        }
        .prm-actions { display: flex; gap: 8px; align-items: center; }
        .prm-btn {
          display: inline-flex;
          align-items: center;
          height: 34px;
          padding: 0 14px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid var(--admin-surface-border, #d6dce5);
          background: var(--admin-surface, #fff);
          color: var(--cpp-ink, #1b1f24);
          cursor: pointer;
        }
        .prm-btn:hover { background: var(--admin-surface-muted, #f5f7fa); }
        .prm-btn:disabled { cursor: not-allowed; opacity: 0.55; }
        .prm-btn--primary {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
        .prm-btn--primary:hover { background: #1e293b; }
        /* Tertiary action — Save Draft sits between Cancel and Publish but
         * reads as clearly subordinate so it doesn't blur the publish intent. */
        .prm-btn--ghost {
          background: transparent;
          border-color: transparent;
          color: var(--cpp-muted, #5d6b80);
        }
        .prm-btn--ghost:hover {
          background: var(--admin-surface-muted, #f5f7fa);
          color: var(--cpp-ink, #1b1f24);
        }
        :root[data-theme='dark'] .prm-btn--ghost {
          color: var(--cpp-muted, #94a3b8);
        }
        :root[data-theme='dark'] .prm-btn--ghost:hover {
          background: var(--admin-surface-muted, #232938);
          color: var(--cpp-ink, #e6e8eb);
        }
        :root[data-theme='dark'] .prm-btn {
          background: var(--admin-surface-muted, #232938);
          border-color: var(--admin-surface-border, #2a3140);
          color: var(--cpp-ink, #e6e8eb);
        }
        :root[data-theme='dark'] .prm-btn--primary {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #e2e8f0;
        }
        .prm-kbd {
          margin-left: 6px;
          padding: 1px 5px;
          font-size: 10px;
          font-weight: 600;
          color: inherit;
          opacity: 0.7;
          border-radius: 3px;
          border: 1px solid currentColor;
        }

        /* === Summary strip === */
        .prm-summary {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          padding: 14px 20px;
          background: var(--admin-surface-muted, #f5f7fa);
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .prm-summary {
          background: var(--admin-surface-muted, #232938);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .prm-summary__title {
          font-size: 16px;
          font-weight: 700;
          color: var(--cpp-ink, #1b1f24);
          margin: 0 0 4px 0;
        }
        .prm-summary__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 14px;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
        }
        .prm-summary__meta strong { color: var(--cpp-ink, #1b1f24); font-weight: 600; }
        :root[data-theme='dark'] .prm-summary__meta strong { color: var(--cpp-ink, #e6e8eb); }
        .prm-version {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
          text-align: right;
          align-self: end;
        }
        .prm-version strong { color: var(--cpp-ink, #1b1f24); font-weight: 600; }
        :root[data-theme='dark'] .prm-version strong { color: var(--cpp-ink, #e6e8eb); }

        /* === Diff row ("Changes in this version") === */
        .prm-diff {
          padding: 10px 20px;
          background: var(--admin-surface, #fff);
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .prm-diff {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .prm-diff__details summary {
          list-style: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
          padding: 4px 0;
        }
        .prm-diff__details summary::-webkit-details-marker { display: none; }
        .prm-diff__chevron {
          display: inline-block;
          transition: transform 120ms ease;
        }
        .prm-diff__details[open] .prm-diff__chevron { transform: rotate(90deg); }
        .prm-diff__count {
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 700;
          border-radius: 999px;
          background: var(--admin-surface-muted, #f5f7fa);
          color: var(--cpp-ink, #1b1f24);
          letter-spacing: 0;
          text-transform: none;
        }
        :root[data-theme='dark'] .prm-diff__count {
          background: var(--admin-surface-muted, #232938);
          color: var(--cpp-ink, #e6e8eb);
        }
        .prm-diff__count--zero {
          background: rgba(16, 185, 129, 0.16);
          color: #047857;
        }
        .prm-diff__list {
          margin: 8px 0 4px 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 4px;
          max-height: 140px;
          overflow-y: auto;
        }
        .prm-diff__item {
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr);
          gap: 8px;
          font-size: 12px;
          color: var(--cpp-ink, #1b1f24);
          align-items: start;
        }
        .prm-diff__glyph {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          margin-top: 1px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 4px;
        }
        .prm-diff__glyph--add {
          color: #047857;
          background: rgba(16, 185, 129, 0.16);
        }
        .prm-diff__glyph--remove {
          color: #b91c1c;
          background: rgba(239, 68, 68, 0.18);
        }
        .prm-diff__glyph--edit {
          color: #1d4ed8;
          background: rgba(59, 130, 246, 0.16);
        }
        .prm-diff__empty {
          margin-top: 6px;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
        }
        .prm-diff__loading {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
          font-style: italic;
        }

        /* === Body grid: validation + preview === */
        .prm-body {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 0;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .prm-body { grid-template-columns: minmax(0, 1fr); }
        }
        .prm-checks {
          padding: 16px 20px;
          border-right: 1px solid var(--admin-surface-border, #d6dce5);
          overflow-y: auto;
          min-height: 0;
        }
        :root[data-theme='dark'] .prm-checks {
          border-right-color: var(--admin-surface-border, #2a3140);
        }
        .prm-checks__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
          margin-bottom: 10px;
        }
        .prm-check {
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr);
          gap: 8px;
          padding: 6px 0;
          align-items: start;
          font-size: 12px;
          color: var(--cpp-ink, #1b1f24);
          border-bottom: 1px dashed transparent;
        }
        .prm-check__glyph {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          margin-top: 1px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 999px;
        }
        .prm-check--ok .prm-check__glyph {
          color: #047857;
          background: rgba(16, 185, 129, 0.16);
        }
        .prm-check--warn .prm-check__glyph {
          color: #b45309;
          background: rgba(217, 119, 6, 0.18);
        }
        .prm-check--error .prm-check__glyph {
          color: #b91c1c;
          background: rgba(239, 68, 68, 0.18);
        }
        .prm-check__detail {
          margin-top: 2px;
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
          word-break: break-word;
        }

        /* === Preview pane === */
        .prm-preview {
          display: grid;
          grid-template-rows: auto 1fr;
          min-height: 0;
        }
        .prm-preview__toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 10px 16px;
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .prm-preview__toolbar {
          border-bottom-color: var(--admin-surface-border, #2a3140);
        }
        .prm-device {
          display: inline-flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 6px;
          overflow: hidden;
        }
        .prm-device__btn {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          color: var(--cpp-muted, #5d6b80);
          background: transparent;
          border: 0;
          cursor: pointer;
        }
        .prm-device__btn--active {
          background: var(--admin-surface-muted, #f5f7fa);
          color: var(--cpp-ink, #1b1f24);
        }
        :root[data-theme='dark'] .prm-device__btn--active {
          background: var(--admin-surface-muted, #232938);
          color: var(--cpp-ink, #e6e8eb);
        }
        .prm-preview__link {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
          text-decoration: none;
        }
        .prm-preview__link:hover { color: var(--cw-accent, #0d6efd); text-decoration: underline; }
        .prm-preview__frame-wrap {
          padding: 16px;
          background:
            linear-gradient(45deg, rgba(148, 163, 184, 0.08) 25%, transparent 25%) 0 0/16px 16px,
            linear-gradient(-45deg, rgba(148, 163, 184, 0.08) 25%, transparent 25%) 0 8px/16px 16px;
          display: grid;
          place-items: center;
          overflow: auto;
          min-height: 0;
        }
        .prm-preview__iframe {
          width: 100%;
          height: 100%;
          min-height: 500px;
          background: #fff;
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
        }
        .prm-preview__empty {
          padding: 60px 24px;
          text-align: center;
          color: var(--cpp-muted, #5d6b80);
          font-size: 13px;
        }

        /* === Footer / publish actions === */
        .prm-footer {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 12px 20px;
          border-top: 1px solid var(--admin-surface-border, #d6dce5);
          background: var(--admin-surface, #fff);
        }
        :root[data-theme='dark'] .prm-footer {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .prm-footer__summary {
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
        }
        .prm-footer__summary--err { color: #b91c1c; }
      `}</style>

      <div className={panelClass}>
        {/* ---- Header ---- */}
        <header className="prm-header">
          <div>
            <h3 id="prm-title">Review changes before publishing</h3>
            <p>Pre-publish validation, live preview, and version context — verify before release.</p>
          </div>
          <div className="prm-actions">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="prm-btn"
              title="Esc"
            >
              Back to editing
              <span className="prm-kbd">Esc</span>
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canPublish}
              className="prm-btn prm-btn--primary"
              title="⌘/Ctrl + Enter"
            >
              {busy ? 'Publishing…' : 'Publish Live'}
              <span className="prm-kbd">⌘↵</span>
            </button>
          </div>
        </header>

        {/* ---- Summary strip ---- */}
        <section className="prm-summary">
          <div>
            <h4 className="prm-summary__title">{title || '(untitled)'}</h4>
            <div className="prm-summary__meta">
              <span>
                <strong>{blocks.length}</strong> block{blocks.length === 1 ? '' : 's'}
              </span>
              <span aria-hidden>•</span>
              <span>
                <strong>{quizCount}</strong> quiz{quizCount === 1 ? '' : 'zes'}
              </span>
              <span aria-hidden>•</span>
              <span>
                <strong>{readMinutes}</strong> min read
              </span>
              <span aria-hidden>•</span>
              <span>
                {mode === 'create'
                  ? `New ${entity.label} — will be created on publish`
                  : 'Promotes the current draft to live'}
              </span>
            </div>
          </div>
          <div className="prm-version">
            {mode === 'edit' && lastPublished?.updatedAt ? (
              <>
                <strong>Publishing version {lastPublished.publishedCount + 1}</strong>
                <br />
                <span>
                  Last published{' '}
                  {relativeTime(lastPublished.updatedAt) ?? 'previously'} — replaces version{' '}
                  {lastPublished.publishedCount}.
                </span>
              </>
            ) : mode === 'edit' ? (
              <>
                <strong>Publishing version 1</strong>
                <br />
                <span>First publish — no previous version exists.</span>
              </>
            ) : (
              <>
                <strong>New {entity.label}</strong>
                <br />
                <span>Creates the {entity.label} row.</span>
              </>
            )}
          </div>
        </section>

        {/* ---- Diff: "Changes in this version" ---- */}
        {showDiff ? (
          <section className="prm-diff" aria-label="Changes since last publish">
            <details
              className="prm-diff__details"
              open={(diff?.changes.length ?? 0) > 0}
            >
              <summary>
                <span className="prm-diff__chevron" aria-hidden>▸</span>
                <span>Changes in this version</span>
                <span
                  className={`prm-diff__count${diff && diff.changes.length === 0 ? ' prm-diff__count--zero' : ''}`}
                >
                  {diffLoading
                    ? '…'
                    : diff
                      ? diff.changes.length === 0
                        ? 'no changes'
                        : String(diff.changes.length)
                      : '…'}
                </span>
              </summary>
              {diffLoading ? (
                <div className="prm-diff__loading">Comparing against last published version…</div>
              ) : diff && diff.changes.length === 0 ? (
                <div className="prm-diff__empty">
                  This draft is identical to the last published version.
                </div>
              ) : diff ? (
                <ul className="prm-diff__list">
                  {diff.changes.map((change, i) => {
                    const glyph =
                      change.kind === 'block-added'
                        ? 'add'
                        : change.kind === 'block-removed'
                          ? 'remove'
                          : 'edit'
                    const sym =
                      change.kind === 'block-added'
                        ? '+'
                        : change.kind === 'block-removed'
                          ? '−'
                          : '~'
                    return (
                      <li key={i} className="prm-diff__item">
                        <span className={`prm-diff__glyph prm-diff__glyph--${glyph}`} aria-hidden>
                          {sym}
                        </span>
                        <span>{describeChange(change, entity.capitalLabel)}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </details>
          </section>
        ) : null}

        {/* ---- Body: validation + preview ---- */}
        <div className="prm-body">
          <aside className="prm-checks" aria-label="Pre-publish checks">
            <div className="prm-checks__title">Validation</div>
            {checks.map((check) => (
              <div key={check.id} className={`prm-check prm-check--${check.status}`}>
                <span className="prm-check__glyph" aria-hidden>
                  {check.status === 'ok' ? '✓' : check.status === 'warn' ? '!' : '×'}
                </span>
                <div>
                  <div>{check.label}</div>
                  {check.detail ? (
                    <div className="prm-check__detail">{check.detail}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </aside>

          <section className="prm-preview" aria-label="Live preview">
            <div className="prm-preview__toolbar">
              <div className="prm-device" role="tablist" aria-label="Preview device width">
                {(['desktop', 'tablet', 'mobile'] satisfies DeviceMode[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="tab"
                    aria-selected={device === d}
                    onClick={() => setDevice(d)}
                    className={`prm-device__btn${device === d ? ' prm-device__btn--active' : ''}`}
                  >
                    {d === 'desktop' ? '◧ Desktop' : d === 'tablet' ? '▭ Tablet' : '▯ Mobile'}
                  </button>
                ))}
              </div>
              {previewSrc ? (
                <a
                  href={previewSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="prm-preview__link"
                >
                  Open full preview ↗
                </a>
              ) : null}
            </div>
            {previewSrc ? (
              <div className="prm-preview__frame-wrap">
                <iframe
                  title={`${entity.capitalLabel} preview`}
                  src={previewSrc}
                  className="prm-preview__iframe"
                  style={{
                    width: deviceWidth ? `${deviceWidth}px` : '100%',
                    maxWidth: '100%',
                  }}
                />
              </div>
            ) : (
              <div className="prm-preview__empty">
                {mode === 'create'
                  ? `Live preview becomes available once the ${entity.label} is saved at least once.`
                  : `Live preview unavailable — ${entity.label} is missing a slug or PREVIEW_SECRET.`}
              </div>
            )}
          </section>
        </div>

        {/* ---- Footer ---- */}
        <footer className="prm-footer">
          <div
            className={`prm-footer__summary${errorCount > 0 ? ' prm-footer__summary--err' : ''}`}
          >
            {errorCount > 0
              ? `Resolve ${errorCount} issue${errorCount === 1 ? '' : 's'} before publishing.`
              : warnCount > 0
                ? `${warnCount} warning${warnCount === 1 ? '' : 's'} — you can still publish.`
                : 'All checks pass.'}
          </div>
          <div className="prm-actions">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy || savingDraft}
              className="prm-btn"
            >
              Back to editing
            </button>
            {onSaveDraft && mode === 'edit' ? (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={busy || savingDraft || errorCount > 0}
                className="prm-btn prm-btn--ghost"
                title={
                  errorCount > 0
                    ? 'Resolve validation errors before saving as draft.'
                    : 'Save current changes as a draft without publishing.'
                }
              >
                {savingDraft ? 'Saving…' : 'Save Draft'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canPublish || savingDraft}
              className="prm-btn prm-btn--primary"
            >
              {busy ? 'Publishing…' : 'Publish Live'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
