'use client'

import React, { useEffect, useState } from 'react'
import SidePanel from '../courses/SidePanel'

type Props = {
  open: boolean
  onClose: () => void
  canCreateUsers: boolean
  onCreated?: (user: { id: string; email: string; role: string }) => void
}

type CreateUserResponse = {
  user?: {
    id: string | number
    email: string
    role: string
    firstName?: string | null
    lastName?: string | null
  }
  error?: string
}

const labelCls =
  'grid gap-1 text-[11px] font-bold uppercase tracking-wide text-[var(--cpp-muted)]'

const inputCls =
  'h-9 w-full rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 text-[13px] text-[var(--cpp-ink)] font-medium focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'

export default function CreateUserDrawer({ open, onClose, canCreateUsers, onCreated }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'admin' | 'staff' | 'professor'>('staff')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form whenever the drawer opens so a previous attempt doesn't bleed
  // into the next create.
  useEffect(() => {
    if (!open) return
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setRole('staff')
    setError(null)
    setSubmitting(false)
  }, [open])

  const disabled = !canCreateUsers || submitting || !email.trim() || !password

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    if (disabled) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      })
      const payload = (await response.json().catch(() => ({}))) as CreateUserResponse
      if (!response.ok) {
        setError(payload.error ?? 'Unable to create user.')
        return
      }
      const created = payload.user
      if (created) {
        onCreated?.({
          id: String(created.id),
          email: created.email,
          role: created.role,
        })
      }
      onClose()
    } catch {
      setError('Unable to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Create user"
      subtitle="Add a new admin-portal account."
      width="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-user-form"
            disabled={disabled}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-slate-800"
          >
            {submitting ? 'Creating…' : 'Create user'}
          </button>
        </div>
      }
    >
      {!canCreateUsers ? (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          Only admins can create admin-portal users.
        </div>
      ) : null}

      <form id="create-user-form" onSubmit={handleSubmit} className="grid gap-3">
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
        </label>

        <label className={labelCls}>
          <span>Password</span>
          <input
            className={inputCls}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className={labelCls}>
          <span>Role</span>
          <select
            className={inputCls}
            value={role}
            onChange={(event) => {
              const next = event.target.value
              if (next === 'admin' || next === 'professor' || next === 'staff') setRole(next)
            }}
          >
            <option value="staff">Staff — daily content + support tasks</option>
            <option value="professor">Professor — instructional access</option>
            <option value="admin">Admin — adds user-management permissions</option>
          </select>
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
