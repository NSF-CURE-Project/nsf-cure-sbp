'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteClassroom, type EntityId } from './classrooms-api'
import ClassroomsHomeCard, { type ClassroomCatalogItem } from './ClassroomsHomeCard'
import { HelpLink } from '../admin/HelpLink'
import { useConfirm } from '../admin/useConfirm'

type ClassroomsHomeProps = {
  initialClassrooms: ClassroomCatalogItem[]
}

type StatusFilter = 'active' | 'archived' | 'all'

export default function ClassroomsHome({ initialClassrooms }: ClassroomsHomeProps) {
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<ClassroomCatalogItem[]>(initialClassrooms)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [deletingId, setDeletingId] = useState<EntityId | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { confirm, dialog: confirmDialog } = useConfirm()

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    return classrooms.filter((classroom) => {
      if (statusFilter === 'active' && !classroom.active) return false
      if (statusFilter === 'archived' && classroom.active) return false
      if (!query) return true
      const haystack = [
        classroom.title,
        classroom.courseTitle ?? '',
        classroom.professorName ?? '',
        classroom.joinCode ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [classrooms, searchValue, statusFilter])

  const handleDelete = async (classroom: ClassroomCatalogItem) => {
    if (deletingId) return

    const hasMembers = classroom.memberCount > 0
    const memberLine = hasMembers
      ? ` This will also remove ${classroom.memberCount} enrollment${
          classroom.memberCount === 1 ? '' : 's'
        } — students will lose access.`
      : ''
    const confirmed = await confirm({
      title: `Delete "${classroom.title}"?`,
      message: `This permanently removes the classroom.${memberLine} This cannot be undone.`,
      confirmLabel: 'Delete classroom',
      destructive: true,
    })
    if (!confirmed) return

    setDeleteError(null)
    setDeletingId(classroom.id)
    try {
      await deleteClassroom(classroom.id)
      setClassrooms((prev) => prev.filter((item) => item.id !== classroom.id))
      router.refresh()
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : `Unable to delete classroom "${classroom.title}".`,
      )
    } finally {
      setDeletingId(null)
    }
  }

  const activeCount = classrooms.filter((classroom) => classroom.active).length
  const archivedCount = classrooms.length - activeCount
  const totalMembers = classrooms.reduce((sum, classroom) => sum + classroom.memberCount, 0)

  const filterChips: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: 'active', label: 'Active', count: activeCount },
    { value: 'archived', label: 'Archived', count: archivedCount },
    { value: 'all', label: 'All', count: classrooms.length },
  ]

  return (
    <>
      {confirmDialog}
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
            Classrooms
          </div>
          <h1 className="m-0 mt-1 text-2xl font-semibold text-[var(--cpp-ink)]">
            Classroom catalog
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--cpp-muted)]">
            Each classroom is a cohort of students enrolled in a specific course with a unique
            join code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HelpLink topic="classrooms" />
          <Link
            href="/admin/classrooms/new"
            className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white no-underline hover:bg-slate-800"
          >
            Create classroom
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Filter classrooms by status" className="inline-flex gap-1">
          {filterChips.map((chip) => {
            const selected = statusFilter === chip.value
            return (
              <button
                key={chip.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setStatusFilter(chip.value)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                  selected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-[var(--admin-surface-border)] bg-[var(--admin-surface)] text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]'
                }`}
              >
                {chip.label}
                <span
                  className={`ml-1.5 text-[10px] font-semibold ${
                    selected ? 'text-white/80' : 'text-[var(--cpp-muted)]'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            )
          })}
        </div>
        <input
          type="search"
          placeholder="Search by title, course, professor, or join code…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full max-w-md rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] placeholder:text-[var(--cpp-muted)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          aria-label="Search classrooms"
        />
        <div className="text-xs text-[var(--cpp-muted)]">
          {classrooms.length} classroom{classrooms.length === 1 ? '' : 's'} · {activeCount} active ·{' '}
          {totalMembers} member{totalMembers === 1 ? '' : 's'}
        </div>
      </div>

      {deleteError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {deleteError}
        </div>
      ) : null}

      {classrooms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-6 text-sm text-[var(--cpp-muted)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              No classrooms yet. Create one to generate a join code and start enrolling students.
            </div>
            <Link
              href="/admin/classrooms/new"
              className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white no-underline"
            >
              Create first classroom
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-6 text-sm text-[var(--cpp-muted)]">
          {searchValue.trim()
            ? `No ${statusFilter === 'all' ? '' : statusFilter} classrooms match “${searchValue}”.`
            : statusFilter === 'archived'
              ? 'No archived classrooms. Archived classrooms appear here once you toggle one off.'
              : 'No active classrooms. Switch to Archived or All to see the rest.'}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((classroom) => (
            <ClassroomsHomeCard
              key={classroom.id}
              classroom={classroom}
              deleting={deletingId === classroom.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
    </>
  )
}
