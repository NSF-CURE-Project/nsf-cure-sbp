'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@payloadcms/ui'
import PageOrderList from '../PageOrderList'
import CreateUserDrawer from './CreateUserDrawer'
import EditUserDrawer from './EditUserDrawer'
import { HelpLink } from './HelpLink'

type Tab = 'general' | 'navigation' | 'users'

export type SiteUserRow = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'admin' | 'professor' | 'staff' | null
  updatedAt: string | null
}

type Props = {
  initialUsers: SiteUserRow[]
}

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'users', label: 'Users & Roles' },
]

const formatUserName = (user: SiteUserRow): string => {
  const parts = [user.firstName, user.lastName].filter((part): part is string => Boolean(part))
  return parts.length ? parts.join(' ') : '—'
}

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const ROLE_LABEL: Record<NonNullable<SiteUserRow['role']>, string> = {
  admin: 'Admin',
  professor: 'Professor',
  staff: 'Staff',
}

const ROLE_TONE: Record<NonNullable<SiteUserRow['role']>, string> = {
  admin: 'bg-red-100 text-red-800',
  professor: 'bg-sky-100 text-sky-800',
  staff: 'bg-emerald-100 text-emerald-800',
}

export default function SiteManagementWorkspace({ initialUsers }: Props) {
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab: Tab = (() => {
    const value = searchParams.get('tab')
    return value === 'navigation' || value === 'users' ? value : 'general'
  })()

  const canCreateUsers = auth.user?.role === 'admin'
  const canEditRoles = auth.user?.role === 'admin'
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SiteUserRow | null>(null)
  const [users, setUsers] = useState<SiteUserRow[]>(initialUsers)
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'professor' | 'staff'>('all')

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()
    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false
      if (!query) return true
      const haystack = [user.email, user.firstName ?? '', user.lastName ?? '']
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [users, userSearch, roleFilter])

  const changeTab = (next: Tab) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'general') params.delete('tab')
    else params.set('tab', next)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="smw-shell">
      <style>{styles}</style>

      <header className="smw-header">
        <div>
          <h1 className="smw-title">Site Management</h1>
          <p className="smw-subtitle">
            Configure branding, navigation, support content, and admin access.
          </p>
        </div>
        <HelpLink topic="site-management" />
      </header>

      <nav className="smw-tabs" role="tablist" aria-label="Site management sections">
        {TABS.map((entry) => {
          const active = tab === entry.id
          return (
            <button
              key={entry.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => changeTab(entry.id)}
              className={`smw-tab${active ? ' smw-tab--active' : ''}`}
            >
              {entry.label}
            </button>
          )
        })}
      </nav>

      {tab === 'general' ? <GeneralPanel /> : null}
      {tab === 'navigation' ? <NavigationPanel /> : null}
      {tab === 'users' ? (
        <UsersPanel
          users={filteredUsers}
          totalUsers={users.length}
          search={userSearch}
          onSearchChange={setUserSearch}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          canCreateUsers={canCreateUsers}
          onCreateClick={() => setDrawerOpen(true)}
          onManageClick={(user) => setEditingUser(user)}
        />
      ) : null}

      <CreateUserDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        canCreateUsers={canCreateUsers}
        onCreated={(created) => {
          // Optimistically prepend so the new row is visible without waiting
          // for a full server refresh; router.refresh() also fires so SSR
          // catches up.
          setUsers((prev) => [
            {
              id: created.id,
              email: created.email,
              firstName: null,
              lastName: null,
              role:
                created.role === 'admin' ||
                created.role === 'professor' ||
                created.role === 'staff'
                  ? created.role
                  : null,
              updatedAt: new Date().toISOString(),
            },
            ...prev.filter((user) => user.id !== created.id),
          ])
          router.refresh()
        }}
      />

      <EditUserDrawer
        user={editingUser}
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        canEditRoles={canEditRoles}
        onSaved={(next) => {
          setUsers((prev) => prev.map((user) => (user.id === next.id ? next : user)))
          router.refresh()
        }}
      />
    </div>
  )
}

