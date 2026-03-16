'use client'

import React from 'react'

export default function EmptyLessonState() {
  return (
    <div className="rounded-md border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-muted)]">
      No lessons yet. Add a lesson to begin.
    </div>
  )
}
