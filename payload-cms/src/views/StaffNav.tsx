'use client'

import React from 'react'
import { Link, useAuth } from '@payloadcms/ui'
import PageOrderList from './PageOrderList'

const navStyle: React.CSSProperties = {
  padding: '64px 14px 18px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  position: 'sticky',
  top: 0,
  alignSelf: 'flex-start',
  maxHeight: '100vh',
  overflowY: 'auto',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--cpp-muted, #5b6f66)',
  fontWeight: 700,
  marginTop: 28,
  paddingTop: 12,
}

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '10px 12px',
  borderRadius: 0,
  background: 'var(--admin-chip-bg)',
  color: 'var(--cpp-ink, #0b3d27)',
  border: '1px solid var(--admin-surface-border)',
  textDecoration: 'none',
  fontWeight: 600,
}

export default function StaffNav() {
  const { user } = useAuth()
  const role = (user as { role?: string } | null)?.role

  if (role !== 'staff' && role !== 'admin') {
    return null
  }

  return (
    <nav style={navStyle} aria-label="Staff navigation" className="admin-sidebar">
      <style>{`
        .admin-sidebar a {
          transition: transform 150ms ease, filter 150ms ease, box-shadow 150ms ease;
        }

        .admin-sidebar a:hover {
          filter: brightness(0.96);
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
        }

        .admin-sidebar a:active {
          transform: translateY(0);
        }
      `}</style>
      <div style={sectionTitleStyle}>Navigation bar pages</div>
      <Link href="/admin/collections/pages" style={linkStyle}>
        Manage Pages
      </Link>
      <div style={{ height: 1, background: 'rgba(15, 23, 42, 0.12)', margin: '8px 0' }} />
      <div style={{ marginTop: 8 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--cpp-muted)',
            border: '1px dashed var(--admin-surface-border)',
            background: 'var(--admin-surface-muted)',
            padding: '8px 10px',
            borderRadius: 0,
            width: 'fit-content',
            marginBottom: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>Tip</span>
          <span>Drag pages to reorder the navbar.</span>
        </div>
        <PageOrderList title={null} compact showHint={false} showEditLinks />
      </div>
    </nav>
  )
}
