'use client'

import React, { useEffect, useRef, useState } from 'react'

export type RelationshipSearchHit = {
  id: string
  title: string
  status?: string | null
  updatedAt?: string | null
}

type RelationshipPickerProps = {
  value: string | number | null
  onChange: (next: string | number | null) => void
  // Search collection items by free-text query. Returns up to `limit` hits.
  searchFn: (query: string, limit?: number) => Promise<RelationshipSearchHit[]>
  // User-facing copy customizable per resource type.
  noun: string // e.g. "quiz", "problem set"
  emptyLabel?: string // e.g. "No quiz attached"
}

// Search-and-pick UI used by QuizPicker. Closed state
// renders a small chip + change button; open state shows a search field and
// up to `limit` results. The currently-selected id is cached client-side so
// the chip can show the resource title even when it's not in the latest
// search response.
export default function RelationshipPicker({
  value,
  onChange,
  searchFn,
  noun,
  emptyLabel,
}: RelationshipPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RelationshipSearchHit[]>([])
  const [busy, setBusy] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (value == null) {
      setSelectedLabel(null)
      return
    }
    const hit = results.find((q) => String(q.id) === String(value))
    if (hit) {
      setSelectedLabel(hit.title)
      return
    }
    if (!selectedLabel) setSelectedLabel(`${capitalize(noun)} #${value}`)
  }, [value, results, selectedLabel, noun])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setBusy(true)
    const handle = setTimeout(async () => {
      try {
        const docs = await searchFn(query)
        if (!cancelled) setResults(docs)
      } finally {
        if (!cancelled) setBusy(false)
      }
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [open, query, searchFn])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        {value != null ? (
          <span className="inline-flex items-center gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-2 py-1 text-sm">
            <span className="font-medium text-[var(--cpp-ink)]">
              {selectedLabel ?? `${capitalize(noun)} #${value}`}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setSelectedLabel(null)
              }}
              className="text-xs text-[var(--cpp-muted)] hover:text-red-700"
              aria-label={`Clear ${noun}`}
            >
              ×
            </button>
          </span>
        ) : (
          <span className="text-xs text-[var(--cpp-muted)]">{emptyLabel ?? `No ${noun} attached`}</span>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
        >
          {value != null ? 'Change' : `Pick a ${noun}`}
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] p-2">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`Search ${noun}s by title…`}
        className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
      />
      <div className="max-h-56 overflow-y-auto pr-1">
        {busy ? (
          <div className="text-xs text-[var(--cpp-muted)]">Searching…</div>
        ) : results.length === 0 ? (
          <div className="text-xs text-[var(--cpp-muted)]">
            {query ? `No matching ${noun}s.` : 'Start typing to search.'}
          </div>
        ) : (
          <ul className="grid gap-1">
            {results.map((item) => {
              const selected = String(item.id) === String(value)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(item.id)
                      setSelectedLabel(item.title)
                      setOpen(false)
                    }}
                    className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition ${
                      selected
                        ? 'border-sky-400 bg-sky-50'
                        : 'border-[var(--admin-surface-border)] hover:bg-[var(--admin-surface-muted)]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[var(--cpp-ink)]">{item.title}</div>
                      <div className="truncate text-xs text-[var(--cpp-muted)]">
                        {item.status ?? 'unknown'}
                      </div>
                    </div>
                    {selected ? <span className="text-xs text-sky-700">Selected</span> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
        >
          Close
        </button>
        {value != null ? (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setSelectedLabel(null)
              setOpen(false)
            }}
            className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs text-red-700 hover:bg-red-50"
          >
            Clear selection
          </button>
        ) : null}
      </div>
    </div>
  )
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
