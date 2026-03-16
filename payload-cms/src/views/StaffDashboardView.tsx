import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import React from 'react'
import Link from 'next/link'
import { getReportingSummary } from '../utils/analyticsSummary'
import { findAllDocs } from '../reporting/data'

const cppGold = 'var(--cpp-muted)'
const cppInk = 'var(--cpp-ink)'
const ratingScoreMap: Record<string, number> = {
  not_helpful: 1,
  somewhat_helpful: 2,
  helpful: 3,
  very_helpful: 4,
}

const resolveRatingScore = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && ratingScoreMap[value] != null) {
    return ratingScoreMap[value]
  }
  return null
}

const statCardStyle: React.CSSProperties = {
  border: '1px solid var(--admin-surface-border)',
  borderRadius: 12,
  padding: '12px 14px',
  background: 'var(--admin-surface)',
  boxShadow: '0 1px 0 rgba(15, 23, 42, 0.06)',
  minWidth: 0,
  textAlign: 'left',
}


const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div style={statCardStyle} className="dashboard-stat-card">
    <div
      style={{
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--cpp-muted)',
        opacity: 0.9,
        fontWeight: 700,
        lineHeight: 1.1,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 28, fontWeight: 900, color: cppInk, marginTop: 8, lineHeight: 1 }}>
      {value}
    </div>
    <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 6 }}>
      {value === '—' ? 'No data yet' : 'Updated from current activity'}
    </div>
  </div>
)

const containerStyle: React.CSSProperties = {
  maxWidth: 1200,
  width: '100%',
  margin: '0 auto',
  padding: '24px 16px 48px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  alignItems: 'center',
}
const contentBoxStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1120,
  alignSelf: 'center',
  margin: '0 auto',
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  color: 'var(--cpp-muted)',
  marginTop: 12,
  fontWeight: 800,
  alignSelf: 'center',
  textAlign: 'left',
  width: '100%',
  maxWidth: 1120,
}

const contentHealthCardStyle: React.CSSProperties = {
  borderRadius: 0,
  border: '1px solid transparent',
  background: 'var(--admin-surface)',
  padding: '12px 14px',
  boxShadow: 'none',
}

const workspaceCardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface)',
  padding: '12px',
  boxShadow: 'none',
  width: '100%',
  minWidth: 0,
  minHeight: 118,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 8,
  textAlign: 'left',
}

const analyticsRowStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  width: '100%',
}


const heroGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(280px, 1fr)',
  gap: 10,
  width: '100%',
  alignItems: 'center',
}

const summaryPanelStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface)',
  boxShadow: '0 1px 0 rgba(15, 23, 42, 0.06)',
  padding: '14px 16px',
}

const moduleRowStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface)',
  padding: '14px 16px',
  boxShadow: '0 1px 0 rgba(15, 23, 42, 0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 14,
  flexWrap: 'wrap',
}

const moduleMetaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
}

const moduleIconStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface-muted)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--cpp-ink)',
  flexShrink: 0,
}

const ModuleIcon = ({ children }: { children: React.ReactNode }) => (
  <div style={moduleIconStyle} aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </div>
)

const mockHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
}

const mockChipStyle: React.CSSProperties = {
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 0.1,
  background: 'var(--admin-surface)',
  color: cppInk,
  border: '1px solid var(--admin-surface-border)',
  boxShadow: '0 4px 10px rgba(15, 23, 42, 0.12)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 34,
}

const heroPrimaryStyle: React.CSSProperties = {
  ...mockChipStyle,
  background: 'var(--admin-chip-primary-bg)',
  color: 'var(--admin-chip-primary-text)',
  borderColor: 'rgba(148, 163, 184, 0.35)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
}

const heroSecondaryStyle: React.CSSProperties = {
  ...mockChipStyle,
  background: 'transparent',
  borderColor: 'rgba(148, 163, 184, 0.4)',
  color: cppInk,
  boxShadow: 'none',
}

type ContentHealthTone = 'completion' | 'questions' | 'helpfulness'

type ContentHealthItem = {
  id: string | number
  title: string
  metric: string
  href: string
  actionLabel?: string
}

const contentHealthToneStyles: Record<
  ContentHealthTone,
  { accent: string; iconBg: string; badgeBg: string }
