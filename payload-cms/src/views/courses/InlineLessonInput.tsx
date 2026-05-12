'use client'

import React, { useEffect, useRef, useState } from 'react'

type InlineLessonInputProps = {
  onSubmit: (title: string) => void
  onAttachExisting: () => void
  // When true, render directly in expanded form (used by the in-chapter list).
  // When false, render as a clickable "+ Add lesson" affordance that expands
  // into an input on click.
  alwaysExpanded?: boolean
}

// Click-to-expand inline input for staging a new lesson title. Enter commits,
// Esc / blur with empty value collapses. After commit the input stays open
// with cleared text so staff can batch-enter titles. No DB write happens here;
// the staged lesson is owned by the parent and persisted to sessionStorage.
export default function InlineLessonInput({
  onSubmit,
  onAttachExisting,
  alwaysExpanded = false,
}: InlineLessonInputProps) {
  const [expanded, setExpanded] = useState(alwaysExpanded)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  const commit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
    // keep focus for batch entry
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const cancel = () => {
    setValue('')
    if (!alwaysExpanded) setExpanded(false)
  }

  if (!expanded) {
    return (
      <div className="cw-chapter__add-row">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="cw-chapter__add-inline"
        >
          <span aria-hidden="true">+</span>
          <span>Add lesson</span>
        </button>
        <button
          type="button"
          onClick={onAttachExisting}
          className="cw-chapter__attach-link"
        >
          or attach existing →
        </button>
      </div>
    )
  }

  return (
    <div className="cw-chapter__add-row cw-chapter__add-row--expanded">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          } else if (event.key === 'Escape') {
            event.preventDefault()
            cancel()
          }
        }}
        onBlur={() => {
          if (!value.trim() && !alwaysExpanded) setExpanded(false)
        }}
        placeholder="Lesson title — press Enter to add"
        className="cw-chapter__add-input"
        aria-label="New lesson title"
      />
      <button
        type="button"
        onClick={onAttachExisting}
        className="cw-chapter__attach-link"
      >
        attach existing →
      </button>
    </div>
  )
}
