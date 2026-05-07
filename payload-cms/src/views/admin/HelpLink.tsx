import React from 'react'
import Link from 'next/link'
import { HELP_TOPICS } from '@/lib/adminHelpDocs'

type HelpLinkProps = {
  topic: (typeof HELP_TOPICS)[number]['id']
  label?: string
  /**
   * Visual variant. `chip` is a subtle pill (default), `inline` is a quieter
   * underlined link suitable for body copy.
   */
  variant?: 'chip' | 'inline'
  style?: React.CSSProperties
}

const findTopicTitle = (id: string): string =>
  HELP_TOPICS.find((entry) => entry.id === id)?.title ?? 'Help'

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 999,
  border: '1px solid var(--admin-surface-border, rgba(15, 23, 42, 0.12))',
  background: 'var(--admin-surface-muted, rgba(15, 23, 42, 0.04))',
  color: 'var(--cpp-ink)',
  fontSize: 12,
  fontWeight: 600,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  lineHeight: 1.2,
}

const inlineStyle: React.CSSProperties = {
  color: 'var(--admin-login-link, #0b61b9)',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'underline',
  textUnderlineOffset: 2,
}

export function HelpLink({ topic, label, variant = 'chip', style }: HelpLinkProps) {
  const resolvedLabel = label ?? `Help: ${findTopicTitle(topic)}`
  const merged: React.CSSProperties = {
    ...(variant === 'chip' ? chipStyle : inlineStyle),
    ...style,
  }
  return (
    <Link
      href={`/admin/help/${topic}`}
      style={merged}
      className={
        variant === 'chip' ? 'admin-help-link admin-help-link--chip' : 'admin-help-link'
      }
      aria-label={`Open help docs: ${findTopicTitle(topic)}`}
    >
      {variant === 'chip' ? (
        <span aria-hidden="true" style={{ fontSize: 13, lineHeight: 1 }}>
          ?
        </span>
      ) : null}
      <span>{resolvedLabel}</span>
    </Link>
  )
}

export default HelpLink
