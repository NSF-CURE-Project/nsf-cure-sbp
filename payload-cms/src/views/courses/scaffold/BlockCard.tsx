'use client'

import React, { useEffect, useRef, useState } from 'react'
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
    case 'heroBlock':
      return block.title || 'Hero — needs headline'
    case 'resourcesList': {
      const resources = block.resources ?? []
      const first = resources.find((r) => r.title?.trim())?.title ?? ''
      const label = block.title || first || 'Resources'
      return resources.length > 1 ? `${label} (+${resources.length - 1} more)` : label
    }
    case 'contactsList': {
      const contacts = block.contacts ?? []
      const first = contacts.find((c) => c.name?.trim())?.name ?? ''
      const label = block.title || first || 'Contacts'
      return contacts.length > 1 ? `${label} (+${contacts.length - 1} more)` : label
    }
    case 'callout':
      return block.title || block.body?.slice(0, 60) || 'Callout — needs body'
    case 'definition':
      return block.term ? `${block.term} — definition` : 'Definition — needs term'
    case 'workedExample': {
      const stepCount = block.steps?.length ?? 0
      const label = block.title || block.problem?.slice(0, 60) || 'Worked example'
      return stepCount ? `${label} (${stepCount} step${stepCount === 1 ? '' : 's'})` : label
    }
    case 'checkpoint':
      return block.prompt?.slice(0, 60) || 'Checkpoint — needs prompt'
    case 'lessonSummary': {
      const points = block.points ?? []
      const label = block.title || 'Summary'
      return points.length ? `${label} (${points.length} takeaway${points.length === 1 ? '' : 's'})` : label
    }
    case '__passthrough':
      return (block.data.blockType as string) ?? 'Unsupported block'
  }
}

type BlockCardProps = {
  block: ScaffoldBlock
  index: number
  defaultOpen?: boolean
  isSelected: boolean
  onSelect: () => void
  onChange: (next: ScaffoldBlock) => void
  onRemove: () => void
}

// One block in the canvas. Header (drag handle, badge, preview, remove)
// stays visible whether expanded or not. The expanded body now shows ONLY
// the content fields (`view='canvas'`) — settings live in the right
// inspector when the block is selected.
//
// Selection: focusing any control inside the card selects the block.
// Clicking the header also selects. Drag/chevron interactions don't.
export default function BlockCard({
  block,
  index,
  defaultOpen = true,
  isSelected,
  onSelect,
  onChange,
  onRemove,
}: BlockCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const sortable = useSortable({ id: block._key })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.55 : 1,
  }

  // Scroll selected block into view when selection lands on this card.
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isSelected])

  // Refs callback that wires both dnd-kit's setNodeRef and our own.
  const setRefs = (node: HTMLDivElement | null) => {
    sortable.setNodeRef(node)
    cardRef.current = node
  }

  return (
    <div
      ref={setRefs}
      style={style}
      onFocusCapture={() => {
        if (!isSelected) onSelect()
      }}
      className={[
        'lse-block',
        sortable.isDragging ? 'lse-block--dragging' : '',
        open ? 'lse-block--open' : 'lse-block--collapsed',
        isSelected ? 'lse-block--selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-block-type={block.blockType}
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
          onClick={() => {
            onSelect()
            setOpen((prev) => !prev)
          }}
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
          <BlockEditor block={block} view="canvas" onChange={onChange} />
        </div>
      ) : null}
    </div>
  )
}
