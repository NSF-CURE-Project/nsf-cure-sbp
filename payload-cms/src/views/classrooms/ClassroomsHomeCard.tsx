'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { EntityId } from './classrooms-api'

export type ClassroomCatalogItem = {
  id: EntityId
  title: string
  courseTitle: string | null
  professorName: string | null
  joinCode: string | null
  joinCodeExpiresAt: string | null
  active: boolean
  memberCount: number
  updatedAt: string | null
}

type ClassroomsHomeCardProps = {
  classroom: ClassroomCatalogItem
  deleting: boolean
  onDelete: (classroom: ClassroomCatalogItem) => void
}

const formatDate = (iso: string | null) => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ClassroomsHomeCard({
  classroom,
  deleting,
  onDelete,
}: ClassroomsHomeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handlePointer = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  const status = classroom.active ? 'Active' : 'Archived'
  const expiresLabel = formatDate(classroom.joinCodeExpiresAt)
  const updatedLabel = formatDate(classroom.updatedAt)

  return (
    <article className="group relative rounded-lg border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] p-4 transition hover:border-sky-300">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/classrooms/${classroom.id}`}
              className="truncate text-base font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
            >
              {classroom.title}
            </Link>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {status}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--cpp-muted)]">
            {classroom.courseTitle ? (
              <span>
                Course: <strong className="text-[var(--cpp-ink)]">{classroom.courseTitle}</strong>
              </span>
            ) : null}
            {classroom.professorName ? (
              <>
                <span aria-hidden>·</span>
                <span>
                  Professor:{' '}
                  <strong className="text-[var(--cpp-ink)]">{classroom.professorName}</strong>
                </span>
              </>
            ) : null}
            <span aria-hidden>·</span>
            <span>
              {classroom.memberCount} member{classroom.memberCount === 1 ? '' : 's'}
            </span>
            {classroom.joinCode ? (
              <>
                <span aria-hidden>·</span>
                <span className="font-mono text-[var(--cpp-ink)]">{classroom.joinCode}</span>
                {expiresLabel ? <span>(exp. {expiresLabel})</span> : null}
              </>
            ) : null}
            {updatedLabel ? (
              <>
                <span aria-hidden>·</span>
                <span>Updated {updatedLabel}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/classrooms/${classroom.id}`}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-slate-800"
          >
            Edit
          </Link>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`More actions for ${classroom.title}`}
              className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1.5 text-sm font-semibold text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
            >
              ⋯
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] shadow-lg"
              >
                <Link
                  href={`/admin/classrooms/${classroom.id}`}
                  role="menuitem"
                  className="block px-3 py-2 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
                >
                  Edit details
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  disabled={deleting}
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(classroom)
                  }}
                  className="block w-full border-t border-[var(--admin-surface-border)] px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete classroom'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
