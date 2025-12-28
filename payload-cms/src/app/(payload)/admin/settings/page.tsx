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
          Manage global navigation, header/footer content, and high-level pages for the NSF CURE
          admin experience.
        </p>

        <div style={sectionTitleStyle}>Navigation order</div>
        <div style={{ ...cardStyle, marginTop: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
            Navigation bar pages
          </div>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--cpp-muted)' }}>
            Drag to reorder how pages appear in the main site navigation.
          </p>
          <div style={{ marginTop: 12 }}>
            <PageOrderList title={null} showEditLinks compact showHint />
          </div>
        </div>

        <div style={sectionTitleStyle}>Header & footer</div>
        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}
        >
          <a href="/admin/collections/pages" style={linkCardStyle}>
            <div style={{ fontWeight: 700 }}>Header navigation pages</div>
            <div style={linkDescriptionStyle}>
              Manage titles, slugs, and visibility for pages that appear in the header.
            </div>
          </a>
          <a href="/admin/globals/contact-page" style={linkCardStyle}>
            <div style={{ fontWeight: 700 }}>Footer contact content</div>
            <div style={linkDescriptionStyle}>
              Update address, email, and other footer contact details.
            </div>
          </a>
          <a href="/admin/globals/resources-page" style={linkCardStyle}>
            <div style={{ fontWeight: 700 }}>Footer resources</div>
            <div style={linkDescriptionStyle}>
              Curate resource links shown in the footer and resources page.
            </div>
          </a>
        </div>

        <div style={sectionTitleStyle}>Global pages</div>
        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <a href="/admin/globals/home-page" style={linkCardStyle}>
            <div style={{ fontWeight: 700 }}>Home page</div>
            <div style={linkDescriptionStyle}>Edit the primary landing page content.</div>
          </a>
          <a href="/admin/globals/getting-started" style={linkCardStyle}>
            <div style={{ fontWeight: 700 }}>Getting started</div>
            <div style={linkDescriptionStyle}>Manage onboarding steps and resources.</div>
          </a>
          <a href="/admin/globals/resources-page" style={linkCardStyle}>
            <div style={{ fontWeight: 700 }}>Resources page</div>
            <div style={linkDescriptionStyle}>Organize support materials and links.</div>
          </a>
        </div>
      </div>
    </Gutter>
  )
}