> = {
  completion: {
    accent: '#1d4ed8',
    iconBg: 'rgba(37, 99, 235, 0.12)',
    badgeBg: 'rgba(37, 99, 235, 0.1)',
  },
  questions: {
    accent: '#0f766e',
    iconBg: 'rgba(15, 118, 110, 0.12)',
    badgeBg: 'rgba(15, 118, 110, 0.1)',
  },
  helpfulness: {
    accent: '#9a3412',
    iconBg: 'rgba(154, 52, 18, 0.12)',
    badgeBg: 'rgba(154, 52, 18, 0.1)',
  },
}

const ContentHealthCard = ({
  title,
  description,
  emptyMessage,
  tone,
  icon,
  items,
}: {
  title: string
  description: string
  emptyMessage: string
  tone: ContentHealthTone
  icon: React.ReactNode
  items: ContentHealthItem[]
}) => {
  const toneStyle = contentHealthToneStyles[tone]
  const hasItems = items.length > 0
  const visibleItems = items.slice(0, 4)
  const hiddenCount = Math.max(items.length - visibleItems.length, 0)

  return (
    <section className="content-health-card" style={{ borderTop: `2px solid ${toneStyle.accent}` }}>
      <div className="content-health-card-header">
        <div className="content-health-card-header-main">
          <span
            className="content-health-card-icon"
            style={{
              background: toneStyle.iconBg,
              color: toneStyle.accent,
              borderColor: toneStyle.badgeBg,
            }}
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {icon}
            </svg>
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="content-health-card-title">{title}</div>
            <p className="content-health-card-description">{description}</p>
          </div>
        </div>
        <span
          className="content-health-card-status"
          style={{
            color: toneStyle.accent,
            background: toneStyle.badgeBg,
            borderColor: toneStyle.iconBg,
          }}
        >
          {hasItems ? `${items.length} flagged` : 'No flags'}
        </span>
      </div>
      {hasItems ? (
        <ul className="content-health-list">
          {visibleItems.map((item) => (
            <li key={String(item.id)} className="content-health-item">
              <div style={{ minWidth: 0 }}>
                <Link href={item.href} className="content-health-item-title">
                  {item.title}
                </Link>
                <div className="content-health-item-metric">{item.metric}</div>
              </div>
              <Link href={item.href} className="content-health-item-action">
                {item.actionLabel ?? 'Review'}
              </Link>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li className="content-health-more">
              {hiddenCount} more flagged {hiddenCount === 1 ? 'lesson' : 'lessons'}
            </li>
          ) : null}
        </ul>
      ) : (
        <div className="content-health-empty">
          <div className="content-health-empty-title">No items need review</div>
          <p className="content-health-empty-message">{emptyMessage}</p>
        </div>
      )}
    </section>
  )
}

const StaffDashboardContent = ({
  user,
  stats,
  contentHealth,
  reporting,
}: {
  user?: AdminViewServerProps['initPageResult']['req']['user']
  stats: {
    accounts: number
    unanswered: number
    unreadFeedback: number
    helpfulnessAvg: number | null
    activeStudents: number
    publishedLessons: number
    avgCompletion: number | null
  }
  contentHealth: {
    lowCompletion: { id: string | number; title: string; rate: number }[]
    highQuestions: { id: string | number; title: string; count: number }[]
    lowHelpfulness: { id: string | number; title: string; rating: number }[]
  }
  reporting: {
    classCompletion: {
      id: string
      title: string
      uniqueLearnersStarted: number
      uniqueLearnersCompleted: number
      completionRate: number
    }[]
    chapterCompletion: {
      id: string
      title: string
      uniqueLearnersStarted: number
      uniqueLearnersCompleted: number
      completionRate: number
    }[]
    quizPerformance: {
      quizId: string
      title: string
      uniqueLearnersAttempted: number
      uniqueLearnersMastered: number
      masteryRate: number
      attempts: number
    }[]
    weeklyEngagement: { weekStart: string; activeStudents: number; weekOverWeekChange: number | null }[]
  }
}) => (
  <Gutter>
    <style>{`
      .quick-action-card > div {
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }
      .quick-action-card:hover > div {
        transform: translateY(-2px);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14);
        border-color: rgba(15, 23, 42, 0.28);
      }
      .quick-action-card:active > div {
        transform: translateY(0);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
      }
      .dashboard-card {
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }
      .dashboard-card-link:hover .dashboard-card {
        transform: translateY(-2px);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.12);
        border-color: rgba(15, 23, 42, 0.22);
      }
      .dashboard-card-link:active .dashboard-card {
        transform: translateY(0);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
      }
      .dashboard-chip {
        transition: box-shadow 150ms ease, border-color 150ms ease;
      }
      .dashboard-chip:hover {
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
      }
      .dashboard-chip-link {
        display: inline-flex;
        text-decoration: none;
      }
      .dashboard-chip--link {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        filter: none !important;
      }
      .dashboard-chip--link:hover {
        box-shadow: none;
        transform: none;
      }
      .dashboard-stat-card {
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }
      .dashboard-stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.12);
        border-color: rgba(15, 23, 42, 0.22);
      }
      .dashboard-panel {
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }
      .dashboard-panel:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
        border-color: rgba(15, 23, 42, 0.22);
      }
      .dashboard-top-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
      }
      .dashboard-kpi-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .dashboard-quick-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .dashboard-module-description {
        font-size: 12px;
        color: var(--cpp-muted);
        margin-top: 4px;
        line-height: 1.45;
        max-width: 620px;
      }
      .content-health-heading {
        margin-top: 10px;
        margin-bottom: 12px;
      }
      .content-health-heading-title {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.9px;
        text-transform: uppercase;
        color: var(--cpp-muted);
      }
      .content-health-heading-subtitle {
        margin: 6px 0 0;
        font-size: 13px;
        line-height: 1.5;
        color: var(--cpp-muted);
        max-width: 780px;
      }
      .content-health-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .content-health-card {
        border-radius: 14px;
        border: 1px solid var(--admin-surface-border);
        background: var(--admin-surface);
        padding: 12px;
        box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
      }
      .content-health-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }
      .content-health-card-header-main {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        min-width: 0;
      }
      .content-health-card-icon {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: 1px solid transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .content-health-card-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--cpp-ink);
        line-height: 1.35;
      }
      .content-health-card-description {
        font-size: 12px;
        color: var(--cpp-muted);
        margin: 4px 0 0;
        line-height: 1.45;
      }
      .content-health-card-status {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.02em;
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid transparent;
        white-space: nowrap;
      }
      .content-health-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }
      .content-health-item {
        border: 1px solid var(--admin-surface-border);
        border-radius: 10px;
        background: var(--admin-surface-muted);
        padding: 10px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .content-health-item-title {
        text-decoration: none;
        color: var(--cpp-ink);
        font-size: 13px;
        font-weight: 700;
        line-height: 1.35;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .content-health-item-title:hover {
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .content-health-item-metric {
        font-size: 12px;
        color: var(--cpp-muted);
        margin-top: 3px;
      }
      .content-health-item-action {
        text-decoration: none;
        font-size: 12px;
        font-weight: 700;
        color: var(--cpp-ink);
        border: 1px solid var(--admin-surface-border);
        border-radius: 999px;
        background: var(--admin-surface);
        padding: 4px 9px;
        flex-shrink: 0;
        transition: background 140ms ease, border-color 140ms ease;
      }
      .content-health-item-action:hover {
        background: var(--admin-surface-muted);
        border-color: rgba(148, 163, 184, 0.45);
      }
      .content-health-item-action:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.28);
      }
      .content-health-more {
        font-size: 12px;
        color: var(--cpp-muted);
        padding: 2px 2px 0;
      }
      .content-health-empty {
        border: 1px dashed var(--admin-surface-border);
        border-radius: 10px;
        background: var(--admin-surface-muted);
        padding: 12px;
      }
      .content-health-empty-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--cpp-ink);
      }
      .content-health-empty-message {
        margin: 4px 0 0;
        font-size: 12px;
        line-height: 1.45;
        color: var(--cpp-muted);
      }
      @media (max-width: 980px) {
        .dashboard-top-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .dashboard-kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .dashboard-quick-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .content-health-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 680px) {
        .dashboard-kpi-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .dashboard-quick-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .content-health-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      [data-theme='dark'] .dashboard-chip,
      [data-theme='dark'] .dashboard-chip:hover,
      [data-theme='dark'] .dashboard-chip:focus,
      [data-theme='dark'] .dashboard-chip:focus-visible,
      [data-theme='dark'] .dashboard-stat-card,
      [data-theme='dark'] .dashboard-stat-card:hover,
      [data-theme='dark'] .dashboard-stat-card:focus,
      [data-theme='dark'] .dashboard-stat-card:focus-visible,
      [data-theme='dark'] .dashboard-panel,
      [data-theme='dark'] .dashboard-panel:hover,
      [data-theme='dark'] .dashboard-panel:focus,
      [data-theme='dark'] .dashboard-panel:focus-visible,
      [data-theme='dark'] .dashboard-card,
      [data-theme='dark'] .dashboard-card:hover,
      [data-theme='dark'] .dashboard-card:focus,
      [data-theme='dark'] .dashboard-card:focus-visible {
        box-shadow: none !important;
        filter: none !important;
        transform: none !important;
      }
      [data-theme='dark'] .content-health-item {
        background: rgba(15, 23, 42, 0.28);
        border-color: rgba(148, 163, 184, 0.3);
      }
      [data-theme='dark'] .content-health-item-action {
        background: rgba(15, 23, 42, 0.42);
      }
      [data-theme='dark'] .content-health-item-action:hover {
        background: rgba(30, 41, 59, 0.72);
      }
      [data-theme='dark'] .content-health-empty {
        background: rgba(15, 23, 42, 0.28);
      }
    `}</style>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={containerStyle}>
        <div
          style={{
            width: '100%',
            maxWidth: 1120,
            margin: '0 auto',
            borderRadius: 14,
            padding: '12px 18px 14px',
            background: 'var(--admin-hero-bg)',
            border: '1px solid var(--admin-surface-border)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 0 rgba(15, 23, 42, 0.04)',
          }}
          className="admin-dashboard-hero"
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right, var(--admin-hero-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--admin-hero-grid) 1px, transparent 1px)',
              backgroundSize: '120px 120px',
              opacity: 0.1,
              pointerEvents: 'none',
            }}
          />
          <div style={heroGridStyle}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: cppGold,
                  fontWeight: 800,
                }}
              >
                Admin Dashboard
              </div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  margin: '6px 0 10px',
                  color: cppInk,
                  lineHeight: 1.15,
                  letterSpacing: -0.1,
                }}
              >
                NSF CURE Summer Bridge Program
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--cpp-muted)',
                  maxWidth: 620,
                  lineHeight: 1.55,
                }}
              >
                <span style={{ display: 'block', marginBottom: 2, color: 'var(--cpp-ink)' }}>
                  Welcome, {(user as { firstName?: string } | null)?.firstName ?? user?.email ?? 'team member'}.
                </span>
                <span>Manage program content, access analytics, and support students.</span>
              </p>
            </div>
          </div>
        </div>
        <div style={{ ...contentBoxStyle, marginTop: 2 }}>
          <div className="dashboard-top-grid">
            <div style={summaryPanelStyle} className="dashboard-panel">
              <div style={{ ...mockHeaderStyle, marginBottom: 8 }}>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      color: 'var(--cpp-muted)',
                    }}
                  >
                    Analytics
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 3 }}>
                    Snapshot of student activity, content status, and progress.
                  </div>
                </div>
              </div>
              <div className="dashboard-kpi-grid" style={analyticsRowStyle}>
                <StatCard label="Active students (7d)" value={`${stats.activeStudents}`} />
                <StatCard label="Published lessons" value={`${stats.publishedLessons}`} />
                <StatCard
                  label="Avg completion rate"
                  value={stats.avgCompletion != null ? `${Math.round(stats.avgCompletion * 100)}%` : '—'}
                />
              </div>
            </div>
            <div style={summaryPanelStyle} className="dashboard-panel">
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  color: 'var(--cpp-muted)',
                }}
              >
                Quick Actions
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 3 }}>
                Respond to current support needs.
              </div>
              <div className="dashboard-quick-grid" style={{ marginTop: 10 }}>
                <Link
                  href="/admin/collections/questions?where[status][equals]=open"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={workspaceCardStyle} className="dashboard-panel">
                    <div
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--cpp-muted)',
                        lineHeight: 1.1,
                      }}
                    >
                      Questions
                    </div>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 900,
                        color: 'var(--cpp-ink)',
                        lineHeight: 1,
                      }}
                    >
                      {stats.unanswered}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Unanswered questions</div>
                  </div>
                </Link>
                <Link
                  href="/admin/collections/feedback?where[read][equals]=false"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={workspaceCardStyle} className="dashboard-panel">
                    <div
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--cpp-muted)',
                        lineHeight: 1.1,
                      }}
                    >
                      Feedback
                    </div>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 900,
                        color: 'var(--cpp-ink)',
                        lineHeight: 1,
                      }}
                    >
                      {stats.unreadFeedback}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Unread feedback</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div style={sectionLabelStyle}>Course & Site Management</div>
        <div style={{ ...contentBoxStyle }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={moduleRowStyle}>
              <div style={moduleMetaStyle}>
                <ModuleIcon>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M20 22V5a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 5.5v14" />
                </ModuleIcon>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                    Course Workspace
                  </div>
                  <div className="dashboard-module-description">
                    Open courses to edit chapters, lessons, and ordering.
                  </div>
                </div>
              </div>
              <Link href="/admin/courses" className="dashboard-chip-link" draggable={false}>
                <div style={heroPrimaryStyle} className="dashboard-chip dashboard-chip--primary">
                  Manage Courses
                </div>
              </Link>
            </div>
            <div style={moduleRowStyle}>
              <div style={moduleMetaStyle}>
                <ModuleIcon>
                  <path d="M9 6h11" />
                  <path d="M9 12h11" />
                  <path d="M9 18h11" />
                  <path d="M4 6h.01" />
                  <path d="M4 12h.01" />
                  <path d="M4 18h.01" />
                </ModuleIcon>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                    Quiz Bank
                  </div>
                  <div className="dashboard-module-description">
                    Build assessments, reuse questions, and assign quizzes to lessons.
                  </div>
                </div>
              </div>
              <Link href="/admin/quiz-bank" className="dashboard-chip-link">
                <div style={heroPrimaryStyle} className="dashboard-chip dashboard-chip--primary">
                  Open Quiz Bank
                </div>
              </Link>
            </div>
            <div style={moduleRowStyle}>
              <div style={moduleMetaStyle}>
                <ModuleIcon>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 5 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 5a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 5a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z" />
                </ModuleIcon>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                    Site Management
                  </div>
                  <div className="dashboard-module-description">
                    Manage navigation order, global pages, and site settings.
                  </div>
                </div>
              </div>
              <Link href="/admin/site-management" className="dashboard-chip-link">
                <div style={heroPrimaryStyle} className="dashboard-chip dashboard-chip--primary">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 5 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 5a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 5a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z" />
                    </svg>
                    Site Management
                  </span>
                </div>
              </Link>
            </div>
            <div style={moduleRowStyle}>
              <div style={moduleMetaStyle}>
                <ModuleIcon>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="3.2" />
                  <path d="M20 8v6" />
                  <path d="M23 11h-6" />
                </ModuleIcon>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                    Classrooms
                  </div>
                  <div className="dashboard-module-description">
                    Create join codes and track student enrollments for credit.
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  padding: 3,
                  borderRadius: 12,
                  border: '1px solid var(--admin-surface-border)',
                  background: 'var(--admin-surface-muted)',
                }}
              >
                <Link href="/admin/collections/classrooms" className="dashboard-chip-link">
                  <div style={heroPrimaryStyle} className="dashboard-chip dashboard-chip--primary">
                    Manage Classrooms
                  </div>
                </Link>
                <Link
                  href="/admin/collections/classroom-memberships"
                  className="dashboard-chip-link"
                >
                  <div style={heroSecondaryStyle} className="dashboard-chip dashboard-chip--secondary">
                    View Enrollments
                  </div>
                </Link>
              </div>
            </div>
            <div
              style={{
                borderRadius: 14,
                border: '1px solid var(--admin-surface-border)',
                background: 'var(--admin-surface)',
                padding: '14px 16px',
                boxShadow: '0 1px 0 rgba(15, 23, 42, 0.06)',
                display: 'grid',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                    NSF Reporting
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                    Open period-based RPPR reporting, exports, and completeness checks.
                  </div>
                </div>
                <Link href="/admin/reporting" className="dashboard-chip-link">
                  <div style={heroPrimaryStyle} className="dashboard-chip dashboard-chip--primary">
                    Open Reporting
                  </div>
                </Link>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--admin-surface-border)',
                  paddingTop: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                    color: 'var(--cpp-muted)',
                    marginBottom: 10,
                  }}
                >
                  NSF reporting summary
                </div>
                <div
                  style={{
                    display: 'grid',
                    gap: 12,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  }}
                >
                  <div style={contentHealthCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                      Completion by class
                    </div>
                    <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                      {reporting.classCompletion.slice(0, 5).map((item) => (
                        <li key={item.id}>
                          <div style={{ color: 'var(--cpp-ink)', fontWeight: 600 }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                            {Math.round(item.completionRate * 100)}% ({item.uniqueLearnersCompleted}/
                            {item.uniqueLearnersStarted})
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={contentHealthCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                      Completion by chapter
                    </div>
                    <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                      {reporting.chapterCompletion.slice(0, 5).map((item) => (
                        <li key={item.id}>
                          <div style={{ color: 'var(--cpp-ink)', fontWeight: 600 }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                            {Math.round(item.completionRate * 100)}% ({item.uniqueLearnersCompleted}/
                            {item.uniqueLearnersStarted})
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={contentHealthCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                      Quiz mastery distribution
                    </div>
                    <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                      {reporting.quizPerformance.slice(0, 5).map((item) => (
                        <li key={item.quizId}>
                          <div style={{ color: 'var(--cpp-ink)', fontWeight: 600 }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                            {item.uniqueLearnersMastered}/{item.uniqueLearnersAttempted} mastered (
                            {Math.round(item.masteryRate * 100)}%)
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={contentHealthCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                      Week-over-week engagement
                    </div>
                    <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                      {reporting.weeklyEngagement.slice(-5).map((item) => (
                        <li key={item.weekStart}>
                          <div style={{ color: 'var(--cpp-ink)', fontWeight: 600 }}>{item.weekStart}</div>
                          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                            {item.activeStudents} active students{' '}
                            {item.weekOverWeekChange == null
                              ? '(baseline)'
                              : `(${item.weekOverWeekChange >= 0 ? '+' : ''}${Math.round(item.weekOverWeekChange * 100)}% WoW)`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Link
                    href="/api/analytics/reporting-summary?format=csv"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={heroPrimaryStyle} className="dashboard-chip dashboard-chip--primary">
                      Download NSF summary CSV
                    </div>
                  </Link>
                  <Link
                    href="/api/analytics/reporting-summary?format=csv&type=class-completion"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={heroSecondaryStyle} className="dashboard-chip dashboard-chip--secondary">
                      Class completion CSV
                    </div>
                  </Link>
                  <Link
                    href="/api/analytics/reporting-summary?format=csv&type=quiz-performance"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={heroSecondaryStyle} className="dashboard-chip dashboard-chip--secondary">
                      Quiz performance CSV
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ ...contentBoxStyle }}>
          <div className="content-health-heading">
            <div className="content-health-heading-title">Content Health</div>
            <p className="content-health-heading-subtitle">
              Monitor lesson quality signals and student friction indicators to identify where
              course content may need updates.
            </p>
          </div>
          <div className="content-health-grid">
            <ContentHealthCard
              title="Low completion lessons"
              description="Lessons with completion rates below the expected threshold."
              emptyMessage="Completion trends look healthy across current lessons."
              tone="completion"
              icon={
                <>
                  <path d="M4 19h16" />
                  <path d="M7 15l4-4 3 3 4-6" />
                </>
              }
              items={contentHealth.lowCompletion.map((item) => ({
                id: item.id,
                title: item.title,
                metric: `${Math.round(item.rate * 100)}% complete`,
                href: `/admin/collections/lessons/${item.id}`,
              }))}
            />
            <ContentHealthCard
              title="High question volume"
              description="Lessons with elevated student question activity."
              emptyMessage="No lessons show unusual question volume right now."
              tone="questions"
              icon={
                <>
                  <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H6l-3 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
                  <path d="M9 11h6" />
                  <path d="M9 15h4" />
                </>
              }
              items={contentHealth.highQuestions.map((item) => ({
                id: item.id,
                title: item.title,
                metric: `${item.count} questions`,
                href: `/admin/collections/lessons/${item.id}`,
              }))}
            />
            <ContentHealthCard
              title="Low helpfulness"
              description="Lessons with weaker helpfulness ratings from students."
              emptyMessage="Helpfulness scores are stable and no lessons are currently flagged."
              tone="helpfulness"
              icon={
                <>
                  <path d="M10 14V5.5a2.5 2.5 0 0 1 5 0V14" />
                  <path d="M7 10h10a2 2 0 0 1 1.93 2.52l-1.15 4A2 2 0 0 1 15.86 18H9a2 2 0 0 1-2-2v-6z" />
                  <path d="M7 10H5.5A1.5 1.5 0 0 0 4 11.5V16a2 2 0 0 0 2 2h1" />
                </>
              }
              items={contentHealth.lowHelpfulness.map((item) => ({
                id: item.id,
                title: item.title,
                metric: `${item.rating.toFixed(1)} / 4 helpfulness`,
                href: `/admin/collections/lessons/${item.id}`,
              }))}
            />
          </div>
        </div>

      </div>
    </div>
  </Gutter>
)

export default async function StaffDashboardView({
  initPageResult,
}: AdminViewServerProps) {
  const { req } = initPageResult
  const user = req.user
  const payload = req.payload

  let unansweredCount = 0
  let unreadFeedbackCount = 0
  let accountsCount = 0
  let activeStudentsCount = 0
  let publishedLessonsCount = 0
  let avgCompletionRate: number | null = null
  let helpfulnessAvg: number | null = null
  const LOW_COMPLETION_THRESHOLD = 0.4
  const HIGH_QUESTION_THRESHOLD = 5
  const LOW_HELPFULNESS_THRESHOLD = 2.5
  let contentHealth = {
    lowCompletion: [] as { id: string | number; title: string; rate: number }[],
    highQuestions: [] as { id: string | number; title: string; count: number }[],
    lowHelpfulness: [] as { id: string | number; title: string; rating: number }[],
  }
  let reporting = {
    classCompletion: [] as {
      id: string
      title: string
      uniqueLearnersStarted: number
      uniqueLearnersCompleted: number
      completionRate: number
    }[],
    chapterCompletion: [] as {
      id: string
      title: string
      uniqueLearnersStarted: number
      uniqueLearnersCompleted: number
      completionRate: number
    }[],
    quizPerformance: [] as {
      quizId: string
      title: string
      uniqueLearnersAttempted: number
      uniqueLearnersMastered: number
      masteryRate: number
      attempts: number
    }[],
    weeklyEngagement: [] as { weekStart: string; activeStudents: number; weekOverWeekChange: number | null }[],
  }

  try {
    const unanswered = await payload.find({
      collection: 'questions',
      depth: 0,
      limit: 0,
      where: {
        status: {
          equals: 'open',
        },
      },
    })
    unansweredCount = unanswered.totalDocs ?? 0
  } catch {
    unansweredCount = 0
  }


  try {
    const accounts = await payload.find({
      collection: 'accounts',
      depth: 0,
      limit: 0,
    })
    accountsCount = accounts.totalDocs ?? 0
  } catch {
    accountsCount = 0
  }


  try {
    const unreadFeedback = await payload.find({
      collection: 'feedback',
      depth: 0,
      limit: 0,
      where: {
        read: {
          equals: false,
        },
      },
    })
    unreadFeedbackCount = unreadFeedback.totalDocs ?? 0
  } catch {
    unreadFeedbackCount = 0
  }

  try {
    const publishedLessons = await payload.find({
      collection: 'lessons',
      depth: 0,
      limit: 0,
      where: {
        _status: {
          equals: 'published',
        },
      },
    })
    publishedLessonsCount = publishedLessons.totalDocs ?? 0
  } catch {
    publishedLessonsCount = 0
  }

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const recentProgress = await findAllDocs(payload, 'lesson-progress', {
      where: {
        updatedAt: {
          greater_than: since,
        },
      },
    })
    const activeUsers = new Set<string>()
    recentProgress.forEach((doc) => {
      const userValue = (doc as { user?: string | number | { id?: string | number } | null })
        .user
      const id =
        typeof userValue === 'string'
          ? userValue
          : typeof userValue === 'number'
            ? String(userValue)
          : userValue?.id != null
            ? String(userValue.id)
            : null
      if (id) activeUsers.add(id)
    })
    activeStudentsCount = activeUsers.size
  } catch {
    activeStudentsCount = 0
  }


  try {
    const lessons = await findAllDocs(payload, 'lessons')

    const lessonFeedback = await findAllDocs(payload, 'lesson-feedback')

    const progress = await findAllDocs(payload, 'lesson-progress')

    const completed = await findAllDocs(payload, 'lesson-progress', {
      where: {
        completed: {
          equals: true,
        },
      },
    })

    const questions = await findAllDocs(payload, 'questions')

    const lessonById = new Map<string, { id: string | number; title: string }>()
    lessons.forEach((lesson) => {
      const lessonId = String(lesson.id ?? '')
      if (!lessonId) return
      const lessonTitle =
        typeof lesson.title === 'string' && lesson.title.trim()
          ? lesson.title
          : 'Untitled lesson'
      lessonById.set(lessonId, {
        id: lessonId,
        title: lessonTitle,
      })
    })

    const progressTotals = new Map<string, number>()
    progress.forEach((doc) => {
      const lessonValue = (doc as { lesson?: string | { id?: string | number } }).lesson
      const id =
        typeof lessonValue === 'string'
          ? lessonValue
          : lessonValue?.id != null
            ? String(lessonValue.id)
            : null
      if (!id) return
      progressTotals.set(id, (progressTotals.get(id) ?? 0) + 1)
    })

    const progressCompleted = new Map<string, number>()
    completed.forEach((doc) => {
      const lessonValue = (doc as { lesson?: string | { id?: string | number } }).lesson
      const id =
        typeof lessonValue === 'string'
          ? lessonValue
          : lessonValue?.id != null
            ? String(lessonValue.id)
            : null
      if (!id) return
      progressCompleted.set(id, (progressCompleted.get(id) ?? 0) + 1)
    })

    const questionTotals = new Map<string, number>()
    questions.forEach((doc) => {
      const lessonValue = (doc as { lesson?: string | { id?: string | number } }).lesson
      const id =
        typeof lessonValue === 'string'
          ? lessonValue
          : lessonValue?.id != null
            ? String(lessonValue.id)
            : null
      if (!id) return
      questionTotals.set(id, (questionTotals.get(id) ?? 0) + 1)
    })

    const lowCompletion: { id: string | number; title: string; rate: number }[] = []
    progressTotals.forEach((total, id) => {
      if (!total) return
      const completedCount = progressCompleted.get(id) ?? 0
      const rate = completedCount / total
      if (rate < LOW_COMPLETION_THRESHOLD) {
        const lesson = lessonById.get(id)
        if (lesson) {
          lowCompletion.push({ id: lesson.id, title: lesson.title, rate })
        }
      }
    })

    const highQuestions: { id: string | number; title: string; count: number }[] = []
    questionTotals.forEach((count, id) => {
      if (count < HIGH_QUESTION_THRESHOLD) return
      const lesson = lessonById.get(id)
      if (lesson) {
        highQuestions.push({ id: lesson.id, title: lesson.title, count })
      }
    })

    contentHealth = {
      lowCompletion: lowCompletion.sort((a, b) => a.rate - b.rate).slice(0, 6),
      highQuestions: highQuestions.sort((a, b) => b.count - a.count).slice(0, 6),
      lowHelpfulness: [],
    }

    const feedbackTotals = new Map<string, { sum: number; count: number }>()
    lessonFeedback.forEach((doc) => {
      const lessonValue = (doc as {
        lesson?: string | number | { id?: string | number } | null
        rating?: unknown
      }).lesson
      const id =
        typeof lessonValue === 'string'
          ? lessonValue
          : typeof lessonValue === 'number'
            ? String(lessonValue)
          : lessonValue?.id != null
            ? String(lessonValue.id)
            : null
      const rating = resolveRatingScore(doc.rating)
      if (!id || rating == null) return
      const current = feedbackTotals.get(id) ?? { sum: 0, count: 0 }
      feedbackTotals.set(id, { sum: current.sum + rating, count: current.count + 1 })
    })

    let totalRating = 0
    let totalCount = 0
    const lowHelpfulness: { id: string | number; title: string; rating: number }[] = []
    feedbackTotals.forEach((totals, id) => {
      if (!totals.count) return
      const avg = totals.sum / totals.count
      totalRating += totals.sum
      totalCount += totals.count
      if (avg < LOW_HELPFULNESS_THRESHOLD) {
        const lesson = lessonById.get(id)
        if (lesson) {
          lowHelpfulness.push({ id: lesson.id, title: lesson.title, rating: avg })
        }
      }
    })

    helpfulnessAvg = totalCount ? totalRating / totalCount : null
    const totalProgressCount = Array.from(progressTotals.values()).reduce((sum, value) => sum + value, 0)
    const totalCompletedCount = Array.from(progressCompleted.values()).reduce((sum, value) => sum + value, 0)
    avgCompletionRate = totalProgressCount ? totalCompletedCount / totalProgressCount : null
    contentHealth.lowHelpfulness = lowHelpfulness
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 6)
  } catch {
    contentHealth = { lowCompletion: [], highQuestions: [], lowHelpfulness: [] }
  }

  try {
    reporting = await getReportingSummary(payload)
  } catch {
    reporting = {
      classCompletion: [],
      chapterCompletion: [],
      quizPerformance: [],
      weeklyEngagement: [],
    }
  }

  const stats = {
    accounts: accountsCount,
    unanswered: unansweredCount,
    unreadFeedback: unreadFeedbackCount,
    helpfulnessAvg,
    activeStudents: activeStudentsCount,
    publishedLessons: publishedLessonsCount,
    avgCompletion: avgCompletionRate,
  }

  return (
    <StaffDashboardContent
      user={user}
      stats={stats}
      contentHealth={contentHealth}
      reporting={reporting}
    />
  )
}
