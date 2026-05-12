'use client'

import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BLOCK_TYPE_LABELS, type ScaffoldBlock } from './types'
import BlockEditor from './BlockEditor'

// Compact summary for the collapsed state. Each block type gets a short
// preview line so authors can scan the outline without expanding everything.
function previewText(block: ScaffoldBlock): string {
  switch (block.blockType) {
    case 'sectionTitle':
      return block.title || 'Untitled section'
    case 'textSection':
      return block.title || (block.subtitle ? block.subtitle : 'Text section')
    case 'richTextBlock':
      return 'Rich text content'
    case 'videoBlock':
      return block.url || (block.video != null ? 'Uploaded video' : 'Video — not set')
    case 'buttonBlock':
      return block.label ? `${block.label} → ${block.href || '—'}` : 'Button — not set'
    case 'listBlock': {
      const items = block.items ?? []
      const first = items.find((it) => it.text?.trim())?.text ?? ''
      const label = block.title || first || 'Empty list'
      return items.length > 1 ? `${label} (+${items.length - 1} more)` : label
    }
    case 'stepsList': {
      const steps = block.steps ?? []
      const first = steps[0]?.heading || 'Steps'
      return steps.length > 1 ? `${first} (+${steps.length - 1} more)` : first
    }
    case 'quizBlock':
      return block.quiz != null ? `Quiz #${block.quiz}` : 'Quiz — not selected'
    case 'problemSetBlock':
      return block.problemSet != null
        ? `Problem set #${block.problemSet}`
        : 'Problem set — not selected'
    case '__passthrough':
      return (block.data.blockType as string) ?? 'Unsupported block'
  }
}

type BlockCardProps = {
  block: ScaffoldBlock
  index: number
  defaultOpen?: boolean
  onChange: (next: ScaffoldBlock) => void
  onRemove: () => void
}

// One block in the canvas. Owns the collapse/expand state; drag handle,
// type badge, and remove control live in the persistent header so authors
// can reorder without expanding.
export default function BlockCard({
  block,
  index,
  defaultOpen = true,
  onChange,
  onRemove,
}: BlockCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const sortable = useSortable({ id: block._key })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.55 : 1,
  }

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`lse-block${sortable.isDragging ? ' lse-block--dragging' : ''}${open ? ' lse-block--open' : ' lse-block--collapsed'}`}
    >
      <header className="lse-block__header">
        <button
          type="button"
          {...sortable.attributes}
          {...sortable.listeners}
          aria-label={`Reorder ${BLOCK_TYPE_LABELS[block.blockType]} block`}
          className="lse-block__handle"
        >
          ⋮⋮
        </button>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? 'Collapse block' : 'Expand block'}
          className="lse-block__chevron"
        >
          {open ? '▾' : '▸'}
        </button>
        <span className="lse-block__badge">{BLOCK_TYPE_LABELS[block.blockType]}</span>
        <span className="lse-block__index">#{index + 1}</span>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="lse-block__preview"
          title={open ? 'Collapse' : 'Expand'}
        >
          {previewText(block)}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="lse-block__remove"
          aria-label="Remove block"
        >
          Remove
        </button>
      </header>
      {open ? (
        <div className="lse-block__body">
          <BlockEditor block={block} onChange={onChange} />
        </div>
      ) : null}
    </div>
  )
}
