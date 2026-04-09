'use client'

import React, { useMemo, useState } from 'react'

const panelStyle: React.CSSProperties = {
  border: '1px solid var(--admin-surface-border)',
  borderRadius: 14,
  background: 'linear-gradient(170deg, #ffffff 0%, #eef6ff 100%)',
  padding: 14,
  boxShadow: '0 1px 0 rgba(15, 23, 42, 0.08)',
  display: 'grid',
  gap: 10,
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  fontSize: 12,
  color: 'var(--cpp-muted)',
}

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--admin-surface-border)',
  borderRadius: 10,
  padding: '9px 10px',
  background: '#ffffff',
  color: 'var(--cpp-ink)',
  fontSize: 13,
}

const buttonStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid #0b61b9',
  background: 'linear-gradient(140deg, #0b61b9 0%, #0c74d6 100%)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 13,
  padding: '10px 12px',
  cursor: 'pointer',
}

type Props = {
  canCreateUsers: boolean
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

export function AdminUserCreatePanel({ canCreateUsers }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'admin' | 'staff' | 'professor'>('staff')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdLabel, setCreatedLabel] = useState<string | null>(null)

  const disabled = useMemo(
    () => !canCreateUsers || submitting || !email.trim() || !password,
    [canCreateUsers, email, password, submitting],
  )

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    if (!canCreateUsers) return

    setSubmitting(true)
    setError(null)
    setCreatedLabel(null)
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role,
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as CreateUserResponse
      if (!response.ok) {
        setError(payload.error ?? 'Unable to create user.')
        return
      }
      const created = payload.user
      setCreatedLabel(created ? `${created.email} (${created.role})` : 'User created')
      setEmail('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setRole('staff')
    } catch {
      setError('Unable to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={panelStyle}>
      <div style={{ display: 'grid', gap: 3 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cpp-ink)' }}>Create Admin Portal User</div>
        <div style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.45 }}>
          Add a new staff, professor, or admin login directly from this dashboard.
        </div>
      </div>

      {!canCreateUsers ? (
        <div style={{ fontSize: 12, color: '#b91c1c' }}>
          Only admins can create admin-portal users.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <label style={labelStyle}>
            First name
            <input
              style={inputStyle}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First name"
              autoComplete="given-name"
            />
          </label>
          <label style={labelStyle}>
            Last name
            <input
              style={inputStyle}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Last name"
              autoComplete="family-name"
            />
          </label>
        </div>

        <label style={labelStyle}>
          Email
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@school.edu"
            autoComplete="email"
            required
          />
        </label>

        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'minmax(0, 1fr) 180px' }}>
          <label style={labelStyle}>
            Password
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label style={labelStyle}>
            Role
            <select
              style={inputStyle}
              value={role}
              onChange={(event) =>
                setRole(event.target.value === 'admin' || event.target.value === 'professor' ? event.target.value : 'staff')
              }
            >
              <option value="staff">Staff</option>
              <option value="professor">Professor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="submit" style={{ ...buttonStyle, opacity: disabled ? 0.65 : 1 }} disabled={disabled}>
            {submitting ? 'Creating…' : 'Create User'}
          </button>
          {createdLabel ? (
            <span style={{ fontSize: 12, color: '#166534', fontWeight: 700 }}>Created: {createdLabel}</span>
          ) : null}
          {error ? <span style={{ fontSize: 12, color: '#b91c1c', fontWeight: 700 }}>{error}</span> : null}
        </div>
      </form>
    </section>
  )
}

export default AdminUserCreatePanel
