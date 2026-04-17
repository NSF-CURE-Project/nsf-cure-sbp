'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Gutter, useAuth } from '@payloadcms/ui'
import { AdminUserCreatePanel } from '@/views/AdminUserCreatePanel'
import PageOrderList from '@/views/PageOrderList'

type SiteManagementTab = 'general' | 'navigation' | 'users'

const siteManagementTabs: Array<{
  id: SiteManagementTab
  label: string
  description: string
}> = [
  {
    id: 'general',
    label: 'General',
    description: 'Branding, footer content, and support portal settings.',
  },
  {
    id: 'navigation',
    label: 'Navigation',
    description: 'Manage page order and add new public navigation pages.',
  },
  {
    id: 'users',
    label: 'Users & Roles',
    description: 'Manage admin-portal access for staff, professors, and admins.',
  },
]

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--cpp-muted)',
  fontWeight: 700,
  marginTop: 28,
}

const cardStyle: React.CSSProperties = {
  borderRadius: 8,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface)',
  boxShadow: 'var(--admin-shadow)',
  padding: '16px 18px',
}

const linkCardStyle: React.CSSProperties = {
  ...cardStyle,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  textDecoration: 'none',
  color: 'var(--cpp-ink)',
}

const linkDescriptionStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--cpp-muted)',
  lineHeight: 1.5,
}

const tabListStyle: React.CSSProperties = {
  marginTop: 20,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  padding: 6,
  borderRadius: 14,
  border: '1px solid var(--admin-surface-border)',
  background:
    'linear-gradient(160deg, rgba(237, 245, 255, 0.82) 0%, rgba(231, 247, 255, 0.92) 100%)',
}

const getTabButtonStyle = (active: boolean): React.CSSProperties => ({
  borderRadius: 10,
  border: active ? '1px solid rgba(11, 97, 185, 0.42)' : '1px solid transparent',
  background: active
    ? 'linear-gradient(135deg, rgba(11, 97, 185, 0.14) 0%, rgba(12, 116, 214, 0.2) 100%)'
    : 'transparent',
  color: active ? 'var(--cpp-ink)' : 'var(--cpp-muted)',
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: active ? 700 : 600,
  cursor: 'pointer',
  display: 'grid',
  gap: 3,
  minWidth: 170,
  textAlign: 'left',
})

export default function AdminSettingsPage() {
  const auth = useAuth()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const selectedTab = searchParams.get('tab')
  const activeTab: SiteManagementTab =
    selectedTab === 'navigation' || selectedTab === 'users' ? selectedTab : 'general'
  const canCreateUsers = auth.user?.role === 'admin'

  const handleTabChange = (nextTab: SiteManagementTab) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (nextTab === 'general') {
      nextParams.delete('tab')
    } else {
      nextParams.set('tab', nextTab)
    }

    const nextQuery = nextParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
  }

  return (
    <Gutter>
      <div style={{ maxWidth: 960, margin: '24px auto 80px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--cpp-ink)' }}>
          Site Management
        </div>
        <p style={{ marginTop: 8, color: 'var(--cpp-muted)', maxWidth: 560 }}>
          Manage branding, navigation, support content, and admin access for the NSF CURE admin
          experience.
        </p>

        <div role="tablist" aria-label="Site management sections" style={tabListStyle}>
          {siteManagementTabs.map((tab) => {
            const active = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTabChange(tab.id)}
                style={getTabButtonStyle(active)}
              >
                <span>{tab.label}</span>
                <span style={{ fontSize: 11, lineHeight: 1.45, fontWeight: 500 }}>
                  {tab.description}
                </span>
              </button>
            )
          })}
        </div>

        {activeTab === 'general' ? (
          <>
            <div style={sectionTitleStyle}>General</div>
            <div
              style={{
                marginTop: 12,
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              }}
            >
              <Link href="/admin/globals/site-branding" style={linkCardStyle}>
                <div style={{ fontWeight: 700 }}>Site Branding</div>
                <div style={linkDescriptionStyle}>
                  Upload the program logo used on the student home page and browser tab icon.
                </div>
              </Link>
              <Link href="/admin/globals/footer" style={linkCardStyle}>
                <div style={{ fontWeight: 700 }}>Footer Content</div>
                <div style={linkDescriptionStyle}>
                  Edit footer links, contact info, and enable/disable feedback.
                </div>
              </Link>
              <Link href="/admin/globals/admin-help" style={linkCardStyle}>
                <div style={{ fontWeight: 700 }}>Help Portal</div>
                <div style={linkDescriptionStyle}>
                  Edit the Support Hub content, FAQ entries, quick actions, and support settings.
                </div>
              </Link>
            </div>
          </>
        ) : null}

        {activeTab === 'navigation' ? (
          <>
            <div style={sectionTitleStyle}>Navigation</div>
            <div style={{ ...cardStyle, marginTop: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                  Navigation Pages
                </div>
                <Link
                  href="/admin/collections/pages/create"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--admin-surface-border)',
                    background: 'var(--admin-chip-bg)',
                    color: 'var(--cpp-ink)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Create page
                </Link>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--cpp-muted)' }}>
                Drag to reorder navigation pages.
              </div>
              <div style={{ marginTop: 12 }}>
                <PageOrderList showEditLinks compact showHint={false} />
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'users' ? (
          <>
            <div style={sectionTitleStyle}>Users & Roles</div>
            <div
              style={{
                ...cardStyle,
                marginTop: 12,
                display: 'grid',
                gap: 16,
              }}
            >
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                  Admin Portal Access
                </div>
                <div style={linkDescriptionStyle}>
                  Open the users collection to update roles, reset passwords, and manage who can
                  access the staff portal.
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                }}
              >
                <Link href="/admin/collections/users" style={linkCardStyle}>
                  <div style={{ fontWeight: 700 }}>User Directory</div>
                  <div style={linkDescriptionStyle}>
                    Review existing staff accounts and update names, emails, or roles.
                  </div>
                </Link>
                <Link href="/admin/collections/users/create" style={linkCardStyle}>
                  <div style={{ fontWeight: 700 }}>Full Create Form</div>
                  <div style={linkDescriptionStyle}>
                    Open the full Payload create screen for new admin-portal users.
                  </div>
                </Link>
              </div>

              <div
                style={{
                  borderRadius: 12,
                  border: '1px solid var(--admin-surface-border)',
                  background: 'linear-gradient(170deg, #ffffff 0%, #eef6ff 100%)',
                  padding: '12px 14px',
                  display: 'grid',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                  Role guide
                </div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.5 }}>
                  `staff` supports daily content and student support tasks, `professor` supports
                  instructional access, and `admin` adds user-management permissions.
                </div>
              </div>

              <AdminUserCreatePanel canCreateUsers={canCreateUsers} />
            </div>
          </>
        ) : null}
      </div>
    </Gutter>
  )
}
