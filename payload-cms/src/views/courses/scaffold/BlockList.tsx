'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  BLOCK_TYPE_LABELS,
  type AuthorableBlockTypeSlug,
  emptyBlockFor,
  type ScaffoldBlock,
} from './types'
import BlockEditor from './BlockEditor'

type BlockListProps = {
  blocks: ScaffoldBlock[]
  onChange: (next: ScaffoldBlock[]) => void
}

const blockTypeOrder: AuthorableBlockTypeSlug[] = [
  'sectionTitle',
  'textSection',
  'richTextBlock',
  'videoBlock',
  'buttonBlock',
  'listBlock',
  'stepsList',
  'quizBlock',
  'problemSetBlock',
]

function SortableBlock({
  block,
  onChange,
  onRemove,
}: {
  block: ScaffoldBlock
  onChange: (next: ScaffoldBlock) => void
  onRemove: () => void
}) {
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
      className="grid gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          {...sortable.attributes}
          {...sortable.listeners}
          aria-label={`Reorder ${BLOCK_TYPE_LABELS[block.blockType]} block`}
          className="cursor-grab rounded p-1 text-xs text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)] active:cursor-grabbing"
        >
          ⋮⋮
        </button>
        <div className="grow text-xs font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
          {BLOCK_TYPE_LABELS[block.blockType]}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
        >
          Remove
        </button>
      </div>
      <BlockEditor block={block} onChange={onChange} />
    </div>
  )
}

export default function BlockList({ blocks, onChange }: BlockListProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerFirstButtonRef = useRef<HTMLButtonElement | null>(null)
  const addBlockTriggerRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    if (pickerOpen) pickerFirstButtonRef.current?.focus()
  }, [pickerOpen])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex((block) => block._key === active.id)
    const newIndex = blocks.findIndex((block) => block._key === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = blocks.slice()
    const [moved] = next.splice(oldIndex, 1)
    next.splice(newIndex, 0, moved)
    onChange(next)
  }

  const addBlock = (type: AuthorableBlockTypeSlug) => {
    onChange([...blocks, emptyBlockFor(type)])
    setPickerOpen(false)
  }

  const updateBlock = (key: string, next: ScaffoldBlock) => {
    onChange(blocks.map((block) => (block._key === key ? next : block)))
  }

  const removeBlock = (key: string) => {
    onChange(blocks.filter((block) => block._key !== key))
  }

  return (
    <section className="grid gap-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
        Blocks
      </div>
      {blocks.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-3 py-4 text-center text-xs text-[var(--cpp-muted)]">
          No blocks yet. A lesson without blocks is allowed (you can add content later from the
          lesson edit view), or pick a block type below to start.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={blocks.map((block) => block._key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-2">
              {blocks.map((block) => (
                <SortableBlock
                  key={block._key}
                  block={block}
                  onChange={(next) => updateBlock(block._key, next)}
                  onRemove={() => removeBlock(block._key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {pickerOpen ? (
        <div
          role="menu"
          aria-label="Add a block"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              setPickerOpen(false)
              addBlockTriggerRef.current?.focus()
            }
          }}
          className="grid gap-1 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] p-2"
        >
          {blockTypeOrder.map((type, index) => (
            <button
              key={type}
              ref={index === 0 ? pickerFirstButtonRef : null}
              type="button"
              role="menuitem"
              onClick={() => addBlock(type)}
              className="rounded-md px-2 py-1.5 text-left text-sm text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)] focus:bg-[var(--admin-surface-muted)] focus:outline-none"
            >
              {BLOCK_TYPE_LABELS[type]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPickerOpen(false)
              addBlockTriggerRef.current?.focus()
            }}
            className="rounded-md px-2 py-1.5 text-left text-xs text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)] focus:bg-[var(--admin-surface-muted)] focus:outline-none"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          ref={addBlockTriggerRef}
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
          className="inline-flex w-fit rounded-md border border-dashed border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
        >
          + Add block
        </button>
      )}
    </section>
  )
}
