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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  BLOCK_TYPE_LABELS,
  type AuthorableBlockTypeSlug,
  emptyBlockFor,
  type ScaffoldBlock,
} from './types'
import BlockCard from './BlockCard'

type BlockListProps = {
  blocks: ScaffoldBlock[]
  onChange: (next: ScaffoldBlock[]) => void
  selectedKey?: string | null
  onSelect?: (key: string) => void
  // Override the order/visibility of the block-picker chips. Defaults to the
  // lesson-friendly set; pass a Pages-friendly set (with heroBlock,
  // resourcesList, contactsList) from the Pages editor.
  allowedBlockTypes?: AuthorableBlockTypeSlug[]
}

const DEFAULT_BLOCK_TYPE_ORDER: AuthorableBlockTypeSlug[] = [
  'sectionTitle',
  'textSection',
  'richTextBlock',
  'videoBlock',
  'buttonBlock',
  'listBlock',
  'stepsList',
  'callout',
  'definition',
  'workedExample',
  'checkpoint',
  'lessonSummary',
  'quizBlock',
]

// Hover-revealed insertion point between blocks. When the user clicks, the
// inline picker opens at this index; submitting inserts the new block at
// position `index` (i.e. above the block currently rendered at that index,
// or at the end when `index === blocks.length`).
function InsertionPoint({
  isOpen,
  onOpen,
  onClose,
  onPick,
  firstButtonRef,
  allowedTypes,
}: {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onPick: (type: AuthorableBlockTypeSlug) => void
  firstButtonRef?: React.RefObject<HTMLButtonElement | null>
  allowedTypes: AuthorableBlockTypeSlug[]
}) {
  if (isOpen) {
    return (
      <div
        role="menu"
        aria-label="Insert block at this position"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
          }
        }}
        className="lse-insert lse-insert--open"
      >
        {allowedTypes.map((type, idx) => (
          <button
            key={type}
            ref={idx === 0 ? firstButtonRef : null}
            type="button"
            role="menuitem"
            onClick={() => onPick(type)}
            className="lse-insert__option"
          >
            {BLOCK_TYPE_LABELS[type]}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="lse-insert__option lse-insert__option--cancel"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="lse-insert lse-insert--closed">
      <button
        type="button"
        aria-label="Insert block here"
        onClick={onOpen}
        className="lse-insert__trigger"
      >
        <span aria-hidden className="lse-insert__line" />
        <span className="lse-insert__plus">+</span>
        <span aria-hidden className="lse-insert__line" />
      </button>
    </div>
  )
}

export default function BlockList({
  blocks,
  onChange,
  selectedKey = null,
  onSelect,
  allowedBlockTypes,
}: BlockListProps) {
  const blockTypeOrder = allowedBlockTypes ?? DEFAULT_BLOCK_TYPE_ORDER
  // `openInsertion === null`     → no insertion point is open.
  // `openInsertion === <number>` → the gap at that index is showing the picker.
  // `openInsertion === 'end'`    → the bottom "+ Add block" is open.
  const [openInsertion, setOpenInsertion] = useState<number | 'end' | null>(null)
  const insertionFirstButtonRef = useRef<HTMLButtonElement | null>(null)
  const endTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (openInsertion !== null) insertionFirstButtonRef.current?.focus()
  }, [openInsertion])

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

  const insertAt = (index: number, type: AuthorableBlockTypeSlug) => {
    const fresh = emptyBlockFor(type)
    const next = blocks.slice()
    next.splice(index, 0, fresh)
    onChange(next)
    setOpenInsertion(null)
  }

  const appendBlock = (type: AuthorableBlockTypeSlug) => {
    onChange([...blocks, emptyBlockFor(type)])
    setOpenInsertion(null)
  }

  const updateBlock = (key: string, next: ScaffoldBlock) => {
    onChange(blocks.map((block) => (block._key === key ? next : block)))
  }

  const removeBlock = (key: string) => {
    onChange(blocks.filter((block) => block._key !== key))
  }

  return (
    <section className="lse-blocks">
      <div className="lse-blocks__title">Blocks</div>
      {blocks.length === 0 ? (
        <div className="lse-blocks__empty">
          No blocks yet. A lesson without blocks is allowed — you can add content later from the
          lesson edit view, or pick a block type below to start.
        </div>
      ) : (
        <DndContext
          id="lesson-block-list"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((block) => block._key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="lse-blocks__list">
              {blocks.map((block, index) => (
                <React.Fragment key={block._key}>
                  <InsertionPoint
                    isOpen={openInsertion === index}
                    onOpen={() => setOpenInsertion(index)}
                    onClose={() => setOpenInsertion(null)}
                    onPick={(type) => insertAt(index, type)}
                    firstButtonRef={
                      openInsertion === index ? insertionFirstButtonRef : undefined
                    }
                    allowedTypes={blockTypeOrder}
                  />
                  <BlockCard
                    block={block}
                    index={index}
                    isSelected={selectedKey === block._key}
                    onSelect={() => onSelect?.(block._key)}
                    onChange={(next) => updateBlock(block._key, next)}
                    onRemove={() => removeBlock(block._key)}
                  />
                </React.Fragment>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {openInsertion === 'end' ? (
        <div
          role="menu"
          aria-label="Add a block"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              setOpenInsertion(null)
              endTriggerRef.current?.focus()
            }
          }}
          className="lse-end-picker"
        >
          {blockTypeOrder.map((type, idx) => (
            <button
              key={type}
              ref={idx === 0 ? insertionFirstButtonRef : null}
              type="button"
              role="menuitem"
              onClick={() => appendBlock(type)}
              className="lse-end-picker__option"
            >
              {BLOCK_TYPE_LABELS[type]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpenInsertion(null)
              endTriggerRef.current?.focus()
            }}
            className="lse-end-picker__option lse-end-picker__option--cancel"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          ref={endTriggerRef}
          type="button"
          onClick={() => setOpenInsertion('end')}
          aria-haspopup="menu"
          aria-expanded={false}
          className="lse-add-block"
        >
          + Add block
        </button>
      )}
    </section>
  )
}
