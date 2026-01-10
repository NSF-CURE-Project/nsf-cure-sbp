import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { AdminHelp as AdminHelpType } from '@/payload-types'

export default async function AdminHelpPage() {
  const payload = await getPayload({ config: configPromise })
  const help = (await payload.findGlobal({
    slug: 'admin-help',
    overrideAccess: true,
  })) as AdminHelpType | null
  const title = help?.title ?? 'Admin Help'
  const body = help?.body

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
        <h1 style={{ fontSize: 28, margin: '10px 0 12px' }}>{title}</h1>
        {body ? (
          <div style={{ color: 'var(--cpp-muted)', lineHeight: 1.6 }}>
            <RichText data={body} />
          </div>
        ) : (
          <p style={{ color: 'var(--cpp-muted)', lineHeight: 1.6, margin: 0 }}>
            Add help content in the “Admin Help” global to customize this page.
          </p>
        )}
      </div>
    </Gutter>
  )
}
