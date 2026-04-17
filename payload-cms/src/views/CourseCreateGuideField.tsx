'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useField } from '@payloadcms/ui'

type IdValue = string | number | null | undefined

const resolveId = (value: IdValue): string | null => {
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return null
}

const panelStyle: React.CSSProperties = {
  margin: '4px 0 20px',
  borderRadius: 14,
  border: '1px solid var(--admin-surface-border)',
  background: 'linear-gradient(160deg, #ffffff 0%, #edf5ff 62%, #e7f7ff 100%)',
  boxShadow: '0 1px 0 rgba(18, 65, 147, 0.08)',
  padding: '16px 18px',
  display: 'grid',
  gap: 14,
}

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: '#0b61b9',
  fontWeight: 800,
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  color: '#0b4aaf',
  background: 'rgba(21, 83, 207, 0.1)',
  border: '1px solid rgba(21, 83, 207, 0.16)',
}

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--admin-surface-border)',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: '12px 14px',
  display: 'grid',
  gap: 6,
}

export default function CourseCreateGuideField() {
  const { value: idValue } = useField<IdValue>({ path: 'id' })
  const { value: legacyIdValue } = useField<IdValue>({ path: '_id' })
  const [isCreatePath, setIsCreatePath] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsCreatePath(window.location.pathname.includes('/admin/collections/classes/create'))
  }, [])

  const courseId = useMemo(
    () => resolveId(idValue) ?? resolveId(legacyIdValue),
    [idValue, legacyIdValue],
  )
  const isCreate = isCreatePath || !courseId

  if (!isCreate) {
    return (
      <section style={panelStyle}>
        <div style={eyebrowStyle}>Course Setup</div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--cpp-ink)' }}>
            Edit the core course details here.
          </div>
          <div style={{ fontSize: 13, color: 'var(--cpp-muted)', lineHeight: 1.55 }}>
            Add chapters and lessons from Course Workspace so the curriculum structure stays clear
            and ordered.
          </div>
        </div>
        <div>
          <Link
            href="/admin/courses"
            style={{
              ...chipStyle,
              textDecoration: 'none',
            }}
          >
            Open Course Workspace
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section style={panelStyle}>
      <div style={eyebrowStyle}>Create Course</div>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cpp-ink)' }}>
          Start the top-level course container here.
        </div>
        <div style={{ fontSize: 13, color: 'var(--cpp-muted)', lineHeight: 1.6, maxWidth: 760 }}>
          Use this page to create a course such as Statics Fundamentals or Mechanics of Materials.
          After you save, return to Course Workspace to add chapters, lessons, and ordering.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={chipStyle}>Title required</span>
        <span style={chipStyle}>Description optional</span>
        <span style={chipStyle}>Chapters added after save</span>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cpp-ink)' }}>Fill in now</div>
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.55 }}>
            Give the course a clear title and, if helpful, a short description staff will recognize
            later in Course Workspace.
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cpp-ink)' }}>
            Not on this page
          </div>
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.55 }}>
            You do not need to add chapters or lessons yet. Those are created after the course is
            saved.
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cpp-ink)' }}>
            What happens next
          </div>
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.55 }}>
            Save the course, then open Course Workspace to build out the chapter structure and add
            lessons in context.
          </div>
        </div>
      </div>

      <div>
        <Link
          href="/admin/courses"
          style={{
            ...chipStyle,
            textDecoration: 'none',
          }}
        >
          Back to Course Workspace
        </Link>
      </div>
    </section>
  )
}
