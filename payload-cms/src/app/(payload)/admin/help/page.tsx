import React from 'react'
import Link from 'next/link'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { AdminHelp as AdminHelpType } from '@/payload-types'

type QuickAction = { label: string; desc: string; href: string }
type FaqItem = { question: string; answer: string }
type ResourceCard = { label: string; desc: string; href: string }

const defaultQuickActions: QuickAction[] = [
  {
    label: 'Getting Started',
    desc: 'Core dashboard orientation, navigation, and common workflows.',
    href: '/admin',
  },
  {
    label: 'Reporting Guide',
    desc: 'Period setup, RPPR checks, exports, and readiness expectations.',
    href: '/admin/reporting',
  },
  {
    label: 'Account & Access',
    desc: 'Profile settings, role boundaries, and access troubleshooting.',
    href: '/admin/account',
  },
]

const defaultFaqs: FaqItem[] = [
  {
    question: 'How do I prepare a reporting period for RPPR?',
    answer:
      'Create/activate a reporting period first, then open Reporting Center, review the compliance checklist, and resolve missing/partial items before export.',
  },
  {
    question: 'Where do I update participant RPPR metadata?',
    answer:
      'Use Accounts to complete participant type, project role, and organization fields. Incomplete participant metadata is flagged in Data Quality.',
  },
  {
    question: 'How do I manage products for NSF reporting?',
    answer:
      'Use Reporting Product Records to capture publications, patents, datasets, and software tied to the reporting period.',
  },
  {
    question: 'What should I do if reporting schema errors appear?',
    answer:
      'Run `pnpm payload migrate` with Node 20.6+ in `payload-cms`, restart dev, and refresh the reporting page.',
  },
]

const defaultResources: ResourceCard[] = [
  { label: 'Admin Documentation', href: '/admin/help', desc: 'Internal guidance and help content' },
  { label: 'Reporting Center', href: '/admin/reporting', desc: 'RPPR and period exports' },
  { label: 'Site Management', href: '/admin/site-management', desc: 'Navigation and global pages' },
]

const defaultTopicChips = ['Reporting', 'Courses', 'Classrooms', 'Quizzes', 'Troubleshooting']

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseQuickActions = (value: unknown): QuickAction[] => {
  if (!Array.isArray(value)) return defaultQuickActions
  const parsed = value
    .map((entry) => {
      if (!isRecord(entry)) return null
      const label = typeof entry.label === 'string' ? entry.label.trim() : ''
      const desc = typeof entry.desc === 'string' ? entry.desc.trim() : ''
      const href = typeof entry.href === 'string' ? entry.href.trim() : ''
      if (!label || !href) return null
      return { label, desc, href }
    })
    .filter((entry): entry is QuickAction => Boolean(entry))
  return parsed.length ? parsed : defaultQuickActions
}

const parseFaqs = (value: unknown): FaqItem[] => {
  if (!Array.isArray(value)) return defaultFaqs
  const parsed = value
    .map((entry) => {
      if (!isRecord(entry)) return null
      const question = typeof entry.question === 'string' ? entry.question.trim() : ''
      const answer = typeof entry.answer === 'string' ? entry.answer.trim() : ''
      if (!question || !answer) return null
      return { question, answer }
    })
    .filter((entry): entry is FaqItem => Boolean(entry))
  return parsed.length ? parsed : defaultFaqs
}

const parseResources = (value: unknown): ResourceCard[] => {
  if (!Array.isArray(value)) return defaultResources
  const parsed = value
    .map((entry) => {
      if (!isRecord(entry)) return null
      const label = typeof entry.label === 'string' ? entry.label.trim() : ''
      const desc = typeof entry.desc === 'string' ? entry.desc.trim() : ''
      const href = typeof entry.href === 'string' ? entry.href.trim() : ''
      if (!label || !href) return null
      return { label, desc, href }
    })
    .filter((entry): entry is ResourceCard => Boolean(entry))
  return parsed.length ? parsed : defaultResources
}

