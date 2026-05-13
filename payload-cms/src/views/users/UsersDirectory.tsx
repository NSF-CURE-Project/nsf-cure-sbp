'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AdminCard,
  AdminCardHeader,
  AdminMiniCard,
  adminChipStyle,
  adminInputShellStyle,
} from '@/views/admin/AdminCardPrimitives'
import { HelpLink } from '@/views/admin/HelpLink'

export type AdminUserRow = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'admin' | 'professor' | 'staff' | null
  adminTheme: string | null
  updatedAt: string | null
}

type Props = {
  users: AdminUserRow[]
}

const roleLabel: Record<NonNullable<AdminUserRow['role']>, string> = {
  admin: 'Admin',
  professor: 'Professor',
  staff: 'Staff',
}

const roleBadgeStyle: Record<NonNullable<AdminUserRow['role']>, React.CSSProperties> = {
  admin: {
    background: 'rgba(220, 38, 38, 0.1)',
    color: '#b91c1c',
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  professor: {
    background: 'rgba(21, 83, 207, 0.1)',
    color: '#0b4aaf',
    borderColor: 'rgba(21, 83, 207, 0.2)',
  },
  staff: {
    background: 'rgba(15, 118, 110, 0.1)',
    color: '#0f766e',
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--cpp-muted)',
  fontWeight: 700,
  marginTop: 28,
}

type RoleFilter = 'all' | 'admin' | 'professor' | 'staff'

const formatName = (user: AdminUserRow): string => {
  const parts = [user.firstName, user.lastName].filter(Boolean) as string[]
  return parts.length ? parts.join(' ') : '—'
}

const formatUpdated = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function UsersDirectory({ users }: Props) {
  const [searchValue, setSearchValue] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const counts = useMemo(() => {
    const total = users.length
    const byRole = { admin: 0, professor: 0, staff: 0 }
    for (const user of users) {
      if (user.role && user.role in byRole) byRole[user.role] += 1
    }
    return { total, ...byRole }
  }, [users])

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false
      if (!query) return true
      const haystack = [user.email, user.firstName ?? '', user.lastName ?? '']
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [users, searchValue, roleFilter])

  const filterChips: Array<{ value: RoleFilter; label: string; count: number }> = [
    { value: 'all', label: 'All', count: counts.total },
    { value: 'admin', label: 'Admins', count: counts.admin },
    { value: 'professor', label: 'Professors', count: counts.professor },
    { value: 'staff', label: 'Staff', count: counts.staff },
  ]

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--cpp-ink)' }}>
            User Directory
          </div>
          <p style={{ marginTop: 8, color: 'var(--cpp-muted)', maxWidth: 560 }}>
            Review existing staff accounts and update names, emails, or roles.
          </p>
        </div>
        <HelpLink topic="site-management" />
      </div>

      <div style={sectionTitleStyle}>Admin Portal Access</div>
      <AdminCard variant="form" style={{ marginTop: 12 }}>
        <AdminCardHeader
          compact
          title="Staff accounts"
          description="Search by name or email, then open a row to update roles or reset passwords."
          actions={
            <Link
              href="/admin/collections/users/create"
              style={{
                ...adminChipStyle,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Create user
            </Link>
          }
        />

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <input
            type="search"
            placeholder="Search by name or email…"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            aria-label="Search users"
            style={{
              ...adminInputShellStyle,
              flex: '1 1 280px',
              minWidth: 240,
              minHeight: 38,
            }}
          />
          <div
            role="tablist"
            aria-label="Filter by role"
            style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}
          >
            {filterChips.map((chip) => {
              const selected = roleFilter === chip.value
              return (
                <button
                  key={chip.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setRoleFilter(chip.value)}
                  style={{
                    padding: '7px 11px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selected
                      ? '1px solid #0b61b9'
                      : '1px solid rgba(21, 83, 207, 0.18)',
                    background: selected ? '#0b61b9' : 'rgba(255, 255, 255, 0.92)',
                    color: selected ? '#ffffff' : '#0b4aaf',
                  }}
                >
                  {chip.label}
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      opacity: selected ? 0.85 : 0.7,
                    }}
                  >
                    {chip.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {users.length === 0 ? (
          <div
            style={{
              padding: '20px',
              borderRadius: 12,
              border: '1px dashed rgba(23, 78, 177, 0.2)',
              background: 'rgba(244, 248, 255, 0.6)',
              color: 'var(--cpp-muted)',
              fontSize: 13,
            }}
          >
            No admin-portal users yet.
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: '20px',
              borderRadius: 12,
              border: '1px dashed rgba(23, 78, 177, 0.2)',
              background: 'rgba(244, 248, 255, 0.6)',
              color: 'var(--cpp-muted)',
              fontSize: 13,
            }}
          >
            No users match the current filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {filtered.map((user) => {
              const role = user.role ?? 'staff'
              const updated = formatUpdated(user.updatedAt)
              return (
                <Link
                  key={user.id}
                  href={`/admin/collections/users/${user.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(23, 78, 177, 0.14)',
                    background: 'rgba(255, 255, 255, 0.96)',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: '0 4px 10px rgba(18, 65, 147, 0.04)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--cpp-ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatName(user)}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: 'var(--cpp-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.email}
                      {updated ? <span> · Updated {updated}</span> : null}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      border: '1px solid',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      whiteSpace: 'nowrap',
                      ...roleBadgeStyle[role],
                    }}
                  >
                    {roleLabel[role]}
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        <AdminMiniCard
          title="Role guide"
          variant="info"
          body="`staff` supports daily content and student support tasks, `professor` supports instructional access, and `admin` adds user-management permissions."
        />
      </AdminCard>
    </>
  )
}
