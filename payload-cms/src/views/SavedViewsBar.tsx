'use client'

import React, { useEffect, useState } from 'react'

type Scope = string

type SavedView<T> = {
  id: string
  name: string
  state: T
  savedAt: string
}

const STORAGE_PREFIX = 'sbp.savedViews.v1.'

const safeParse = <T,>(raw: string | null): SavedView<T>[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedView<T>[]) : []
  } catch {
    return []
  }
}

const writeToStorage = <T,>(scope: Scope, views: SavedView<T>[]) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_PREFIX + scope, JSON.stringify(views))
  } catch {
    // localStorage may be unavailable (Safari private mode etc.) — ignore.
  }
}

export function useSavedViews<T>(scope: Scope) {
  const [views, setViews] = useState<SavedView<T>[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setViews(safeParse<T>(window.localStorage.getItem(STORAGE_PREFIX + scope)))
  }, [scope])

  const save = (name: string, state: T) => {
    const view: SavedView<T> = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      state,
      savedAt: new Date().toISOString(),
    }
    const next = [view, ...views].slice(0, 25)
    setViews(next)
    writeToStorage(scope, next)
    return view
  }

  const remove = (id: string) => {
    const next = views.filter((v) => v.id !== id)
    setViews(next)
    writeToStorage(scope, next)
  }

  return { views, save, remove }
}

type Props<T> = {
  scope: Scope
  currentState: T
  onApply: (state: T) => void
}

export default function SavedViewsBar<T>({ scope, currentState, onApply }: Props<T>) {
  const { views, save, remove } = useSavedViews<T>(scope)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    save(trimmed, currentState)
    setName('')
    setAdding(false)
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          color: 'var(--cpp-muted)',
          fontWeight: 700,
          marginRight: 4,
        }}
      >
        Saved views
      </div>
      {views.length === 0 ? (
        <span style={{ color: 'var(--cpp-muted)' }}>none yet</span>
      ) : (
        views.map((v) => (
          <span
            key={v.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 6px 4px 10px',
              borderRadius: 999,
              border: '1px solid var(--admin-surface-border)',
              background: 'var(--admin-chip-bg)',
            }}
          >
            <button
              type="button"
              onClick={() => onApply(v.state)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: 'var(--cpp-ink)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 12,
              }}
              title={`Saved ${new Date(v.savedAt).toLocaleString()}`}
            >
              {v.name}
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete saved view "${v.name}"?`)) remove(v.id)
              }}
              aria-label={`Delete saved view ${v.name}`}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--cpp-muted)',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
                padding: '0 2px',
              }}
            >
              ×
            </button>
          </span>
        ))
      )}
      {adding ? (
        <span style={{ display: 'inline-flex', gap: 4 }}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
              if (e.key === 'Escape') {
                setAdding(false)
                setName('')
              }
            }}
            placeholder="View name"
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid var(--admin-surface-border)',
              background: 'var(--admin-panel-bg-muted)',
              color: 'var(--cpp-ink)',
              fontSize: 12,
              minWidth: 140,
            }}
          />
          <button
            type="button"
            onClick={submit}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid var(--admin-surface-border)',
              background: 'var(--admin-chip-primary-bg)',
              color: 'var(--admin-chip-primary-text)',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false)
              setName('')
            }}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid var(--admin-surface-border)',
              background: 'transparent',
              color: 'var(--cpp-muted)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px dashed var(--admin-surface-border)',
            background: 'transparent',
            color: 'var(--cpp-muted)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          + Save current
        </button>
      )}
    </div>
  )
}
