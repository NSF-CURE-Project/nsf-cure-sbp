'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { EntityId } from './pages-api'

export type PageCatalogItem = {
  id: EntityId
  title: string
  slug: string
  status: 'draft' | 'published'
  navOrder: number | null
  hidden: boolean
  blockCount: number
  updatedAt: string | null
}

type PagesHomeCardProps = {
  page: PageCatalogItem
  deleting: boolean
  togglingVisibility: boolean
  onDelete: (page: PageCatalogItem) => void
  onToggleVisibility: (page: PageCatalogItem) => void
}

const formatDate = (iso: string | null) => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PagesHomeCard({
  page,
  deleting,
  togglingVisibility,
  onDelete,
  onToggleVisibility,
}: PagesHomeCardProps) {
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

  const updatedLabel = formatDate(page.updatedAt)
  const statusToneClass =
    page.status === 'published'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-amber-100 text-amber-800'
  const statusLabel = page.status === 'published' ? 'Published' : 'Draft'

  return (
    <article className="group relative rounded-lg border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] p-4 transition hover:border-sky-300">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/pages/${page.id}`}
              className="truncate text-base font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
            >
              {page.title}
            </Link>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusToneClass}`}
            >
              {statusLabel}
            </span>
            {page.hidden ? (
              <span
                className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700"
                title="Hidden from navigation and returns 404 on the public site"
              >
                Hidden
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--cpp-muted)]">
            <span>
              /<strong className="text-[var(--cpp-ink)]">{page.slug || 'untitled'}</strong>
            </span>
            <span aria-hidden>·</span>
            <span>
              {page.blockCount} block{page.blockCount === 1 ? '' : 's'}
            </span>
            {page.navOrder != null ? (
              <>
                <span aria-hidden>·</span>
                <span>Nav order {page.navOrder}</span>
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
            href={`/admin/pages/${page.id}`}
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
              aria-label={`More actions for ${page.title}`}
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
                  href={`/admin/pages/${page.id}`}
                  role="menuitem"
                  className="block px-3 py-2 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
                >
                  Edit content
                </Link>
                <Link
                  href={`/admin/site-management?tab=navigation`}
                  role="menuitem"
                  className="block border-t border-[var(--admin-surface-border)] px-3 py-2 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
                >
                  Reorder in nav
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  disabled={togglingVisibility}
                  onClick={() => {
                    setMenuOpen(false)
                    onToggleVisibility(page)
                  }}
                  className="block w-full border-t border-[var(--admin-surface-border)] px-3 py-2 text-left text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {togglingVisibility
                    ? 'Updating…'
                    : page.hidden
                      ? 'Show on site'
                      : 'Hide on site'}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={deleting}
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(page)
                  }}
                  className="block w-full border-t border-[var(--admin-surface-border)] px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete page'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
