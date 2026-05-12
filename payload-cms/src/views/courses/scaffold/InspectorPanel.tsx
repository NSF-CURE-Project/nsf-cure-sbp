'use client'

import React from 'react'
import { BLOCK_TYPE_LABELS, type ScaffoldBlock } from './types'
import BlockEditor from './BlockEditor'

type InspectorPanelProps = {
  selectedBlock: ScaffoldBlock | null
  onChange: (next: ScaffoldBlock) => void
}

// Right rail: settings for the currently-selected block. Renders the same
// BlockEditor in `view='inspector'` mode so each block type can surface its
// configuration knobs (size, alignment, flags, relationship pickers)
// without crowding the canvas card body.
export default function InspectorPanel({ selectedBlock, onChange }: InspectorPanelProps) {
  return (
    <aside className="lse-inspector" aria-label="Block inspector">
      <div className="lse-inspector__title">Inspector</div>
      {selectedBlock ? (
        <div className="lse-inspector__body">
          <div className="lse-inspector__heading">
            <span className="lse-inspector__heading-badge">
              {BLOCK_TYPE_LABELS[selectedBlock.blockType]}
            </span>
            <span className="lse-inspector__heading-hint">Block settings</span>
          </div>
          <BlockEditor block={selectedBlock} view="inspector" onChange={onChange} />
        </div>
      ) : (
        <div className="lse-inspector__empty">
          Select a block to edit its settings here.
          <br />
          <span className="lse-inspector__empty-hint">
            Content (titles, body text, list items) stays in the main canvas.
          </span>
        </div>
      )}
    </aside>
  )
}
