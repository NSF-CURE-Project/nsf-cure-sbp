'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deletePage, setPageHidden, type EntityId } from './pages-api'
import PagesHomeCard, { type PageCatalogItem } from './PagesHomeCard'
import { HelpLink } from '../admin/HelpLink'
import { useConfirm } from '../admin/useConfirm'

type PagesHomeProps = {
  initialPages: PageCatalogItem[]
}

export default function PagesHome({ initialPages }: PagesHomeProps) {
  const router = useRouter()
  const [pages, setPages] = useState<PageCatalogItem[]>(initialPages)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deletingId, setDeletingId] = useState<EntityId | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<EntityId | null>(null)
  const [visibilityError, setVisibilityError] = useState<string | null>(null)
  const { confirm, dialog: confirmDialog } = useConfirm()

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    return pages.filter((page) => {
      if (statusFilter !== 'all' && page.status !== statusFilter) return false
      if (!query) return true
      return (
        page.title.toLowerCase().includes(query) ||
        page.slug.toLowerCase().includes(query)
      )
    })
  }, [pages, searchValue, statusFilter])

  const handleDelete = async (page: PageCatalogItem) => {
    if (deletingId) return

    const confirmed = await confirm({
      title: `Delete "${page.title}"?`,
      message:
        'This permanently removes the page and its layout. This cannot be undone.',
      confirmLabel: 'Delete page',
      destructive: true,
    })
    if (!confirmed) return

    setDeleteError(null)
    setDeletingId(page.id)
    try {
      await deletePage(page.id)
      setPages((prev) => prev.filter((p) => p.id !== page.id))
      router.refresh()
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : `Unable to delete page "${page.title}".`,
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleVisibility = async (page: PageCatalogItem) => {
    if (togglingId) return
    const nextHidden = !page.hidden

    if (nextHidden) {
      const confirmed = await confirm({
        title: `Hide "${page.title}"?`,
        message:
          'Hidden pages are removed from the public navigation and their URL returns 404. Admins can still see and edit them here.',
        confirmLabel: 'Hide page',
      })
      if (!confirmed) return
    }

    setVisibilityError(null)
    setTogglingId(page.id)
    try {
      await setPageHidden(page.id, nextHidden)
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, hidden: nextHidden } : p)),
      )
      router.refresh()
    } catch (error) {
      setVisibilityError(
        error instanceof Error
          ? error.message
          : `Unable to update visibility for "${page.title}".`,
      )
    } finally {
      setTogglingId(null)
    }
  }

  const publishedCount = pages.filter((page) => page.status === 'published').length
  const draftCount = pages.length - publishedCount

  return (
    <>
      {confirmDialog}
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
            Pages
          </div>
          <h1 className="m-0 mt-1 text-2xl font-semibold text-[var(--cpp-ink)]">
            Site pages
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--cpp-muted)]">
            Manage the marketing/CMS pages that ship in the public site nav. Reorder in{' '}
            <Link
              href="/admin/site-management?tab=navigation"
              className="font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
            >
              Site Management → Navigation
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HelpLink topic="site-management" />
          <Link
            href="/admin/pages/new"
            className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white no-underline hover:bg-slate-800"
          >
            Create page
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search by title or slug…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full max-w-sm rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] placeholder:text-[var(--cpp-muted)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          aria-label="Search pages"
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as 'all' | 'published' | 'draft')
          }
          className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="published">Published only</option>
          <option value="draft">Drafts only</option>
        </select>
        <div className="text-xs text-[var(--cpp-muted)]">
          {pages.length} page{pages.length === 1 ? '' : 's'} · {publishedCount} published ·{' '}
          {draftCount} draft{draftCount === 1 ? '' : 's'}
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

      {visibilityError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {visibilityError}
        </div>
      ) : null}

      {pages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-6 text-sm text-[var(--cpp-muted)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>No pages yet. Create one to add content to the public site.</div>
            <Link
              href="/admin/pages/new"
              className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white no-underline"
            >
              Create first page
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-6 text-sm text-[var(--cpp-muted)]">
          No pages match the current filter.
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((page) => (
            <PagesHomeCard
              key={page.id}
              page={page}
              deleting={deletingId === page.id}
              togglingVisibility={togglingId === page.id}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}
    </div>
    </>
  )
}
