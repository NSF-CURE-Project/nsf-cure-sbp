'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  searchMedia,
  uploadMedia,
  type MediaSearchResult,
} from '../courses-order-api'

type MediaPickerProps = {
  value: string | number | null
  onChange: (next: string | number | null) => void
  // Constrain the OS file picker. `videoBlock.video` uses video/*; other
  // blocks could pass image/* etc.
  accept?: string
  // Helpful description shown next to the search box.
  noun?: string
}

// Pick or upload a `media` doc. Closed state: chip + change/clear buttons.
// Open state: search existing + drag/drop or click-to-upload new file.
export default function MediaPicker({
  value,
  onChange,
  accept,
  noun = 'media',
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MediaSearchResult[]>([])
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<MediaSearchResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Cache the selected doc so the chip shows filename/preview even without
  // a fresh search. When the picker opens and finds a hit, refresh it.
  useEffect(() => {
    if (value == null) {
      setSelectedDoc(null)
      return
    }
    const hit = results.find((m) => String(m.id) === String(value))
    if (hit) setSelectedDoc(hit)
  }, [value, results])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setBusy(true)
    const handle = setTimeout(async () => {
      try {
        const docs = await searchMedia(query)
        if (!cancelled) setResults(docs)
      } finally {
        if (!cancelled) setBusy(false)
      }
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [open, query])

  const handleUpload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const created = await uploadMedia(file)
      setSelectedDoc(created)
      onChange(created.id)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        {value != null ? (
          <span className="inline-flex items-center gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-2 py-1 text-sm">
            <span className="font-medium text-[var(--cpp-ink)]">
              {selectedDoc?.filename ?? `Media #${value}`}
            </span>
            {selectedDoc?.mimeType ? (
              <span className="text-xs text-[var(--cpp-muted)]">{selectedDoc.mimeType}</span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setSelectedDoc(null)
              }}
              className="text-xs text-[var(--cpp-muted)] hover:text-red-700"
              aria-label={`Clear ${noun}`}
            >
              ×
            </button>
          </span>
        ) : (
          <span className="text-xs text-[var(--cpp-muted)]">No {noun} attached</span>
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
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${noun} by filename…`}
          className="flex-1 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-[var(--admin-surface-border)] px-2 py-2 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : 'Upload new'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => handleUpload(event.target.files?.[0])}
        />
      </div>
      <div className="max-h-56 overflow-y-auto pr-1">
        {busy ? (
          <div className="text-xs text-[var(--cpp-muted)]">Searching…</div>
        ) : results.length === 0 ? (
          <div className="text-xs text-[var(--cpp-muted)]">
            {query ? `No matching ${noun}.` : `Start typing to search, or upload a new file.`}
          </div>
        ) : (
          <ul className="grid gap-1">
            {results.map((doc) => {
              const selected = String(doc.id) === String(value)
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(doc.id)
                      setSelectedDoc(doc)
                      setOpen(false)
                    }}
                    className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition ${
                      selected
                        ? 'border-sky-400 bg-sky-50'
                        : 'border-[var(--admin-surface-border)] hover:bg-[var(--admin-surface-muted)]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[var(--cpp-ink)]">
                        {doc.filename ?? `Media #${doc.id}`}
                      </div>
                      <div className="truncate text-xs text-[var(--cpp-muted)]">
                        {doc.mimeType ?? 'unknown type'}
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
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
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
              setSelectedDoc(null)
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
