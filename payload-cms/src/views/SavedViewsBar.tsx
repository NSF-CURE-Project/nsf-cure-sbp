'use client'

import React, { useCallback, useEffect, useState } from 'react'

type Owner = string | number | { id?: string | number; email?: string; firstName?: string; lastName?: string }

type SavedViewDoc<T> = {
  id: string | number
  name: string
  scope: string
  state: T
  shared: boolean
  owner?: Owner
  updatedAt?: string
  createdAt?: string
}

const ownerLabel = (owner: Owner | undefined) => {
  if (!owner) return null
  if (typeof owner === 'object') {
    const fn = (owner.firstName ?? '').trim()
    const ln = (owner.lastName ?? '').trim()
    if (fn || ln) return [fn, ln].filter(Boolean).join(' ')
    if (typeof owner.email === 'string') return owner.email
  }
  return null
}

const ownerId = (owner: Owner | undefined): string | number | null => {
  if (owner == null) return null
  if (typeof owner === 'object' && 'id' in owner) {
    return (owner as { id?: string | number }).id ?? null
  }
  return owner as string | number
}

type Props<T> = {
  scope: string
  currentState: T
  onApply: (state: T) => void
}

export default function SavedViewsBar<T>({ scope, currentState, onApply }: Props<T>) {
  const [views, setViews] = useState<SavedViewDoc<T>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [shared, setShared] = useState(false)
  const [busy, setBusy] = useState(false)
  const [meId, setMeId] = useState<string | number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('where[scope][equals]', scope)
      params.set('limit', '50')
      params.set('sort', '-updatedAt')
      params.set('depth', '1')
      const res = await fetch(`/api/saved-views?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setViews([])
          return
        }
        throw new Error('Unable to load saved views.')
      }
      const data = (await res.json()) as { docs?: SavedViewDoc<T>[] }
      setViews(Array.isArray(data.docs) ? data.docs : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load saved views.')
    } finally {
      setLoading(false)
    }
  }, [scope])

  useEffect(() => {
    load()
  }, [load])

  // Pull the current staff user id once so we can flag "yours" vs "team".
  useEffect(() => {
    let cancelled = false
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return
        if (d && typeof d === 'object' && 'user' in d) {
          const u = (d as { user?: { id?: string | number } }).user
          setMeId(u?.id ?? null)
        }
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/saved-views', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          scope,
          state: currentState,
          shared,
        }),
      })
      if (!res.ok) {
        throw new Error(res.status === 403 ? 'You do not have access.' : 'Unable to save view.')
      }
      setName('')
      setShared(false)
      setAdding(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save view.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string | number, viewName: string) => {
    if (!confirm(`Delete saved view "${viewName}"?`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/saved-views/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok && res.status !== 404) {
        throw new Error('Unable to delete view.')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete view.')
    } finally {
      setBusy(false)
    }
  }

  const toggleShare = async (view: SavedViewDoc<T>) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/saved-views/${view.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shared: !view.shared }),
      })
      if (!res.ok) {
        throw new Error('Unable to update view.')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update view.')
    } finally {
      setBusy(false)
    }
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
      {loading ? (
        <span style={{ color: 'var(--cpp-muted)' }}>loading…</span>
      ) : views.length === 0 ? (
        <span style={{ color: 'var(--cpp-muted)' }}>none yet</span>
      ) : (
        views.map((v) => {
          const isMine = meId != null && String(ownerId(v.owner)) === String(meId)
          const owner = ownerLabel(v.owner)
          return (
            <span
              key={String(v.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 6px 4px 10px',
                borderRadius: 999,
                border: '1px solid var(--admin-surface-border)',
                background: v.shared ? 'rgba(21, 83, 207, 0.08)' : 'var(--admin-chip-bg)',
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
                title={
                  v.shared
                    ? `Shared${owner ? ` by ${owner}` : ''}${v.updatedAt ? ` · updated ${new Date(v.updatedAt).toLocaleString()}` : ''}`
                    : `Private${v.updatedAt ? ` · updated ${new Date(v.updatedAt).toLocaleString()}` : ''}`
                }
              >
                {v.name}
              </button>
              <span style={{ fontSize: 10, color: 'var(--cpp-muted)', marginLeft: 2 }}>
                {v.shared ? 'team' : isMine ? 'mine' : ''}
              </span>
              {isMine ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleShare(v)}
                    title={v.shared ? 'Make private' : 'Share with team'}
                    aria-label={v.shared ? 'Make private' : 'Share with team'}
                    disabled={busy}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0 2px',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: 'var(--cpp-muted)',
                    }}
                  >
                    {v.shared ? '🔓' : '🔒'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(v.id, v.name)}
                    aria-label={`Delete saved view ${v.name}`}
                    disabled={busy}
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
                </>
              ) : null}
            </span>
          )
        })
      )}
      {adding ? (
        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
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
          <label style={{ display: 'inline-flex', gap: 4, alignItems: 'center', color: 'var(--cpp-muted)' }}>
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              style={{ margin: 0 }}
            />
            Share with team
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !name.trim()}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid var(--admin-surface-border)',
              background: 'var(--admin-chip-primary-bg)',
              color: 'var(--admin-chip-primary-text)',
              fontWeight: 700,
              fontSize: 12,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false)
              setName('')
              setShared(false)
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
      {error ? <span style={{ color: '#b91c1c', fontSize: 12 }}>{error}</span> : null}
    </div>
  )
}
