'use client'

import React from 'react'
import { BLOCK_TYPE_LABELS, type ScaffoldBlock } from './types'

type OutlinePanelProps = {
  blocks: ScaffoldBlock[]
  selectedKey: string | null
  onSelect: (key: string) => void
}

// Compact one-line preview matching the BlockCard preview helper. Inlined
// here rather than imported so the outline can iterate without dragging in
// the full card component.
function summarize(block: ScaffoldBlock): string {
  switch (block.blockType) {
    case 'sectionTitle':
      return block.title || 'Untitled section'
    case 'textSection':
      return block.title || (block.subtitle ?? 'Text section')
    case 'richTextBlock':
      return 'Rich text content'
    case 'videoBlock':
      return block.url || (block.video != null ? 'Uploaded video' : 'Video — not set')
    case 'buttonBlock':
      return block.label || 'Button — not set'
    case 'listBlock': {
      const items = block.items ?? []
      const first = items.find((it) => it.text?.trim())?.text ?? ''
      return block.title || first || 'Empty list'
    }
    case 'stepsList': {
      const steps = block.steps ?? []
      return block.title || steps[0]?.heading || 'Steps'
    }
    case 'quizBlock':
      return block.title || 'Quiz'
    case '__passthrough':
      return (block.data.blockType as string) ?? 'Unsupported block'
  }
}

// Left rail: a flat list of block previews. Clicking a row selects the
// block; the card auto-scrolls into view (BlockCard handles that on the
// canvas side). No DnD here yet — reorder still happens inside the canvas
// list via the existing dnd-kit setup.
export default function OutlinePanel({ blocks, selectedKey, onSelect }: OutlinePanelProps) {
  return (
    <aside className="lse-outline" aria-label="Lesson outline">
      <div className="lse-outline__title">Outline</div>
      {blocks.length === 0 ? (
        <div className="lse-outline__empty">No blocks yet.</div>
      ) : (
        <ul className="lse-outline__list">
          {blocks.map((block, index) => {
            const isSelected = block._key === selectedKey
            return (
              <li key={block._key}>
                <button
                  type="button"
                  onClick={() => onSelect(block._key)}
                  className={`lse-outline__item${isSelected ? ' lse-outline__item--selected' : ''}`}
                  aria-current={isSelected ? 'true' : undefined}
                >
                  <span className="lse-outline__item-index">{index + 1}</span>
                  <span className="lse-outline__item-body">
                    <span className="lse-outline__item-type">
                      {BLOCK_TYPE_LABELS[block.blockType]}
                    </span>
                    <span className="lse-outline__item-summary">{summarize(block)}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
