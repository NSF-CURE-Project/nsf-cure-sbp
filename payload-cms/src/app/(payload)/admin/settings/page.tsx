'use client'

import React from 'react'
import { Gutter } from '@payloadcms/ui'
import PageOrderList from '@/views/PageOrderList'

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

export default function AdminSettingsPage() {
  return (
    <Gutter>
      <div style={{ maxWidth: 960, margin: '24px auto 80px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--cpp-ink)' }}>Settings</div>
        <p style={{ marginTop: 8, color: 'var(--cpp-muted)', maxWidth: 560 }}>
          Manage navigation order, page content, and admin guidance for the NSF CURE admin
          experience.
        </p>

        <div style={sectionTitleStyle}>Header & Footer</div>
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
            <a
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
            </a>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--cpp-muted)' }}>
            Drag to reorder navigation pages.
          </div>
          <div style={{ marginTop: 12 }}>
            <PageOrderList title={null} showEditLinks compact showHint={false} />
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <a href="/admin/globals/footer" style={linkCardStyle}>
            <div style={{ fontWeight: 700 }}>Footer Content</div>
            <div style={linkDescriptionStyle}>
              Edit footer links, contact info, and enable/disable feedback.
            </div>
          </a>
        </div>

        <div style={sectionTitleStyle}>Admin</div>
        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <a href="/admin/globals/admin-help" style={linkCardStyle}>
            <div style={{ fontWeight: 700 }}>Admin Help Page</div>
            <div style={linkDescriptionStyle}>
              Update guidance and onboarding content for staff.
            </div>
          </a>
        </div>
      </div>
    </Gutter>
  )
}