const parseTopicChips = (value: unknown): string[] => {
  if (!Array.isArray(value)) return defaultTopicChips
  const parsed = value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
  return parsed.length ? parsed : defaultTopicChips
}

export default async function AdminHelpPage() {
  const payload = await getPayload({ config: configPromise })
  const help = (await payload.findGlobal({
    slug: 'admin-help',
    overrideAccess: true,
  })) as AdminHelpType | null

  const title = help?.title ?? 'Help & Support'
  const subtitle =
    ((help as unknown as { subtitle?: string | null } | null)?.subtitle ??
      'Find quick guidance, reporting references, and escalation paths for the admin dashboard.')
      .toString()
      .trim()
  const supportEmail =
    (help as unknown as { supportEmail?: string | null } | null)?.supportEmail?.trim() ||
    process.env.SUPPORT_EMAIL ||
    'sbp-support@cpp.edu'
  const supportResponseTarget =
    (help as unknown as { supportResponseTarget?: string | null } | null)?.supportResponseTarget?.trim() ||
    'Within 1 business day'
  const supportRequestHref =
    (help as unknown as { supportRequestHref?: string | null } | null)?.supportRequestHref?.trim() ||
    '/admin/collections/feedback/create'

  const quickActions = parseQuickActions(
    (help as unknown as { quickActions?: unknown } | null)?.quickActions,
  )
  const faqs = parseFaqs((help as unknown as { faqs?: unknown } | null)?.faqs)
  const topicChips = parseTopicChips(
    (help as unknown as { topicChips?: unknown } | null)?.topicChips,
  )
  const resources = parseResources(
    (help as unknown as { resources?: unknown } | null)?.resources,
  )
  const body = help?.body

  return (
    <Gutter>
      <div style={{ maxWidth: 1120, margin: '20px auto 72px', color: 'var(--cpp-ink)' }}>
        <div
          style={{
            borderRadius: 12,
            border: '1px solid var(--admin-surface-border)',
            background: 'var(--admin-surface)',
            padding: '18px 20px',
            boxShadow: 'var(--admin-shadow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: 'var(--cpp-muted)',
                fontWeight: 700,
              }}
            >
              Support Hub
            </div>
            <h1 style={{ fontSize: 30, margin: '8px 0 8px' }}>{title}</h1>
            <p style={{ margin: 0, color: 'var(--cpp-muted)', lineHeight: 1.5 }}>{subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a
              href={`mailto:${supportEmail}`}
              style={{
                textDecoration: 'none',
                borderRadius: 10,
                padding: '10px 14px',
                background: '#111827',
                color: '#f8fafc',
                fontWeight: 700,
                border: '1px solid #111827',
                whiteSpace: 'nowrap',
              }}
            >
              Contact Admin
            </a>
            <Link
              href="/admin/globals/admin-help"
              style={{
                textDecoration: 'none',
                borderRadius: 10,
                padding: '10px 14px',
                background: '#f8fafc',
                color: 'var(--cpp-ink)',
                fontWeight: 700,
                border: '1px solid var(--admin-surface-border)',
                whiteSpace: 'nowrap',
              }}
            >
              Edit Help Portal
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 10,
          }}
        >
          {quickActions.map((item) => (
            <Link
              key={`${item.label}:${item.href}`}
              href={item.href}
              style={{
                textDecoration: 'none',
                borderRadius: 10,
                border: '1px solid var(--admin-surface-border)',
                background: 'var(--admin-surface)',
                padding: '12px 12px',
                color: 'var(--cpp-ink)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    border: '1px solid var(--admin-surface-border)',
                    background: '#f8fafc',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ?
                </span>
                <span style={{ fontWeight: 700 }}>{item.label}</span>
              </div>
              {item.desc ? (
                <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.45, color: 'var(--cpp-muted)' }}>
                  {item.desc}
                </p>
              ) : null}
            </Link>
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            border: '1px solid var(--admin-surface-border)',
            borderRadius: 12,
            background: 'var(--admin-surface)',
            padding: '14px 14px',
          }}
        >
          <input
            type="search"
            placeholder="Search help topics..."
            aria-label="Search help topics"
            style={{
              width: '100%',
              height: 40,
              borderRadius: 10,
              border: '1px solid var(--admin-surface-border)',
              background: '#ffffff',
              color: 'var(--cpp-ink)',
              padding: '0 12px',
              fontSize: 14,
            }}
          />
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topicChips.map((chip) => (
              <a
                key={chip}
                href="#"
                style={{
                  textDecoration: 'none',
                  border: '1px solid var(--admin-surface-border)',
                  borderRadius: 999,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--cpp-ink)',
                  background: '#f8fafc',
                }}
              >
                {chip}
              </a>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) minmax(260px, 1fr)',
            gap: 12,
          }}
        >
          <div
            style={{
              border: '1px solid var(--admin-surface-border)',
              borderRadius: 12,
              background: 'var(--admin-surface)',
              padding: 14,
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: 'var(--cpp-muted)',
                fontWeight: 700,
              }}
            >
              Frequently Asked Questions
            </div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {faqs.map((item) => (
                <details
                  key={item.question}
                  style={{
                    border: '1px solid var(--admin-surface-border)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    background: '#fbfcff',
                  }}
                >
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{item.question}</summary>
                  <p style={{ margin: '8px 0 2px', color: 'var(--cpp-muted)', lineHeight: 1.5 }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>

            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 1.1,
                  textTransform: 'uppercase',
                  color: 'var(--cpp-muted)',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Program-specific guidance
              </div>
              <div
                style={{
                  border: '1px solid var(--admin-surface-border)',
                  borderRadius: 10,
                  padding: 12,
                  color: 'var(--cpp-muted)',
                  lineHeight: 1.6,
                  background: '#fbfcff',
                }}
              >
                {body ? (
                  <RichText data={body} />
                ) : (
                  <p style={{ margin: 0 }}>
                    Add help content in the “Admin Help” global to customize this section.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--admin-surface-border)',
              borderRadius: 12,
              background: 'var(--admin-surface)',
              padding: 14,
              alignSelf: 'start',
              position: 'sticky',
              top: 88,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16 }}>Need help now?</div>
            <p style={{ margin: '8px 0 0', color: 'var(--cpp-muted)', lineHeight: 1.5 }}>
              For account blockers, reporting issues, or data inconsistencies, contact support and
              include a short screenshot + URL.
            </p>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              <div
                style={{
                  border: '1px solid var(--admin-surface-border)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  background: '#fbfcff',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Support email</div>
                <a href={`mailto:${supportEmail}`} style={{ color: 'var(--cpp-ink)', fontWeight: 700 }}>
                  {supportEmail}
                </a>
              </div>
              <div
                style={{
                  border: '1px solid var(--admin-surface-border)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  background: '#fbfcff',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Response target</div>
                <div style={{ fontWeight: 700 }}>{supportResponseTarget}</div>
              </div>
              <Link
                href={supportRequestHref}
                style={{
                  textDecoration: 'none',
                  textAlign: 'center',
                  borderRadius: 9,
                  background: '#111827',
                  color: '#f8fafc',
                  border: '1px solid #111827',
                  fontWeight: 700,
                  padding: '9px 10px',
                }}
              >
                Submit Support Request
              </Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 1.1,
              textTransform: 'uppercase',
              color: 'var(--cpp-muted)',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Resources
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 10,
            }}
          >
            {resources.map((item) => (
              <Link
                key={`${item.label}:${item.href}`}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  border: '1px solid var(--admin-surface-border)',
                  borderRadius: 10,
                  background: 'var(--admin-surface)',
                  padding: '12px 12px',
                  color: 'var(--cpp-ink)',
                }}
              >
                <div style={{ fontWeight: 700 }}>{item.label}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--cpp-muted)' }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Gutter>
  )
}
