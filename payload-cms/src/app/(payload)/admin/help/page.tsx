import React from 'react'
import { Gutter } from '@payloadcms/ui'

export default function AdminHelpPage() {
  return (
    <Gutter>
      <div
        style={{
          maxWidth: 780,
          margin: '24px auto 64px',
          padding: '24px',
          borderRadius: 8,
          background: 'var(--admin-surface)',
          border: '1px solid var(--admin-surface-border)',
          boxShadow: 'var(--admin-shadow)',
          color: 'var(--cpp-ink)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: 'var(--cpp-muted)',
            fontWeight: 700,
          }}
        >
          Help
        </div>
        <h1 style={{ fontSize: 28, margin: '10px 0 12px' }}>
          NSF CURE Admin Help
        </h1>
        <p style={{ color: 'var(--cpp-muted)', lineHeight: 1.6 }}>
          This page is reserved for guidance on using the NSF CURE dashboard.
          Add your tips, workflows, and common troubleshooting steps here.
        </p>
        <div
          style={{
            marginTop: 18,
            padding: '14px 16px',
            borderRadius: 8,
            background: 'var(--admin-surface-muted)',
            border: '1px dashed var(--admin-surface-border)',
            color: 'var(--cpp-muted)',
            fontSize: 13,
          }}
        >
          Tip: You can edit this page by updating
          <strong> payload-cms/src/app/(payload)/admin/help/page.tsx</strong>.
        </div>
      </div>
    </Gutter>
  )
}
