import React from 'react'
import Link from 'next/link'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { AdminHelp as AdminHelpType } from '@/payload-types'
import { HELP_TOPICS, TOPIC_GLYPHS } from '@/lib/adminHelpDocs'

type FaqItem = { question: string; answer: string }

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

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

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
    .filter((e): e is FaqItem => Boolean(e))
  return parsed.length ? parsed : defaultFaqs
}

export default async function AdminHelpPage() {
  const payload = await getPayload({ config: configPromise })
  const help = (await payload.findGlobal({
    slug: 'admin-help',
    overrideAccess: true,
  })) as AdminHelpType | null

  const helpAny = help as unknown as Record<string, unknown> | null

  const title = help?.title ?? 'Help & Support'
  const subtitle =
    (typeof helpAny?.subtitle === 'string' ? helpAny.subtitle.trim() : '') ||
    'Find quick guidance, reporting references, and escalation paths for the admin dashboard.'
  const supportEmail =
    (typeof helpAny?.supportEmail === 'string' ? helpAny.supportEmail.trim() : '') ||
    process.env.SUPPORT_EMAIL ||
    'sbp-support@cpp.edu'
  const supportResponseTarget =
    (typeof helpAny?.supportResponseTarget === 'string'
      ? helpAny.supportResponseTarget.trim()
      : '') || 'Within 1 business day'
  const supportRequestHref =
    (typeof helpAny?.supportRequestHref === 'string' ? helpAny.supportRequestHref.trim() : '') ||
    '/admin/collections/feedback/create'

  const faqs = parseFaqs(helpAny?.faqs)

  return (
    <Gutter>
      <div style={{ maxWidth: 1120, margin: '20px auto 72px', color: 'var(--cpp-ink)' }}>
        {/* ── Header ── */}
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
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'var(--cpp-muted)',
                fontWeight: 700,
              }}
            >
              Support Hub
            </div>
            <h1 style={{ fontSize: 28, margin: '6px 0 6px', fontWeight: 800 }}>{title}</h1>
            <p style={{ margin: 0, color: 'var(--cpp-muted)', lineHeight: 1.55, maxWidth: 560 }}>
              {subtitle}
            </p>
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
                fontSize: 14,
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
                fontSize: 14,
              }}
            >
              Edit Help Portal
            </Link>
          </div>
        </div>

        {/* ── Topic Grid ── */}
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              color: 'var(--cpp-muted)',
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Browse by topic
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 10,
            }}
          >
            {HELP_TOPICS.map((topic) => (
              <Link
                key={topic.id}
                href={`/admin/help/${topic.id}`}
                style={{
                  textDecoration: 'none',
                  borderRadius: 12,
                  border: '1px solid var(--admin-surface-border)',
                  background: 'var(--admin-surface)',
                  padding: '14px 14px',
                  color: 'var(--cpp-ink)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: topic.accentColor + '18',
                      border: `1px solid ${topic.accentColor}30`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {TOPIC_GLYPHS[topic.id] ?? '📄'}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{topic.title}</span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: 'var(--cpp-muted)',
                  }}
                >
                  {topic.description}
                </p>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
                  {topic.primaryLinks.slice(0, 3).map((lnk) => (
                    <span
                      key={lnk.href}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 7px',
                        borderRadius: 999,
                        border: `1px solid ${topic.accentColor}40`,
                        color: topic.accentColor,
                        background: topic.accentColor + '0d',
                      }}
                    >
                      {lnk.label}
                    </span>
                  ))}
                  {topic.primaryLinks.length > 3 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 7px',
                        borderRadius: 999,
                        border: '1px solid var(--admin-surface-border)',
                        color: 'var(--cpp-muted)',
                        background: '#f8fafc',
                      }}
                    >
                      +{topic.primaryLinks.length - 3} more
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Lower: FAQs + Need Help ── */}
        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) minmax(260px, 1fr)',
            gap: 12,
            alignItems: 'start',
          }}
        >
          {/* FAQs */}
          <div
            style={{
              border: '1px solid var(--admin-surface-border)',
              borderRadius: 12,
              background: 'var(--admin-surface)',
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'var(--cpp-muted)',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Frequently Asked Questions
            </div>
            <div style={{ display: 'grid', gap: 7 }}>
              {faqs.map((item) => (
                <details
                  key={item.question}
                  style={{
                    border: '1px solid var(--admin-surface-border)',
                    borderRadius: 10,
                    padding: '9px 11px',
                    background: '#fbfcff',
                  }}
                >
                  <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    {item.question}
                  </summary>
                  <p
                    style={{
                      margin: '8px 0 2px',
                      color: 'var(--cpp-muted)',
                      lineHeight: 1.55,
                      fontSize: 13,
                    }}
                  >
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Need Help Now */}
          <div
            style={{
              border: '1px solid var(--admin-surface-border)',
              borderRadius: 12,
              background: 'var(--admin-surface)',
              padding: 16,
              position: 'sticky',
              top: 88,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16 }}>Need help now?</div>
            <p
              style={{
                margin: '7px 0 0',
                color: 'var(--cpp-muted)',
                lineHeight: 1.55,
                fontSize: 13,
              }}
            >
              For account blockers, reporting issues, or data inconsistencies, contact support and
              include a short screenshot + URL.
            </p>
            <div style={{ marginTop: 10, display: 'grid', gap: 7 }}>
              <div
                style={{
                  border: '1px solid var(--admin-surface-border)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  background: '#fbfcff',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--cpp-muted)', marginBottom: 2 }}>
                  Support email
                </div>
                <a
                  href={`mailto:${supportEmail}`}
                  style={{ color: 'var(--cpp-ink)', fontWeight: 700, fontSize: 14 }}
                >
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
                <div style={{ fontSize: 11, color: 'var(--cpp-muted)', marginBottom: 2 }}>
                  Response target
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{supportResponseTarget}</div>
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
                  padding: '10px 10px',
                  fontSize: 14,
                }}
              >
                Submit Support Request
              </Link>
            </div>

            <div
              style={{
                marginTop: 14,
                borderTop: '1px solid var(--admin-surface-border)',
                paddingTop: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  color: 'var(--cpp-muted)',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Daily checklist
              </div>
              {[
                'Review open questions',
                'Review unread platform feedback',
                'Check lesson feedback & reply',
                'Confirm planned content is published',
                'Validate quiz assignments',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 7,
                    marginBottom: 5,
                    fontSize: 13,
                    color: 'var(--cpp-muted)',
                  }}
                >
                  <span style={{ marginTop: 1, flexShrink: 0 }}>☐</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Gutter>
  )
}
