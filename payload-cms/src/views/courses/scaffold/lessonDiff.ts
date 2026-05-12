// Content diff between two lesson snapshots (the last-published version vs.
// the current draft). Operates on the *persisted* layout shape — what
// `toPersistedLayout` produces and what /api/lessons/versions returns — so
// the modal can call it without rehydrating the prior version into the
// editor's ScaffoldBlock model.

import { BLOCK_TYPE_LABELS, type BlockTypeSlug } from './types'

export type DiffChange =
  | { kind: 'title'; from: string; to: string }
  | { kind: 'block-added'; index: number; blockType: string }
  | { kind: 'block-removed'; index: number; blockType: string }
  | {
      kind: 'block-type-changed'
      index: number
      from: string
      to: string
    }
  | {
      kind: 'block-field'
      index: number
      blockType: string
      // One-line human description, e.g. "Title updated" or
      // "List items: 3 → 5".
      summary: string
    }

export type LessonDiff = {
  changes: DiffChange[]
  // Short headline for the collapsible header — "3 changes" / "No changes".
  headline: string
}

type RawBlock = Record<string, unknown> & { blockType?: string }

const labelFor = (blockType: string | undefined): string => {
  if (!blockType) return 'Block'
  return (
    BLOCK_TYPE_LABELS[blockType as BlockTypeSlug] ?? blockType
  )
}

const asString = (v: unknown): string => (typeof v === 'string' ? v : '')

const normRel = (v: unknown): string | null => {
  if (v == null) return null
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object' && 'id' in (v as object)) {
    const id = (v as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

// Flatten a Lexical EditorState (or any node tree with {text, children}) into
// a single trimmed string so we can do a meaningful "did the prose change"
// compare without bothering with node-level structure.
const extractRichText = (v: unknown): string => {
  if (!v || typeof v !== 'object') return ''
  const out: string[] = []
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const n = node as { text?: unknown; children?: unknown }
    if (typeof n.text === 'string') out.push(n.text)
    if (Array.isArray(n.children)) n.children.forEach(visit)
  }
  visit((v as { root?: unknown }).root ?? v)
  return out.join(' ').replace(/\s+/g, ' ').trim()
}

const itemsTexts = (items: unknown): string[] => {
  if (!Array.isArray(items)) return []
  return items.map((it) =>
    asString((it as { text?: unknown } | null | undefined)?.text),
  )
}

const stepsSignatures = (steps: unknown): string[] => {
  if (!Array.isArray(steps)) return []
  return steps.map((s) => {
    const step = s as { heading?: unknown; description?: unknown }
    return `${asString(step.heading)}::${extractRichText(step.description)}`
  })
}

// Per-block-type field comparison. Pushes one entry per differing field with
// a human-readable summary; the caller wraps each with the block index.
const compareFields = (
  blockType: string,
  prev: RawBlock,
  next: RawBlock,
): string[] => {
  const out: string[] = []
  switch (blockType) {
    case 'sectionTitle': {
      if (asString(prev.title) !== asString(next.title)) out.push('Title updated')
      if (asString(prev.subtitle) !== asString(next.subtitle))
        out.push('Subtitle updated')
      if (asString(prev.size) !== asString(next.size))
        out.push(`Heading size: ${asString(prev.size) || '—'} → ${asString(next.size) || '—'}`)
      break
    }
    case 'videoBlock': {
      if (normRel(prev.video) !== normRel(next.video)) out.push('Video source changed')
      if (asString(prev.url) !== asString(next.url)) out.push('External URL updated')
      if (asString(prev.caption) !== asString(next.caption)) out.push('Caption updated')
      break
    }
    case 'buttonBlock': {
      if (asString(prev.label) !== asString(next.label)) out.push('Label updated')
      if (asString(prev.href) !== asString(next.href)) out.push('Link updated')
      break
    }
    case 'listBlock': {
      if (asString(prev.title) !== asString(next.title)) out.push('List title updated')
      if (asString(prev.listStyle) !== asString(next.listStyle))
        out.push(`List style: ${asString(prev.listStyle) || '—'} → ${asString(next.listStyle) || '—'}`)
      const a = itemsTexts(prev.items)
      const b = itemsTexts(next.items)
      if (a.length !== b.length) {
        out.push(`Items: ${a.length} → ${b.length}`)
      } else if (a.some((text, i) => text !== b[i])) {
        out.push('List items edited')
      }
      break
    }
    case 'stepsList': {
      if (asString(prev.title) !== asString(next.title)) out.push('Steps title updated')
      const a = stepsSignatures(prev.steps)
      const b = stepsSignatures(next.steps)
      if (a.length !== b.length) {
        out.push(`Steps: ${a.length} → ${b.length}`)
      } else if (a.some((sig, i) => sig !== b[i])) {
        out.push('Step content edited')
      }
      break
    }
    case 'textSection': {
      if (asString(prev.title) !== asString(next.title)) out.push('Title updated')
      if (asString(prev.subtitle) !== asString(next.subtitle))
        out.push('Subtitle updated')
      if (asString(prev.size) !== asString(next.size))
        out.push(`Heading size: ${asString(prev.size) || '—'} → ${asString(next.size) || '—'}`)
      if (extractRichText(prev.body) !== extractRichText(next.body))
        out.push('Body text edited')
      break
    }
    case 'richTextBlock': {
      if (extractRichText(prev.body) !== extractRichText(next.body))
        out.push('Body text edited')
      break
    }
    case 'quizBlock': {
      if (asString(prev.title) !== asString(next.title)) out.push('Title updated')
      if (normRel(prev.quiz) !== normRel(next.quiz)) out.push('Quiz selection changed')
      if (Boolean(prev.showTitle) !== Boolean(next.showTitle))
        out.push(`Show title: ${Boolean(prev.showTitle)} → ${Boolean(next.showTitle)}`)
      if (Boolean(prev.showAnswers) !== Boolean(next.showAnswers))
        out.push(`Show answers: ${Boolean(prev.showAnswers)} → ${Boolean(next.showAnswers)}`)
      if ((prev.maxAttempts ?? null) !== (next.maxAttempts ?? null))
        out.push(`Max attempts: ${prev.maxAttempts ?? '—'} → ${next.maxAttempts ?? '—'}`)
      if ((prev.timeLimitSec ?? null) !== (next.timeLimitSec ?? null))
        out.push(`Time limit: ${prev.timeLimitSec ?? '—'}s → ${next.timeLimitSec ?? '—'}s`)
      break
    }
    default: {
      // Unknown block type — fall back to JSON equality.
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        out.push('Settings changed')
      }
    }
  }
  return out
}

