'use client'

import type { CSSProperties, ReactNode } from 'react'
import React from 'react'
import Link from 'next/link'

export type AdminCardVariant = 'form' | 'info' | 'meta' | 'summary' | 'alert'

type AdminCardProps = {
  children: ReactNode
  variant?: AdminCardVariant
  style?: CSSProperties
  className?: string
  as?: 'section' | 'div'
}

type AdminCardHeaderProps = {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  compact?: boolean
}

type AdminChipRowProps = {
  items: string[]
}

type AdminMiniCardProps = {
  title: string
  body: ReactNode
  variant?: Exclude<AdminCardVariant, 'form'>
}

type AdminActionCardProps = {
  href: string
  title: string
  description: ReactNode
  meta?: ReactNode
}

const baseCardStyle: CSSProperties = {
  borderRadius: 18,
  border: '1px solid rgba(23, 78, 177, 0.16)',
  background: 'rgba(255, 255, 255, 0.98)',
  boxShadow: '0 18px 34px rgba(18, 65, 147, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.72)',
  padding: '18px 20px',
  display: 'grid',
  gap: 14,
}

const cardVariantStyles: Record<AdminCardVariant, CSSProperties> = {
  form: {
    borderColor: 'rgba(23, 78, 177, 0.14)',
    background: 'rgba(255, 255, 255, 0.99)',
  },
  info: {
    borderColor: 'rgba(21, 83, 207, 0.22)',
    background: 'rgba(241, 247, 255, 0.98)',
    boxShadow: '0 18px 36px rgba(18, 65, 147, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.78)',
  },
  meta: {
    borderColor: 'rgba(23, 78, 177, 0.12)',
    background: 'rgba(249, 251, 255, 0.96)',
    boxShadow: '0 12px 24px rgba(18, 65, 147, 0.08)',
  },
  summary: {
    borderColor: 'rgba(21, 83, 207, 0.18)',
    background: 'rgba(244, 248, 255, 0.97)',
    boxShadow: '0 16px 30px rgba(18, 65, 147, 0.11)',
  },
  alert: {
    borderColor: 'rgba(180, 83, 9, 0.2)',
    background: 'rgba(255, 249, 241, 0.98)',
    boxShadow: '0 14px 28px rgba(146, 64, 14, 0.08)',
  },
}

export const adminCardTextStyles = {
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#0b61b9',
    fontWeight: 800,
  } satisfies CSSProperties,
  title: {
    fontSize: 18,
    lineHeight: 1.2,
    fontWeight: 800,
    color: 'var(--cpp-ink)',
    letterSpacing: '-0.01em',
  } satisfies CSSProperties,
  compactTitle: {
    fontSize: 15,
    lineHeight: 1.28,
    fontWeight: 800,
    color: 'var(--cpp-ink)',
    letterSpacing: '-0.01em',
  } satisfies CSSProperties,
  description: {
    fontSize: 13,
    color: 'var(--cpp-muted)',
    lineHeight: 1.65,
    maxWidth: 860,
  } satisfies CSSProperties,
  helper: {
    fontSize: 12,
    color: 'var(--cpp-muted)',
    lineHeight: 1.58,
  } satisfies CSSProperties,
}

export const adminChipStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 11px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  color: '#0b4aaf',
  background: 'rgba(21, 83, 207, 0.08)',
  border: '1px solid rgba(21, 83, 207, 0.14)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.54)',
}

export const adminInputShellStyle: CSSProperties = {
  border: '1px solid rgba(23, 78, 177, 0.14)',
  borderRadius: 12,
  padding: '10px 12px',
  background: 'rgba(255, 255, 255, 0.92)',
  color: 'var(--cpp-ink)',
  fontSize: 13,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.65)',
}

export const adminPrimaryActionStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 14px',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
  color: 'var(--cpp-ink)',
  background: 'rgba(255, 255, 255, 0.92)',
  border: '1px solid rgba(21, 83, 207, 0.22)',
  boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
  textDecoration: 'none',
}

export function getAdminCardStyle(
  variant: AdminCardVariant = 'form',
  style?: CSSProperties,
): CSSProperties {
  return {
    ...baseCardStyle,
    ...cardVariantStyles[variant],
    ...style,
  }
}

export function AdminCard({
  children,
  variant = 'form',
  style,
  className,
  as = 'section',
}: AdminCardProps) {
  const Tag = as
  const mergedClassName = className
    ? `admin-primitive-card admin-primitive-card--${variant} ${className}`
    : `admin-primitive-card admin-primitive-card--${variant}`
  return (
    <Tag className={mergedClassName} style={getAdminCardStyle(variant, style)}>
      {children}
    </Tag>
  )
}

export function AdminCardHeader({
  eyebrow,
  title,
  description,
  actions,
  compact = false,
}: AdminCardHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'grid', gap: compact ? 5 : 8 }}>
        {eyebrow ? <div style={adminCardTextStyles.eyebrow}>{eyebrow}</div> : null}
        <div style={compact ? adminCardTextStyles.compactTitle : adminCardTextStyles.title}>
          {title}
        </div>
        {description ? <div style={adminCardTextStyles.description}>{description}</div> : null}
      </div>
      {actions ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div> : null}
    </div>
  )
}

export function AdminChipRow({ items }: AdminChipRowProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <span key={item} style={adminChipStyle}>
          {item}
        </span>
      ))}
    </div>
  )
}

export function AdminMiniCard({
  title,
  body,
  variant = 'meta',
}: AdminMiniCardProps) {
  return (
    <AdminCard variant={variant} as="div" style={{ padding: '14px 15px', gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cpp-ink)' }}>{title}</div>
      <div style={adminCardTextStyles.helper}>{body}</div>
    </AdminCard>
  )
}

export function AdminActionCard({
  href,
  title,
  description,
  meta,
}: AdminActionCardProps) {
  return (
    <Link
      href={href}
      className="admin-primitive-card admin-primitive-card--form admin-primitive-card--action"
      style={{
        ...getAdminCardStyle('form', {
          padding: '16px 18px',
          gap: 8,
          textDecoration: 'none',
          color: 'var(--cpp-ink)',
          minHeight: 124,
        }),
      }}
    >
      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--cpp-ink)' }}>{title}</div>
        <div style={adminCardTextStyles.helper}>{description}</div>
      </div>
      {meta ? (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0b61b9' }}>
          {meta}
        </div>
      ) : null}
    </Link>
  )
}
