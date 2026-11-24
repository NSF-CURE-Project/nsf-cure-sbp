'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import SidePanel from '../courses/SidePanel'
import type { SiteUserRow } from './SiteManagementWorkspace'

type Props = {
  user: SiteUserRow | null
  open: boolean
  onClose: () => void
  // Caller decides whether the actor can change role assignments. Payload's
  // Users.access already gates the PATCH server-side; this just keeps the
  // role select from rendering when it would be denied.
  canEditRoles: boolean
  onSaved: (next: SiteUserRow) => void
}

type Role = 'admin' | 'professor' | 'staff'

const labelCls =
  'grid gap-1 text-[11px] font-bold uppercase tracking-wide text-[var(--cpp-muted)]'

const inputCls =
  'h-9 w-full rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 text-[13px] text-[var(--cpp-ink)] font-medium focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'

const extractErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const data = (await response.json()) as {
      message?: string
      errors?: Array<{ message?: string; field?: string }>
    }
    const detailed = (data.errors ?? [])
      .map((entry) => (entry.field ? `${entry.field}: ${entry.message}` : entry.message))
      .filter(Boolean)
      .join('; ')
    if (detailed) return detailed
    if (data.message) return data.message
  } catch {
    // body wasn't JSON
  }
  return fallback
}

export default function EditUserDrawer({
  user,
  open,
  onClose,
  canEditRoles,
  onSaved,
}: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('staff')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Seed the form whenever the drawer opens against a new user. (Closing
  // resets too so the next open isn't stale.)
  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setEmail(user.email ?? '')
    setRole((user.role ?? 'staff') as Role)
    setError(null)
    setSubmitting(false)
  }, [user])

  const disabled = !user || submitting || !email.trim()

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    if (!user || disabled) return
    setSubmitting(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      }
      if (canEditRoles) body.role = role

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        setError(await extractErrorMessage(response, 'Unable to save changes.'))
        return
      }

      onSaved({
        ...user,
        firstName: body.firstName as string,
        lastName: body.lastName as string,
        email: body.email as string,
        role: canEditRoles ? role : user.role,
        updatedAt: new Date().toISOString(),
      })
      onClose()
    } catch {
      setError('Unable to save changes.')
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'User'
    : 'User'

  return (
    <SidePanel
      open={open && Boolean(user)}
      onClose={onClose}
      title={`Manage ${displayName}`}
      subtitle={user?.email ?? undefined}
      width="md"
      footer={
        <div className="flex items-center justify-between gap-2">
          {user ? (
            <Link
              href={`/admin/collections/users/${user.id}`}
              className="text-xs font-semibold text-[var(--cpp-muted)] hover:text-[var(--cpp-ink)] hover:underline"
            >
              Open full editor →
            </Link>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-user-form"
              disabled={disabled}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-slate-800"
            >
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <label className={labelCls}>
            <span>First name</span>
            <input
              className={inputCls}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First name"
              autoComplete="given-name"
            />
          </label>
          <label className={labelCls}>
            <span>Last name</span>
            <input
              className={inputCls}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Last name"
              autoComplete="family-name"
            />
          </label>
        </div>

        <label className={labelCls}>
          <span>Email</span>
          <input
            className={inputCls}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@school.edu"
            autoComplete="email"
            required
          />
          <span className="text-[11px] font-medium normal-case tracking-normal text-[var(--cpp-muted)]">
            Used as the sign-in identifier. Changing this immediately requires the user to
            re-authenticate.
          </span>
        </label>

        <label className={labelCls}>
          <span>Role</span>
          <select
            className={inputCls}
            value={role}
            disabled={!canEditRoles}
            onChange={(event) => {
              const next = event.target.value
              if (next === 'admin' || next === 'professor' || next === 'staff') setRole(next)
            }}
          >
            <option value="staff">Staff — daily content + support</option>
            <option value="professor">Professor — instructional access</option>
            <option value="admin">Admin — adds user-management</option>
          </select>
          {!canEditRoles ? (
            <span className="text-[11px] font-medium normal-case tracking-normal text-[var(--cpp-muted)]">
              Only admins can change roles.
            </span>
          ) : null}
        </label>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </div>
        ) : null}
      </form>
    </SidePanel>
  )
}