export function diffLessonLayouts(
  prev: { title: string; layout: unknown },
  next: { title: string; layout: unknown },
): LessonDiff {
  const changes: DiffChange[] = []

  if ((prev.title ?? '') !== (next.title ?? '')) {
    changes.push({ kind: 'title', from: prev.title ?? '', to: next.title ?? '' })
  }

  const prevBlocks: RawBlock[] = Array.isArray(prev.layout)
    ? (prev.layout as RawBlock[])
    : []
  const nextBlocks: RawBlock[] = Array.isArray(next.layout)
    ? (next.layout as RawBlock[])
    : []
  const max = Math.max(prevBlocks.length, nextBlocks.length)

  for (let i = 0; i < max; i++) {
    const a = prevBlocks[i]
    const b = nextBlocks[i]
    if (!a && b) {
      changes.push({
        kind: 'block-added',
        index: i,
        blockType: labelFor(b.blockType),
      })
      continue
    }
    if (a && !b) {
      changes.push({
        kind: 'block-removed',
        index: i,
        blockType: labelFor(a.blockType),
      })
      continue
    }
    if (!a || !b) continue
    if (a.blockType !== b.blockType) {
      changes.push({
        kind: 'block-type-changed',
        index: i,
        from: labelFor(a.blockType),
        to: labelFor(b.blockType),
      })
      continue
    }
    const fields = compareFields(asString(a.blockType), a, b)
    for (const summary of fields) {
      changes.push({
        kind: 'block-field',
        index: i,
        blockType: labelFor(a.blockType),
        summary,
      })
    }
  }

  const headline =
    changes.length === 0
      ? 'No changes since last publish'
      : `${changes.length} change${changes.length === 1 ? '' : 's'} since last publish`

  return { changes, headline }
}

// Render a single change as the one-liner shown in the modal.
export function describeChange(change: DiffChange): string {
  switch (change.kind) {
    case 'title':
      return change.from
        ? `Lesson title: "${change.from}" → "${change.to}"`
        : `Lesson title set to "${change.to}"`
    case 'block-added':
      return `Added ${change.blockType} (block #${change.index + 1})`
    case 'block-removed':
      return `Removed ${change.blockType} (was block #${change.index + 1})`
    case 'block-type-changed':
      return `Block #${change.index + 1}: changed from ${change.from} to ${change.to}`
    case 'block-field':
      return `Block #${change.index + 1} (${change.blockType}): ${change.summary}`
  }
}
