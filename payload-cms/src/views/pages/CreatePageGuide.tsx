'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createPage } from './pages-api'
import { HelpLink } from '../admin/HelpLink'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export default function CreatePageGuide() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveSlug = useMemo(() => {
    return slugTouched ? slug : slugify(title)
  }, [slug, slugTouched, title])

  const canSubmit = title.trim().length > 0 && effectiveSlug.length > 0

  const handleCreate = async () => {
    if (!canSubmit) {
      setError('Title and slug are required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const created = await createPage({
        title: title.trim(),
        slug: effectiveSlug,
      })
      router.push(`/admin/pages/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create page.')
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-5">
      <header className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--cpp-muted)]">
          <Link
            href="/admin/pages"
            className="font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
          >
            Pages
          </Link>
          <span aria-hidden>›</span>
          <span>Create page</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="m-0 text-2xl font-semibold text-[var(--cpp-ink)]">
            Create a new page
          </h1>
          <HelpLink topic="site-management" />
        </div>
        <p className="text-sm text-[var(--cpp-muted)]">
          Pages are created as drafts. You&apos;ll be taken to the editor next to add content,
          and you can publish from there when ready.
        </p>
      </header>

      <section className="grid max-w-2xl gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
            Title <span className="text-red-600">*</span>
          </span>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. About the program"
            className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
            URL slug <span className="text-red-600">*</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-[var(--cpp-muted)]">/</span>
            <input
              type="text"
              value={effectiveSlug}
              onChange={(event) => {
                setSlug(event.target.value)
                setSlugTouched(true)
              }}
              placeholder="auto-generated from title"
              className="flex-1 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <span className="text-xs text-[var(--cpp-muted)]">
            Lowercase, hyphen-separated. Use <code className="font-mono">home</code> for the
            site root.
          </span>
        </label>
      </section>

      {error ? <div className="text-xs text-red-700">{error}</div> : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-surface-border)] pt-3">
        <Link
          href="/admin/pages"
          className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleCreate}
          disabled={busy || !canSubmit}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create page'}
        </button>
      </div>
    </div>
  )
}
