'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useField } from '@payloadcms/ui'
import {
  AdminCard,
  AdminCardHeader,
  AdminChipRow,
  AdminMiniCard,
  adminChipStyle,
  adminPrimaryActionStyle,
} from '@/views/admin/AdminCardPrimitives'

type IdValue = string | number | null | undefined

const resolveId = (value: IdValue): string | null => {
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return null
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
      <AdminCard variant="info" style={{ margin: '4px 0 20px' }}>
        <AdminCardHeader
          compact
          eyebrow="Course Setup"
          title="Course editing guidance"
          description="Edit the core course details here, then manage chapters and lessons from Course Workspace so the curriculum structure stays clear and ordered."
        />
        <div>
          <Link
            href="/admin/courses"
            style={{
              ...adminChipStyle,
              textDecoration: 'none',
            }}
          >
            Open Course Workspace
          </Link>
        </div>
      </AdminCard>
    )
  }

  return (
    <AdminCard variant="info" style={{ margin: '4px 0 20px' }}>
      <AdminCardHeader
        eyebrow="Create Course"
        title="Start the top-level course container here."
        description="Use this page to create a course such as Statics Fundamentals or Mechanics of Materials. After you save, return to Course Workspace to add chapters, lessons, and ordering."
      />

      <AdminChipRow items={['Title required', 'Description optional', 'Chapters added after save']} />

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <AdminMiniCard
          title="Fill in now"
          body="Give the course a clear title and, if helpful, a short description staff will recognize later in Course Workspace."
        />
        <AdminMiniCard
          title="Not on this page"
          body="You do not need to add chapters or lessons yet. Those are created after the course is saved."
        />
        <AdminMiniCard
          title="What happens next"
          body="Save the course, then open Course Workspace to build out the chapter structure and add lessons in context."
        />
      </div>

      <div>
        <Link
          href="/admin/courses"
          aria-label="Go back to Course Workspace"
          style={adminPrimaryActionStyle}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: 999,
              background: 'rgba(21, 83, 207, 0.1)',
              color: '#0b4aaf',
              flexShrink: 0,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 3.5L2 8m0 0l4.5 4.5M2 8h12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>Back to Course Workspace</span>
        </Link>
      </div>
    </AdminCard>
  )
}
