'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteFeedback, updateFeedback, type FeedbackId } from './feedback-api'
import FeedbackHomeCard, { type FeedbackItem } from './FeedbackHomeCard'
import { HelpLink } from '../admin/HelpLink'
import { useConfirm } from '../admin/useConfirm'

type FeedbackHomeProps = {
  initialFeedback: FeedbackItem[]
}

type ReadFilter = 'all' | 'unread' | 'read'

export default function FeedbackHome({ initialFeedback }: FeedbackHomeProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState<FeedbackItem[]>(initialFeedback)
  const [searchValue, setSearchValue] = useState('')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [expandedId, setExpandedId] = useState<FeedbackId | null>(null)
  const [updatingId, setUpdatingId] = useState<FeedbackId | null>(null)
  const [deletingId, setDeletingId] = useState<FeedbackId | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const { confirm, dialog: confirmDialog } = useConfirm()

  const unreadCount = useMemo(
    () => feedback.filter((item) => !item.read).length,
    [feedback],
  )

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    return feedback.filter((item) => {
      if (readFilter === 'unread' && item.read) return false
      if (readFilter === 'read' && !item.read) return false
      if (!query) return true
      const haystack = [item.message, item.email ?? '', item.pageUrl ?? '']
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [feedback, searchValue, readFilter])

  const handleToggleRead = async (item: FeedbackItem) => {
    if (updatingId) return
    setActionError(null)
    setUpdatingId(item.id)
    const nextRead = !item.read
    setFeedback((prev) =>
      prev.map((entry) => (entry.id === item.id ? { ...entry, read: nextRead } : entry)),
    )
    try {
      await updateFeedback(item.id, { read: nextRead })
    } catch (error) {
      setFeedback((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, read: item.read } : entry,
        ),
      )
      setActionError(
        error instanceof Error ? error.message : 'Unable to update feedback.',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (item: FeedbackItem) => {
    if (deletingId) return
    const preview = item.message.length > 80 ? `${item.message.slice(0, 77)}…` : item.message
    const confirmed = await confirm({
      title: 'Delete this feedback?',
      message: `"${preview}"`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirmed) return
    setActionError(null)
    setDeletingId(item.id)
    try {
      await deleteFeedback(item.id)
      setFeedback((prev) => prev.filter((entry) => entry.id !== item.id))
      router.refresh()
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to delete feedback.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleExpand = (id: FeedbackId) => {
    setExpandedId((current) => (current === id ? null : id))
  }

  const filterButton = (value: ReadFilter, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setReadFilter(value)}
      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
        readFilter === value
          ? 'border-sky-500 bg-sky-50 text-sky-800'
          : 'border-[var(--admin-surface-border)] bg-[var(--admin-surface)] text-[var(--cpp-muted)] hover:text-[var(--cpp-ink)]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <>
      {confirmDialog}
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
            Student Support
          </div>
          <h1 className="m-0 mt-1 text-2xl font-semibold text-[var(--cpp-ink)]">
            Feedback inbox
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--cpp-muted)]">
            Platform feedback submitted from anywhere on the site. Mark items read once you have
            triaged them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HelpLink topic="student-support" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search by message, email, or page…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full max-w-md rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] placeholder:text-[var(--cpp-muted)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          aria-label="Search feedback"
        />
        <div className="flex items-center gap-1.5">
          {filterButton('all', `All (${feedback.length})`)}
          {filterButton('unread', `Unread (${unreadCount})`)}
          {filterButton('read', `Read (${feedback.length - unreadCount})`)}
        </div>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {actionError}
        </div>
      ) : null}

      {feedback.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-6 text-sm text-[var(--cpp-muted)]">
          No feedback has been submitted yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-6 text-sm text-[var(--cpp-muted)]">
          No feedback matches the current filters.
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((item) => (
            <FeedbackHomeCard
              key={item.id}
              feedback={item}
              expanded={expandedId === item.id}
              updating={updatingId === item.id}
              deleting={deletingId === item.id}
              onToggleExpand={handleToggleExpand}
              onToggleRead={handleToggleRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
    </>
  )
}
