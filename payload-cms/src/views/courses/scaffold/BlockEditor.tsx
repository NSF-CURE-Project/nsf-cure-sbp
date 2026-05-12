'use client'

import React from 'react'
import type {
  LexicalRichText,
  ListBlockData,
  ScaffoldBlock,
  ScaffoldBlockData,
  StepsListBlockData,
} from './types'
import LexicalRichTextEditor from './LexicalRichTextEditor'
import QuizPicker from './QuizPicker'
import ProblemSetPicker from './ProblemSetPicker'
import MediaPicker from './MediaPicker'

type BlockEditorProps = {
  block: ScaffoldBlock
  onChange: (next: ScaffoldBlock) => void
}

const inputCls =
  'rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
const labelCls =
  'text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]'

// Merge a partial update into the block while preserving `_key` and the
// discriminator. The cast is safe because `patch` is a Partial of the same
// discriminated variant; TS just can't track that through Object.assign.
function patchBlock<T extends ScaffoldBlock>(block: T, patch: Partial<ScaffoldBlockData>): T {
  return { ...block, ...patch } as T
}

export default function BlockEditor({ block, onChange }: BlockEditorProps) {
  switch (block.blockType) {
    case 'sectionTitle': {
      return (
        <div className="grid gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
            <label className="grid gap-1">
              <span className={labelCls}>Title *</span>
              <input
                type="text"
                value={block.title}
                onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
                className={inputCls}
              />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Size</span>
              <select
                value={block.size ?? 'md'}
                onChange={(event) =>
                  onChange(patchBlock(block, { size: event.target.value as 'sm' | 'md' | 'lg' }))
                }
                className={inputCls}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </label>
          </div>
          <label className="grid gap-1">
            <span className={labelCls}>Subtitle</span>
            <textarea
              value={block.subtitle ?? ''}
              onChange={(event) => onChange(patchBlock(block, { subtitle: event.target.value }))}
              rows={2}
              className={inputCls}
            />
          </label>
        </div>
      )
    }

    case 'videoBlock': {
      return (
        <div className="grid gap-3">
          <div className="grid gap-1">
            <span className={labelCls}>Uploaded video</span>
            <MediaPicker
              value={block.video ?? null}
              onChange={(video) => onChange(patchBlock(block, { video }))}
              accept="video/*"
              noun="video"
            />
            <span className="text-xs text-[var(--cpp-muted)]">
              Optional. Provide either an upload, an external URL below, or both.
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className={labelCls}>External video URL</span>
              <input
                type="url"
                value={block.url ?? ''}
                onChange={(event) => onChange(patchBlock(block, { url: event.target.value }))}
                placeholder="https://…"
                className={inputCls}
              />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Caption</span>
              <input
                type="text"
                value={block.caption ?? ''}
                onChange={(event) => onChange(patchBlock(block, { caption: event.target.value }))}
                className={inputCls}
              />
            </label>
          </div>
        </div>
      )
    }

    case 'buttonBlock': {
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className={labelCls}>Label *</span>
            <input
              type="text"
              value={block.label}
              onChange={(event) => onChange(patchBlock(block, { label: event.target.value }))}
              className={inputCls}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Link (href) *</span>
            <input
              type="text"
              value={block.href}
              onChange={(event) => onChange(patchBlock(block, { href: event.target.value }))}
              placeholder="/path or https://…"
              className={inputCls}
            />
          </label>
        </div>
      )
    }

    case 'listBlock': {
      const items = block.items ?? []
      const updateItems = (next: ListBlockData['items']) => onChange(patchBlock(block, { items: next }))
      return (
        <div className="grid gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
            <label className="grid gap-1">
              <span className={labelCls}>Title</span>
              <input
                type="text"
                value={block.title ?? ''}
                onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
                className={inputCls}
              />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Style</span>
              <select
                value={block.listStyle ?? 'unordered'}
                onChange={(event) =>
                  onChange(patchBlock(block, { listStyle: event.target.value as 'unordered' | 'ordered' }))
                }
                className={inputCls}
              >
                <option value="unordered">Unordered (bullets)</option>
                <option value="ordered">Ordered (numbered)</option>
              </select>
            </label>
          </div>
          <div className="grid gap-1.5">
            <span className={labelCls}>Items</span>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                <span className="text-xs font-semibold text-[var(--cpp-muted)]">{index + 1}.</span>
                <input
                  type="text"
                  value={item.text ?? ''}
                  onChange={(event) => {
                    const next = items.slice()
                    next[index] = { text: event.target.value }
                    updateItems(next)
                  }}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => updateItems(items.filter((_, i) => i !== index))}
                  className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
                  aria-label={`Remove item ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateItems([...items, { text: '' }])}
              className="inline-flex w-fit rounded-md border border-dashed border-[var(--admin-surface-border)] px-3 py-1 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
            >
              + Add item
            </button>
          </div>
        </div>
      )
    }

    case 'stepsList': {
      const steps = block.steps ?? []
      const updateSteps = (next: StepsListBlockData['steps']) => onChange(patchBlock(block, { steps: next }))
      return (
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className={labelCls}>Title</span>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
              className={inputCls}
            />
          </label>
          <div className="grid gap-2">
            <span className={labelCls}>Steps</span>
            {steps.map((step, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] p-2"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--cpp-muted)]">{index + 1}.</span>
                  <input
                    type="text"
                    value={step.heading}
                    onChange={(event) => {
                      const next = steps.slice()
                      next[index] = { ...next[index], heading: event.target.value }
                      updateSteps(next)
                    }}
                    placeholder="Step heading"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => updateSteps(steps.filter((_, i) => i !== index))}
                    className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
                    aria-label={`Remove step ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
                <LexicalRichTextEditor
                  value={step.description ?? null}
                  onChange={(richText: LexicalRichText) => {
                    const next = steps.slice()
                    next[index] = { ...next[index], description: richText }
                    updateSteps(next)
                  }}
                  placeholder="Step description (optional)"
                  minHeight={90}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateSteps([...steps, { heading: '' }])}
              className="inline-flex w-fit rounded-md border border-dashed border-[var(--admin-surface-border)] px-3 py-1 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
            >
              + Add step
            </button>
          </div>
        </div>
      )
    }

    case 'textSection': {
      return (
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className={labelCls}>Title</span>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
              className={inputCls}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Subtitle</span>
            <textarea
              value={block.subtitle ?? ''}
              onChange={(event) => onChange(patchBlock(block, { subtitle: event.target.value }))}
              rows={2}
              className={inputCls}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Size</span>
            <select
              value={block.size ?? 'md'}
              onChange={(event) =>
                onChange(patchBlock(block, { size: event.target.value as 'sm' | 'md' | 'lg' }))
              }
              className={inputCls}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </label>
          <div className="grid gap-1">
            <span className={labelCls}>Body</span>
            <LexicalRichTextEditor
              value={block.body ?? null}
              onChange={(body: LexicalRichText) => onChange(patchBlock(block, { body }))}
              placeholder="Write the section body…"
            />
          </div>
        </div>
      )
    }

    case 'richTextBlock': {
      return (
        <div className="grid gap-1">
          <span className={labelCls}>Body *</span>
          <LexicalRichTextEditor
            value={block.body ?? null}
            onChange={(body: LexicalRichText) => onChange(patchBlock(block, { body }))}
            placeholder="Write the rich text content…"
          />
        </div>
      )
    }

    case 'problemSetBlock': {
      return (
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className={labelCls}>Title</span>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
              placeholder="Optional override of the problem set title"
              className={inputCls}
            />
          </label>
          <div className="grid gap-1">
            <span className={labelCls}>Problem set *</span>
            <ProblemSetPicker
              value={block.problemSet ?? null}
              onChange={(problemSet) => onChange(patchBlock(block, { problemSet }))}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={block.showTitle ?? true}
                onChange={(event) =>
                  onChange(patchBlock(block, { showTitle: event.target.checked }))
                }
              />
              Show problem-set title
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={block.showAnswers ?? true}
                onChange={(event) =>
                  onChange(patchBlock(block, { showAnswers: event.target.checked }))
                }
              />
              Show answers after submit
            </label>
          </div>
          <label className="grid gap-1">
            <span className={labelCls}>Max attempts</span>
            <input
              type="number"
              min={0}
              value={block.maxAttempts ?? ''}
              onChange={(event) => {
                const raw = event.target.value
                onChange(
                  patchBlock(block, {
                    maxAttempts: raw === '' ? null : Number(raw),
                  }),
                )
              }}
              placeholder="Unlimited"
              className={inputCls}
            />
          </label>
        </div>
      )
    }

    case 'quizBlock': {
      return (
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className={labelCls}>Title</span>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
              placeholder="Optional override of the quiz title"
              className={inputCls}
            />
          </label>
          <div className="grid gap-1">
            <span className={labelCls}>Quiz *</span>
            <QuizPicker
              value={block.quiz ?? null}
              onChange={(quiz) => onChange(patchBlock(block, { quiz }))}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={block.showTitle ?? true}
                onChange={(event) =>
                  onChange(patchBlock(block, { showTitle: event.target.checked }))
                }
              />
              Show quiz title
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={block.showAnswers ?? true}
                onChange={(event) =>
                  onChange(patchBlock(block, { showAnswers: event.target.checked }))
                }
              />
              Show answers after submit
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className={labelCls}>Max attempts</span>
              <input
                type="number"
                min={0}
                value={block.maxAttempts ?? ''}
                onChange={(event) => {
                  const raw = event.target.value
                  onChange(
                    patchBlock(block, {
                      maxAttempts: raw === '' ? null : Number(raw),
                    }),
                  )
                }}
                placeholder="Unlimited"
                className={inputCls}
              />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Time limit (seconds)</span>
              <input
                type="number"
                min={0}
                value={block.timeLimitSec ?? ''}
                onChange={(event) => {
                  const raw = event.target.value
                  onChange(
                    patchBlock(block, {
                      timeLimitSec: raw === '' ? null : Number(raw),
                    }),
                  )
                }}
                placeholder="Use quiz default"
                className={inputCls}
              />
            </label>
          </div>
        </div>
      )
    }

    case '__passthrough': {
      const innerType =
        typeof block.data.blockType === 'string' ? block.data.blockType : 'unknown'
      return (
        <div className="grid gap-1 rounded-md border border-dashed border-amber-400 bg-amber-50/40 p-2 text-xs text-amber-900">
          <div>
            Block type <code className="font-mono">{innerType}</code> isn&apos;t editable in the
            custom editor yet. Its content will be preserved exactly as-is when you save.
          </div>
          <div className="text-[10px] text-amber-900/70">
            To change it, save first, then open this lesson in Payload&apos;s edit view.
          </div>
        </div>
      )
    }
  }
}
