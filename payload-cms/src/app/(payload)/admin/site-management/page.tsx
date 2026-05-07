'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Gutter, useAuth } from '@payloadcms/ui'
import { AdminUserCreatePanel } from '@/views/AdminUserCreatePanel'
import PageOrderList from '@/views/PageOrderList'
import { AdminSectionSwitcher } from '@/views/admin/AdminSectionSwitcher'
import {
  AdminActionCard,
  AdminCard,
  AdminCardHeader,
  AdminMiniCard,
  adminChipStyle,
} from '@/views/admin/AdminCardPrimitives'

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

        <AdminSectionSwitcher
          ariaLabel="Site management sections"
          items={siteManagementTabs}
          activeId={activeTab}
          onChange={handleTabChange}
          style={{ marginTop: 20 }}
        />

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
              <AdminActionCard
                href="/admin/globals/site-branding"
                title="Site Branding"
                description="Upload the program logo used on the student home page and browser tab icon."
                meta="Global"
              />
              <AdminActionCard
                href="/admin/globals/footer"
                title="Footer Content"
                description="Edit footer links, contact info, and enable or disable feedback availability."
                meta="Global"
              />
              <AdminActionCard
                href="/admin/globals/admin-help"
                title="Help Portal"
                description="Edit the Support Hub content, FAQ entries, quick actions, and support settings."
                meta="Global"
              />
            </div>
          </>
        ) : null}

        {activeTab === 'navigation' ? (
          <>
            <div style={sectionTitleStyle}>Navigation</div>
            <AdminCard variant="form" style={{ marginTop: 12 }}>
              <AdminCardHeader
                compact
                title="Navigation Pages"
                description="Drag to reorder public navigation pages, then create new pages when the site needs additional destinations."
                actions={
                  <Link
                    href="/admin/collections/pages/create"
                    style={{
                      ...adminChipStyle,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Create page
                  </Link>
                }
              />
              <div style={{ marginTop: 12 }}>
                <PageOrderList showEditLinks compact showHint={false} />
              </div>
            </AdminCard>
          </>
        ) : null}

        {activeTab === 'users' ? (
          <>
            <div style={sectionTitleStyle}>Users & Roles</div>
            <AdminCard
              variant="form"
              style={{
                marginTop: 12,
              }}
            >
              <AdminCardHeader
                compact
                title="Admin Portal Access"
                description="Open the users collection to update roles, reset passwords, and manage who can access the staff portal."
              />

              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                }}
              >
                <AdminActionCard
                  href="/admin/collections/users"
                  title="User Directory"
                  description="Review existing staff accounts and update names, emails, or roles."
                  meta="Collection"
                />
                <AdminActionCard
                  href="/admin/collections/users/create"
                  title="Full Create Form"
                  description="Open the full Payload create screen for new admin-portal users."
                  meta="Create"
                />
              </div>

              <AdminMiniCard
                title="Role guide"
                variant="info"
                body="`staff` supports daily content and student support tasks, `professor` supports instructional access, and `admin` adds user-management permissions."
              />

              <AdminUserCreatePanel canCreateUsers={canCreateUsers} />
            </AdminCard>
          </>
        ) : null}
      </div>
    </Gutter>
  )
}