function GeneralPanel() {
  const rows = [
    {
      title: 'Branding',
      description: 'Logo, favicon, theme colors.',
      href: '/admin/globals/site-branding',
    },
    {
      title: 'Footer',
      description: 'Footer links, contact info, feedback toggle.',
      href: '/admin/globals/footer',
    },
    {
      title: 'Help Portal',
      description: 'FAQ entries, support links, quick actions.',
      href: '/admin/globals/admin-help',
    },
  ]
  return (
    <ul className="smw-settings-list" aria-label="General settings">
      {rows.map((row) => (
        <li key={row.href} className="smw-settings-row">
          <div className="smw-settings-row__text">
            <div className="smw-settings-row__title">{row.title}</div>
            <div className="smw-settings-row__desc">{row.description}</div>
          </div>
          <Link href={row.href} className="smw-link-btn">
            Open
            <span aria-hidden className="smw-link-btn__arrow">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function NavigationPanel() {
  return (
    <section className="smw-panel" aria-label="Navigation pages">
      <div className="smw-panel__head">
        <div>
          <div className="smw-panel__title">Navigation pages</div>
          <div className="smw-panel__hint">
            Drag to reorder the public navigation. Pages added here appear in the site header.
          </div>
        </div>
        <Link href="/admin/pages/new" className="smw-primary-btn">
          + New page
        </Link>
      </div>
      <PageOrderList showEditLinks compact showHint={false} />
    </section>
  )
}

function UsersPanel({
  users,
  totalUsers,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  canCreateUsers,
  onCreateClick,
  onManageClick,
}: {
  users: SiteUserRow[]
  totalUsers: number
  search: string
  onSearchChange: (value: string) => void
  roleFilter: 'all' | 'admin' | 'professor' | 'staff'
  onRoleFilterChange: (value: 'all' | 'admin' | 'professor' | 'staff') => void
  canCreateUsers: boolean
  onCreateClick: () => void
  onManageClick: (user: SiteUserRow) => void
}) {
  return (
    <section className="smw-panel" aria-label="Users and roles">
      <div className="smw-panel__head">
        <div>
          <div className="smw-panel__title">Users &amp; roles</div>
          <div className="smw-panel__hint">
            Staff, professors, and admins who can sign into the admin portal.
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateClick}
          disabled={!canCreateUsers}
          title={canCreateUsers ? 'Create a new admin-portal user' : 'Only admins can create users'}
          className="smw-primary-btn"
        >
          + Create user
        </button>
      </div>

      <div className="smw-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email…"
          className="smw-input"
          aria-label="Search users"
        />
        <select
          value={roleFilter}
          onChange={(event) => {
            const next = event.target.value
            if (
              next === 'all' ||
              next === 'admin' ||
              next === 'professor' ||
              next === 'staff'
            ) {
              onRoleFilterChange(next)
            }
          }}
          className="smw-input smw-input--select"
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="professor">Professor</option>
          <option value="staff">Staff</option>
        </select>
        <span className="smw-toolbar__meta">
          {users.length} of {totalUsers}
        </span>
      </div>

      {users.length === 0 ? (
        <div className="smw-empty">
          {totalUsers === 0
            ? 'No admin-portal users yet. Create one to get started.'
            : 'No users match the current filter.'}
        </div>
      ) : (
        <div className="smw-table" role="table">
          <div className="smw-table__row smw-table__row--head" role="row">
            <div role="columnheader">Name</div>
            <div role="columnheader">Email</div>
            <div role="columnheader">Role</div>
            <div role="columnheader">Updated</div>
            <div role="columnheader" aria-label="Actions" />
          </div>
          {users.map((user) => {
            const updated = formatDate(user.updatedAt)
            return (
              <div key={user.id} className="smw-table__row" role="row">
                <div role="cell" className="smw-table__name">
                  {formatUserName(user)}
                </div>
                <div role="cell" className="smw-table__email">
                  {user.email || '—'}
                </div>
                <div role="cell">
                  {user.role ? (
                    <span className={`smw-pill ${ROLE_TONE[user.role]}`}>
                      {ROLE_LABEL[user.role]}
                    </span>
                  ) : (
                    <span className="smw-table__placeholder">—</span>
                  )}
                </div>
                <div role="cell" className="smw-table__updated">
                  {updated ?? '—'}
                </div>
                <div role="cell" className="smw-table__actions">
                  <button
                    type="button"
                    onClick={() => onManageClick(user)}
                    className="smw-link-btn smw-link-btn--small"
                  >
                    Manage
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

const styles = `
  .smw-shell {
    display: grid;
    gap: 18px;
    --smw-border: var(--admin-surface-border, #e2e8f0);
    --smw-border-strong: var(--admin-surface-border-strong, #c2ccda);
    --smw-surface: var(--admin-surface, #fff);
    --smw-surface-muted: var(--admin-surface-muted, #f5f7fa);
    --smw-ink: var(--cpp-ink, #0f172a);
    --smw-muted: var(--cpp-muted, #5d6b80);
  }
  .smw-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .smw-title { font-size: 22px; font-weight: 800; color: var(--smw-ink); margin: 0; letter-spacing: -0.01em; }
  .smw-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--smw-muted); max-width: 60ch; }

  .smw-tabs {
    display: inline-flex;
    gap: 2px;
    padding: 3px;
    border-radius: 8px;
    background: var(--smw-surface-muted);
    border: 1px solid var(--smw-border);
    align-self: flex-start;
  }
  .smw-tab {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--smw-muted);
    padding: 6px 12px;
    font-size: 12.5px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease;
  }
  .smw-tab:hover { color: var(--smw-ink); background: rgba(15, 23, 42, 0.04); }
  .smw-tab--active,
  .smw-tab--active:hover {
    background: var(--smw-surface);
    color: var(--smw-ink);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  }

  .smw-settings-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--smw-border);
  }
  .smw-settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 4px;
    border-bottom: 1px solid var(--smw-border);
  }
  .smw-settings-row__text { display: grid; gap: 2px; min-width: 0; }
  .smw-settings-row__title { font-size: 14px; font-weight: 600; color: var(--smw-ink); }
  .smw-settings-row__desc { font-size: 12.5px; color: var(--smw-muted); line-height: 1.45; }

  .smw-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 11px;
    border-radius: 7px;
    border: 1px solid var(--smw-border);
    background: var(--smw-surface);
    color: var(--smw-ink);
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 120ms ease, border-color 120ms ease;
  }
  .smw-link-btn:hover {
    background: var(--smw-surface-muted);
    border-color: var(--smw-border-strong);
  }
  .smw-link-btn--small { padding: 4px 10px; font-size: 11.5px; }
  .smw-link-btn__arrow { transition: transform 120ms ease; }
  .smw-link-btn:hover .smw-link-btn__arrow { transform: translateX(2px); }

  .smw-primary-btn {
    display: inline-flex;
    align-items: center;
    padding: 7px 13px;
    border-radius: 7px;
    border: 1px solid #0f172a;
    background: #0f172a;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 120ms ease;
  }
  .smw-primary-btn:hover { background: #1e293b; }
  .smw-primary-btn:disabled { cursor: not-allowed; opacity: 0.55; }
  :root[data-theme='dark'] .smw-primary-btn {
    background: #e2e8f0;
    color: #0f172a;
    border-color: #e2e8f0;
  }
  :root[data-theme='dark'] .smw-primary-btn:hover { background: #fff; }

  .smw-panel {
    display: grid;
    gap: 12px;
  }
  .smw-panel__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--smw-border);
  }
  .smw-panel__title { font-size: 15px; font-weight: 700; color: var(--smw-ink); }
  .smw-panel__hint { font-size: 12.5px; color: var(--smw-muted); margin-top: 2px; max-width: 60ch; }

  .smw-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .smw-toolbar__meta {
    font-size: 12px;
    color: var(--smw-muted);
    margin-left: auto;
  }
  .smw-input {
    height: 34px;
    padding: 0 11px;
    font-size: 13px;
    color: var(--smw-ink);
    background: var(--smw-surface);
    border: 1px solid var(--smw-border);
    border-radius: 7px;
    min-width: 220px;
  }
  .smw-input:focus {
    outline: none;
    border-color: rgba(14, 165, 233, 0.55);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
  }
  .smw-input--select { min-width: 140px; }

  .smw-empty {
    padding: 28px 16px;
    text-align: center;
    font-size: 13px;
    color: var(--smw-muted);
    background: var(--smw-surface-muted);
    border: 1px dashed var(--smw-border);
    border-radius: 8px;
  }

  .smw-table {
    border: 1px solid var(--smw-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--smw-surface);
  }
  .smw-table__row {
    display: grid;
    grid-template-columns: minmax(140px, 1.2fr) minmax(180px, 1.4fr) 110px 120px 88px;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-top: 1px solid var(--smw-border);
    font-size: 13px;
    color: var(--smw-ink);
  }
  .smw-table__row:first-child { border-top: 0; }
  .smw-table__row--head {
    background: var(--smw-surface-muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--smw-muted);
  }
  .smw-table__name { font-weight: 600; }
  .smw-table__email {
    color: var(--smw-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .smw-table__updated { font-size: 12.5px; color: var(--smw-muted); }
  .smw-table__actions { display: flex; justify-content: flex-end; }
  .smw-table__placeholder { color: var(--smw-muted); }
  @media (max-width: 720px) {
    .smw-table__row { grid-template-columns: 1fr; gap: 4px; }
    .smw-table__row--head { display: none; }
    .smw-table__actions { justify-content: flex-start; }
  }

  .smw-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
`
