'use client'

import React from 'react'

// Empty-state card for a chapter with zero lessons. The actual "Add" /
// "Attach existing" CTAs continue to live in the InlineLessonInput rendered
// directly below this card — keeping a single source of truth for those
// handlers — so this component is intentionally informational only.
export default function EmptyLessonState() {
  return (
    <div className="cw-empty-lessons" role="status">
      <div className="cw-empty-lessons__glyph" aria-hidden>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16v16H4z" opacity="0.35" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
          <path d="M8 17h3" />
        </svg>
      </div>
      <div className="cw-empty-lessons__body">
        <div className="cw-empty-lessons__title">This chapter has no lessons yet</div>
        <div className="cw-empty-lessons__hint">
          Start by adding a lesson below — or attach an existing one from
          another course.
        </div>
      </div>
    </div>
  )
}
