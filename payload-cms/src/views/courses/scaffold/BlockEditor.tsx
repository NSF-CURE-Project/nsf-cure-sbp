'use client'

import React from 'react'
import type {
  CalloutVariant,
  ContactsListBlockData,
  LessonSummaryBlockData,
  LexicalRichText,
  ListBlockData,
  ResourcesListBlockData,
  ScaffoldBlock,
  ScaffoldBlockData,
  StepsListBlockData,
  WorkedExampleBlockData,
} from './types'
import LexicalRichTextEditor from './LexicalRichTextEditor'
import QuizPicker from './QuizPicker'
import MediaPicker from './MediaPicker'

// view='canvas'    → editable content stream (titles, rich text, items —
//                    what the reader will see on the public site).
// view='inspector' → settings/configuration (sizes, flags, relationship
//                    pickers, hrefs — knobs the author tweaks but that
//                    aren't part of the visible content).
// Splitting them lets Phase-2's right rail surface block-specific settings
// without crowding the canvas card body.
export type BlockEditorView = 'canvas' | 'inspector'

type BlockEditorProps = {
  block: ScaffoldBlock
  view: BlockEditorView
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

// Helper rendered by inspector views when a block type has no per-block
// configuration. Keeps the right rail self-explanatory instead of empty.
function InspectorEmpty({ note }: { note: string }) {
  return (
    <div className="text-xs text-[var(--cpp-muted)]">{note}</div>
  )
}

export default function BlockEditor({ block, view, onChange }: BlockEditorProps) {
  switch (block.blockType) {
    case 'sectionTitle': {
      if (view === 'inspector') {
        return (
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
        )
      }
      return (
        <div className="grid gap-3">
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
      if (view === 'inspector') {
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
                Optional. Either an upload, an external URL, or both.
              </span>
            </div>
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
          </div>
        )
      }
      return (
        <label className="grid gap-1">
          <span className={labelCls}>Caption</span>
          <input
            type="text"
            value={block.caption ?? ''}
            onChange={(event) => onChange(patchBlock(block, { caption: event.target.value }))}
            placeholder="Optional caption displayed under the video"
            className={inputCls}
          />
        </label>
      )
    }

    case 'buttonBlock': {
      if (view === 'inspector') {
        return (
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
        )
      }
      return (
        <label className="grid gap-1">
          <span className={labelCls}>Label *</span>
          <input
            type="text"
            value={block.label}
            onChange={(event) => onChange(patchBlock(block, { label: event.target.value }))}
            className={inputCls}
          />
        </label>
      )
    }

    case 'listBlock': {
      const items = block.items ?? []
      const updateItems = (next: ListBlockData['items']) => onChange(patchBlock(block, { items: next }))
      if (view === 'inspector') {
        return (
          <label className="grid gap-1">
            <span className={labelCls}>Style</span>
            <select
              value={block.listStyle ?? 'unordered'}
              onChange={(event) =>
                onChange(
                  patchBlock(block, { listStyle: event.target.value as 'unordered' | 'ordered' }),
                )
              }
              className={inputCls}
            >
              <option value="unordered">Unordered (bullets)</option>
              <option value="ordered">Ordered (numbered)</option>
            </select>
          </label>
        )
      }
      return (
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelCls}>Title</span>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
              className={inputCls}
            />
          </label>
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
      if (view === 'inspector') {
        return <InspectorEmpty note="Steps don't have per-block settings yet." />
      }
      return (
        <div className="grid gap-3">
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
      if (view === 'inspector') {
        return (
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
        )
      }
      return (
        <div className="grid gap-3">
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
      if (view === 'inspector') {
        return <InspectorEmpty note="Rich text content has no per-block settings." />
      }
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

    case 'quizBlock': {
      if (view === 'inspector') {
        return (
          <div className="grid gap-3">
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
                Show title
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={block.showAnswers ?? true}
                  onChange={(event) =>
                    onChange(patchBlock(block, { showAnswers: event.target.checked }))
                  }
                />
                Show answers
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
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
      return (
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
      )
    }

    case 'heroBlock': {
      if (view === 'inspector') {
        return (
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className={labelCls}>Button label</span>
              <input
                type="text"
                value={block.buttonLabel ?? ''}
                onChange={(event) =>
                  onChange(patchBlock(block, { buttonLabel: event.target.value }))
                }
                placeholder="Optional CTA label"
                className={inputCls}
              />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Button link (href)</span>
              <input
                type="text"
                value={block.buttonHref ?? ''}
                onChange={(event) =>
                  onChange(patchBlock(block, { buttonHref: event.target.value }))
                }
                placeholder="/path or https://…"
                className={inputCls}
              />
            </label>
          </div>
        )
      }
      return (
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelCls}>Title *</span>
            <input
              type="text"
              value={block.title}
              onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
              placeholder="Hero headline"
              className={inputCls}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Subtitle</span>
            <textarea
              value={block.subtitle ?? ''}
              onChange={(event) => onChange(patchBlock(block, { subtitle: event.target.value }))}
              rows={2}
              placeholder="Short supporting line under the headline"
              className={inputCls}
            />
          </label>
        </div>
      )
    }

    case 'resourcesList': {
      const resources = block.resources ?? []
      const updateResources = (next: ResourcesListBlockData['resources']) =>
        onChange(patchBlock(block, { resources: next }))
      if (view === 'inspector') {
        return <InspectorEmpty note="Resources don't have per-block settings yet." />
      }
      return (
        <div className="grid gap-3">
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
            <span className={labelCls}>Description</span>
            <textarea
              value={block.description ?? ''}
              onChange={(event) =>
                onChange(patchBlock(block, { description: event.target.value }))
              }
              rows={2}
              className={inputCls}
            />
          </label>
          <div className="grid gap-2">
            <span className={labelCls}>Resources</span>
            {resources.map((resource, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] p-2"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--cpp-muted)]">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={resource.title ?? ''}
                    onChange={(event) => {
                      const next = resources.slice()
                      next[index] = { ...next[index], title: event.target.value }
                      updateResources(next)
                    }}
                    placeholder="Resource title"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => updateResources(resources.filter((_, i) => i !== index))}
                    className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs text-[var(--cpp-muted)] hover:bg-[var(--admin-surface)]"
                    aria-label={`Remove resource ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="url"
                    value={resource.url ?? ''}
                    onChange={(event) => {
                      const next = resources.slice()
                      next[index] = { ...next[index], url: event.target.value }
                      updateResources(next)
                    }}
                    placeholder="https://…"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={resource.type ?? ''}
                    onChange={(event) => {
                      const next = resources.slice()
                      next[index] = { ...next[index], type: event.target.value }
                      updateResources(next)
                    }}
                    placeholder="Type (article, video, etc.)"
                    className={inputCls}
                  />
                </div>
                <textarea
                  value={resource.description ?? ''}
                  onChange={(event) => {
                    const next = resources.slice()
                    next[index] = { ...next[index], description: event.target.value }
                    updateResources(next)
                  }}
                  rows={2}
                  placeholder="Description (optional)"
                  className={inputCls}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateResources([
                  ...resources,
                  { title: '', url: '' },
                ])
              }
              className="inline-flex w-fit rounded-md border border-dashed border-[var(--admin-surface-border)] px-3 py-1 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
            >
              + Add resource
            </button>
          </div>
        </div>
      )
    }

    case 'contactsList': {
      const contacts = block.contacts ?? []
      const updateContacts = (next: ContactsListBlockData['contacts']) =>
        onChange(patchBlock(block, { contacts: next }))
      if (view === 'inspector') {
        return (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={block.groupByCategory ?? false}
              onChange={(event) =>
                onChange(patchBlock(block, { groupByCategory: event.target.checked }))
              }
            />
            Group contacts by category
          </label>
        )
      }
      return (
        <div className="grid gap-3">
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
            <span className={labelCls}>Description</span>
            <textarea
              value={block.description ?? ''}
              onChange={(event) =>
                onChange(patchBlock(block, { description: event.target.value }))
              }
              rows={2}
              className={inputCls}
            />
          </label>
          <div className="grid gap-2">
            <span className={labelCls}>Contacts</span>
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] p-2"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--cpp-muted)]">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={contact.name ?? ''}
                    onChange={(event) => {
                      const next = contacts.slice()
                      next[index] = { ...next[index], name: event.target.value }
                      updateContacts(next)
                    }}
                    placeholder="Name"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => updateContacts(contacts.filter((_, i) => i !== index))}
                    className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs text-[var(--cpp-muted)] hover:bg-[var(--admin-surface)]"
                    aria-label={`Remove contact ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    value={contact.title ?? ''}
                    onChange={(event) => {
                      const next = contacts.slice()
                      next[index] = { ...next[index], title: event.target.value }
                      updateContacts(next)
                    }}
                    placeholder="Title / role"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={contact.category ?? ''}
                    onChange={(event) => {
                      const next = contacts.slice()
                      next[index] = { ...next[index], category: event.target.value }
                      updateContacts(next)
                    }}
                    placeholder="Category (staff, technical, …)"
                    className={inputCls}
                  />
                  <input
                    type="email"
                    value={contact.email ?? ''}
                    onChange={(event) => {
                      const next = contacts.slice()
                      next[index] = { ...next[index], email: event.target.value }
                      updateContacts(next)
                    }}
                    placeholder="email@example.com"
                    className={inputCls}
                  />
                  <input
                    type="tel"
                    value={contact.phone ?? ''}
                    onChange={(event) => {
                      const next = contacts.slice()
                      next[index] = { ...next[index], phone: event.target.value }
                      updateContacts(next)
                    }}
                    placeholder="Phone (optional)"
                    className={inputCls}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateContacts([...contacts, { name: '' }])}
              className="inline-flex w-fit rounded-md border border-dashed border-[var(--admin-surface-border)] px-3 py-1 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
            >
              + Add contact
            </button>
          </div>
        </div>
      )
    }

    case 'callout': {
      if (view === 'inspector') {
        return (
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className={labelCls}>Variant</span>
              <select
                value={block.variant ?? 'info'}
                onChange={(event) =>
                  onChange(
                    patchBlock(block, { variant: event.target.value as CalloutVariant }),
                  )
                }
                className={inputCls}
              >
                <option value="info">Info</option>
                <option value="tip">Tip</option>
                <option value="warning">Warning</option>
                <option value="key">Key concept</option>
              </select>
            </label>
          </div>
        )
      }
      return (
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelCls}>Title (optional)</span>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
              className={inputCls}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Body *</span>
            <textarea
              value={block.body}
              onChange={(event) => onChange(patchBlock(block, { body: event.target.value }))}
              rows={3}
              className={inputCls}
            />
          </label>
        </div>
      )
    }

    case 'definition': {
      if (view === 'inspector') {
        return <InspectorEmpty note="Definitions have no per-block settings." />
      }
      return (
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelCls}>Term *</span>
            <input
              type="text"
              value={block.term}
              onChange={(event) => onChange(patchBlock(block, { term: event.target.value }))}
              placeholder='e.g. "Free body diagram"'
              className={inputCls}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Definition *</span>
            <textarea
              value={block.definition}
              onChange={(event) =>
                onChange(patchBlock(block, { definition: event.target.value }))
              }
              rows={3}
              className={inputCls}
            />
          </label>
        </div>
      )
    }

    case 'workedExample': {
      const steps = block.steps ?? []
      const updateSteps = (next: WorkedExampleBlockData['steps']) =>
        onChange(patchBlock(block, { steps: next }))
      if (view === 'inspector') {
        return (
          <label className="grid gap-1">
            <span className={labelCls}>Final answer</span>
            <input
              type="text"
              value={block.finalAnswer ?? ''}
              onChange={(event) =>
                onChange(patchBlock(block, { finalAnswer: event.target.value }))
              }
              placeholder='e.g. "F = 24 N"'
              className={inputCls}
            />
            <span className="text-xs text-[var(--cpp-muted)]">
              Renders highlighted under the steps.
            </span>
          </label>
        )
      }
      return (
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelCls}>Title (optional)</span>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
              className={inputCls}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Problem *</span>
            <textarea
              value={block.problem}
              onChange={(event) =>
                onChange(patchBlock(block, { problem: event.target.value }))
              }
              rows={3}
              className={inputCls}
            />
          </label>
          <div className="grid gap-2">
            <span className={labelCls}>Steps</span>
            {steps.map((step, index) => (
              <div
                key={index}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2"
              >
                <span className="text-xs font-semibold text-[var(--cpp-muted)]">
                  {index + 1}.
                </span>
                <textarea
                  value={step.text}
                  onChange={(event) => {
                    const next = steps.slice()
                    next[index] = { text: event.target.value }
                    updateSteps(next)
                  }}
                  rows={2}
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
            ))}
            <button
              type="button"
              onClick={() => updateSteps([...steps, { text: '' }])}
              className="inline-flex w-fit rounded-md border border-dashed border-[var(--admin-surface-border)] px-3 py-1 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
            >
              + Add step
            </button>
          </div>
        </div>
      )
    }

    case 'checkpoint': {
      if (view === 'inspector') {
        return (
          <label className="grid gap-1">
            <span className={labelCls}>Hint (optional)</span>
            <textarea
              value={block.hint ?? ''}
              onChange={(event) => onChange(patchBlock(block, { hint: event.target.value }))}
              rows={2}
              placeholder="Optional nudge before students reveal the answer."
              className={inputCls}
            />
          </label>
        )
      }
      return (
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelCls}>Prompt *</span>
            <textarea
              value={block.prompt}
              onChange={(event) =>
                onChange(patchBlock(block, { prompt: event.target.value }))
              }
              rows={2}
              className={inputCls}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Answer * (revealed by click)</span>
            <textarea
              value={block.answer}
              onChange={(event) =>
                onChange(patchBlock(block, { answer: event.target.value }))
              }
              rows={3}
              className={inputCls}
            />
          </label>
        </div>
      )
    }

    case 'lessonSummary': {
      const points = block.points ?? []
      const updatePoints = (next: LessonSummaryBlockData['points']) =>
        onChange(patchBlock(block, { points: next }))
      if (view === 'inspector') {
        return <InspectorEmpty note="Summary has no per-block settings." />
      }
      return (
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelCls}>Title (optional)</span>
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(event) => onChange(patchBlock(block, { title: event.target.value }))}
              placeholder='e.g. "Key takeaways"'
              className={inputCls}
            />
          </label>
          <div className="grid gap-2">
            <span className={labelCls}>Takeaways</span>
            {points.map((point, index) => (
              <div
                key={index}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2"
              >
                <span className="text-xs font-semibold text-[var(--cpp-muted)]">
                  •
                </span>
                <input
                  type="text"
                  value={point.text}
                  onChange={(event) => {
                    const next = points.slice()
                    next[index] = { text: event.target.value }
                    updatePoints(next)
                  }}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => updatePoints(points.filter((_, i) => i !== index))}
                  className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
                  aria-label={`Remove takeaway ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updatePoints([...points, { text: '' }])}
              className="inline-flex w-fit rounded-md border border-dashed border-[var(--admin-surface-border)] px-3 py-1 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
            >
              + Add takeaway
            </button>
          </div>
        </div>
      )
    }

    case '__passthrough': {
      const innerType =
        typeof block.data.blockType === 'string' ? block.data.blockType : 'unknown'
      if (view === 'inspector') {
        return (
          <InspectorEmpty
            note={`Block type "${innerType}" is preserved verbatim. Open this lesson in Payload's edit view to change it.`}
          />
        )
      }
      return (
        <div className="grid gap-1 rounded-md border border-dashed border-amber-400 bg-amber-50/40 p-2 text-xs text-amber-900">
          <div>
            Block type <code className="font-mono">{innerType}</code> isn&apos;t editable in the
            custom editor yet. Its content will be preserved exactly as-is when you save.
          </div>
        </div>
      )
    }
  }
}
