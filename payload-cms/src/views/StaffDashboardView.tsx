import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

const cppGreen = 'var(--cpp-ink)'
const cppGold = 'var(--cpp-muted)'
const cppCream = 'var(--cpp-cream)'
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
const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(0, 80, 48, 0.12)',
  borderRadius: 0,
  padding: '14px 16px',
  width: 200,
  height: 200,
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: '#ffffff',
  transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
}

const quickCardStyle: React.CSSProperties = {
  border: '1px solid rgba(15, 23, 42, 0.12)',
  borderRadius: 0,
  padding: '14px 16px',
  width: 200,
  height: 200,
  background: '#ffffff',
  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 6,
}

const statCardStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 12,
  padding: '6px 10px',
  background: 'transparent',
  boxShadow: 'none',
  minWidth: 92,
  flex: '0 0 auto',
  textAlign: 'center',
}

const ManagePagesCard = () => (
  <a
    href="/admin/collections/pages"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div style={cardStyle} className="dashboard-card">
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>View / Edit Pages</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Manage all main pages from one list.
      </div>
    </div>
  </a>
)

const CreatePageCard = () => (
  <a
    href="/admin/collections/pages/create"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div style={cardStyle} className="dashboard-card">
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Add Page</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>Create a new main page.</div>
    </div>
  </a>
)

const QuickActionCard = ({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) => (
  <a href={href} style={{ textDecoration: 'none', color: 'inherit' }} className="quick-action-card">
    <div style={quickCardStyle}>
      <div style={{ fontSize: 16, fontWeight: 700, color: cppGreen }}>{title}</div>
      <div style={{ fontSize: 13, color: '#5b6f66', lineHeight: 1.4 }}>{description}</div>
    </div>
  </a>
)

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div style={statCardStyle} className="dashboard-stat-card">
    <div
      style={{
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--cpp-muted)',
        opacity: 0.8,
        fontWeight: 700,
        lineHeight: 1.1,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 18, fontWeight: 900, color: cppInk, marginTop: 2, lineHeight: 1.1 }}>
      {value}
    </div>
  </div>
)

const CreateClassCard = () => (
  <a
    href="/admin/collections/classes/create"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div style={cardStyle} className="dashboard-card">
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Add Class</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>Create a new class entry.</div>
    </div>
  </a>
)

const CreateChapterCard = () => (
  <a
    href="/admin/collections/chapters/create"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div style={cardStyle} className="dashboard-card">
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Add Chapter</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Create a new chapter for a class.
      </div>
    </div>
  </a>
)

const CreateLessonCard = () => (
  <a
    href="/admin/collections/lessons/create"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div style={cardStyle} className="dashboard-card">
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Add Lesson</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Create a new lesson for a chapter.
      </div>
    </div>
  </a>
)

const ManageClassesCard = () => (
  <a
    href="/admin/collections/classes"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div style={cardStyle} className="dashboard-card">
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>View / Edit Classes</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Review, edit, or delete classes.
      </div>
    </div>
  </a>
)

const ManageChaptersCard = () => (
  <a
    href="/admin/collections/chapters"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div style={cardStyle} className="dashboard-card">
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>View / Edit Chapters</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Review, edit, or delete chapters.
      </div>
    </div>
  </a>
)

const ManageLessonsCard = () => (
  <a
    href="/admin/collections/lessons"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div style={cardStyle} className="dashboard-card">
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>View / Edit Lessons</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Review, edit, or delete lessons.
      </div>
    </div>
  </a>
)

const LogoutCard = () => (
  <a
    href="/admin/logout"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div
      style={{
        ...cardStyle,
        background: '#0f172a',
        color: '#f8fafc',
        borderColor: 'rgba(15, 23, 42, 0.35)',
        minWidth: 220,
      }}
      className="dashboard-card"
    >
      <div style={{ fontSize: 18, fontWeight: 700 }}>Log out</div>
      <div style={{ marginTop: 4, fontSize: 14, color: '#cbd5e1' }}>
        Sign out of the admin panel
      </div>
    </div>
  </a>
)

const AccountCard = () => (
  <a
    href="/admin/account"
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="dashboard-card-link"
  >
    <div style={cardStyle} className="dashboard-card">
      <div style={{ fontSize: 18, fontWeight: 700, color: cppGreen }}>
        View / Edit Staff Account
      </div>
    </div>
  </a>
)

const cardRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
}
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
  fontSize: 13,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: 'var(--cpp-muted)',
  marginTop: 10,
  fontWeight: 700,
  alignSelf: 'center',
  textAlign: 'left',
  width: '100%',
  maxWidth: 1120,
}

const helpBoxStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 720,
  borderRadius: 0,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface-muted)',
  padding: '14px 16px',
  color: 'var(--cpp-ink)',
  lineHeight: 1.5,
  textAlign: 'center',
}

const contentHealthCardStyle: React.CSSProperties = {
  borderRadius: 0,
  border: '1px solid transparent',
  background: 'var(--admin-surface)',
  padding: '12px 14px',
  boxShadow: 'none',
}

const workspaceCardStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface)',
  padding: '8px',
  boxShadow: 'none',
  width: 110,
  height: 96,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,
  textAlign: 'center',
}

const analyticsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'nowrap',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface-muted)',
}

import CourseCardList from './CourseCardList'

const heroGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(280px, 1fr)',
  gap: 22,
  width: '100%',
  alignItems: 'center',
}

const heroCardStyle: React.CSSProperties = {
  borderRadius: 0,
  padding: '16px 20px',
  background: 'var(--admin-surface)',
  boxShadow: 'var(--admin-shadow)',
  border: '1px solid transparent',
  width: '100%',
}

const mockPanelStyle: React.CSSProperties = {
  background: 'var(--admin-surface)',
  borderRadius: 0,
  border: '1px solid var(--admin-surface-border)',
  boxShadow: 'var(--admin-shadow)',
  padding: '18px',
}

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

const heroLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--cpp-muted)',
  textDecoration: 'none',
  padding: '6px 2px',
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  filter: 'none',
}

type CourseTree = {
  id: string | number
  title: string
  chapters: {
    id: string | number
    title: string
    chapterNumber?: number | null
    lessons: {
      id: string | number
      title: string
      order?: number | null
    }[]
  }[]
}

const StaffDashboardContent = ({
  user,
  stats,
  contentHealth,
  courseTree,
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
  courseTree: CourseTree[]
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
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }
      .dashboard-chip:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
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
    `}</style>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={containerStyle}>
        <div
          style={{
            width: '100%',
            maxWidth: 1120,
            margin: '0 auto',
            borderRadius: 0,
            padding: '16px 20px 18px',
            background: 'var(--admin-hero-bg)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.16)',
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
              opacity: 0.18,
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
                  fontSize: 36,
                  fontWeight: 900,
                  margin: '8px 0 12px',
                  color: cppInk,
                  lineHeight: 1.05,
                  letterSpacing: -0.2,
                }}
              >
                NSF CURE Summer Bridge Program
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: 'var(--cpp-muted)',
                  maxWidth: 460,
                  lineHeight: 1.6,
                }}
              >
                <span style={{ display: 'block', marginBottom: 6 }}>
                  Welcome, {(user as { firstName?: string } | null)?.firstName ?? user?.email ?? 'team member'}.
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>
                  Manage program content, access analytics, and support students.
                </span>
              </p>
              <div style={{ marginTop: 16 }} />
            </div>
          </div>
        </div>
        <div
          style={{
            width: '100%',
            maxWidth: 1120,
            margin: '0 auto',
            marginTop: 18,
            marginBottom: 8,
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
          }}
        >
          <div
              style={{
                display: 'grid',
                gap: 16,
              gridTemplateColumns: 'minmax(260px, 1fr) minmax(360px, 1fr)',
                alignItems: 'start',
                justifyContent: 'center',
              }}
            >
            <div
              style={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: 0,
              }}
            >
              <div style={{ ...mockHeaderStyle, justifyContent: 'center' }}>
                <div style={{ fontWeight: 700, color: cppInk, textAlign: 'center' }}>Analytics</div>
              </div>
              <div style={analyticsRowStyle}>
                <StatCard label="Active (7d)" value={`${stats.activeStudents}`} />
                <StatCard label="Published" value={`${stats.publishedLessons}`} />
                <StatCard
                  label="Avg completion"
                  value={
                    stats.avgCompletion != null ? `${Math.round(stats.avgCompletion * 100)}%` : '—'
                  }
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                borderLeft: '1px solid var(--admin-surface-border)',
                paddingLeft: 16,
              }}
            >
              <div style={{ fontWeight: 700, color: cppInk, textAlign: 'center' }}>Quick Actions</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'nowrap', justifyContent: 'center' }}>
                <a
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
                        marginBottom: 2,
                      }}
                    >
                      Questions
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: 'var(--cpp-ink)',
                        lineHeight: 1.1,
                      }}
                    >
                      {stats.unanswered}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--cpp-muted)', marginTop: 2 }}>
                      Unanswered questions
                    </div>
                  </div>
                </a>
                <a
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
                        marginBottom: 2,
                      }}
                    >
                      Feedback
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: 'var(--cpp-ink)',
                        lineHeight: 1.1,
                      }}
                    >
                      {stats.unreadFeedback}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--cpp-muted)', marginTop: 2 }}>
                      Unread feedback
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div style={sectionLabelStyle}>Content Management</div>
        <div
          style={{
            width: '100%',
            maxWidth: 1120,
            color: 'var(--cpp-muted)',
            fontSize: 13,
            lineHeight: 1.5,
            marginTop: -4,
            marginBottom: 8,
          }}
        >
          Manage course structure, chapters, and lessons from a dedicated workspace.
        </div>
        <div style={{ ...contentBoxStyle }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div
              style={{
                borderRadius: 0,
                border: '1px solid transparent',
                background: 'var(--admin-surface)',
                padding: '18px',
                boxShadow: 'var(--admin-shadow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                  Course Workspace
                </div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                  Open courses to edit chapters, lessons, and ordering.
                </div>
              </div>
              <a href="/admin/courses" style={{ textDecoration: 'none' }}>
                <div style={heroPrimaryStyle} className="dashboard-chip dashboard-chip--primary">
                  Manage Courses
                </div>
              </a>
            </div>
            <div
              style={{
                borderRadius: 0,
                border: '1px solid transparent',
                background: 'var(--admin-surface)',
                padding: '16px 18px',
                boxShadow: 'var(--admin-shadow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                  Program Settings
                </div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                  Manage navigation order, global pages, and site settings.
                </div>
              </div>
              <a href="/admin/settings" style={{ textDecoration: 'none' }}>
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
                    Site Settings
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div style={sectionLabelStyle}>Content health</div>
        <div style={{ ...contentBoxStyle }}>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            <div style={contentHealthCardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                Low completion lessons
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                Lessons with completion rates below the threshold.
              </div>
              <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {contentHealth.lowCompletion.length ? (
                  contentHealth.lowCompletion.map((item) => (
                    <li key={String(item.id)}>
                      <a
                        href={`/admin/collections/lessons/${item.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'var(--cpp-ink)',
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
                      </a>
                      <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                        {Math.round(item.rate * 100)}% complete
                      </div>
                    </li>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                    No low-completion lessons.
                  </div>
                )}
              </ul>
            </div>
            <div style={contentHealthCardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                High question volume
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                Lessons with unusually high student questions.
              </div>
              <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {contentHealth.highQuestions.length ? (
                  contentHealth.highQuestions.map((item) => (
                    <li key={String(item.id)}>
                      <a
                        href={`/admin/collections/lessons/${item.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'var(--cpp-ink)',
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
                      </a>
                      <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                        {item.count} questions
                      </div>
                    </li>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                    No high-volume lessons.
                  </div>
                )}
              </ul>
            </div>
            <div style={contentHealthCardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                Low helpfulness
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                Lessons with low average helpfulness ratings.
              </div>
              <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {contentHealth.lowHelpfulness.length ? (
                  contentHealth.lowHelpfulness.map((item) => (
                    <li key={String(item.id)}>
                      <a
                        href={`/admin/collections/lessons/${item.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'var(--cpp-ink)',
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
                      </a>
                      <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                        {item.rating.toFixed(1)} / 4
                      </div>
                    </li>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                    No low-rated lessons.
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            color: 'var(--cpp-muted)',
            textAlign: 'center',
            width: '100%',
          }}
        >
          © 2025 Cal Poly Pomona Engineering — NSF CURE Summer Bridge Program
        </div>
      </div>
    </div>
  </Gutter>
)

export default async function StaffDashboardView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { req } = initPageResult
  const user = req.user
  const payload = req.payload

  let unansweredCount = 0
  let lessonsDraftCount = 0
  let pagesDraftCount = 0
  let unreadFeedbackCount = 0
  let accountsCount = 0
  let activeStudentsCount = 0
  let publishedLessonsCount = 0
  let avgCompletionRate: number | null = null
  let helpfulnessAvg: number | null = null
  let courseTree: CourseTree[] = []
  const LOW_COMPLETION_THRESHOLD = 0.4
  const HIGH_QUESTION_THRESHOLD = 5
  const LOW_HELPFULNESS_THRESHOLD = 2.5
  let contentHealth = {
    lowCompletion: [] as { id: string | number; title: string; rate: number }[],
    highQuestions: [] as { id: string | number; title: string; count: number }[],
    lowHelpfulness: [] as { id: string | number; title: string; rating: number }[],
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
    const lessonDrafts = await payload.find({
      collection: 'lessons',
      depth: 0,
      limit: 0,
      where: {
        _status: {
          equals: 'draft',
        },
      },
    })
    lessonsDraftCount = lessonDrafts.totalDocs ?? 0
  } catch {
    lessonsDraftCount = 0
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
    const pageDrafts = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 0,
      where: {
        _status: {
          equals: 'draft',
        },
      },
    })
    pagesDraftCount = pageDrafts.totalDocs ?? 0
  } catch {
    pagesDraftCount = 0
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
    const recentProgress = await payload.find({
      collection: 'lesson-progress',
      depth: 0,
      limit: 5000,
      where: {
        updatedAt: {
          greater_than: since,
        },
      },
    })
    const activeUsers = new Set<string>()
    recentProgress.docs.forEach((doc: any) => {
      const userValue = doc.user
      const id =
        typeof userValue === 'string'
          ? userValue
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
    const classes = await payload.find({
      collection: 'classes',
      depth: 2,
      limit: 200,
      sort: 'order',
    })

    courseTree = classes.docs.map((course: any) => {
      const chapterDocs = Array.isArray(course?.chapters) ? course.chapters : []
      const chapters = chapterDocs
        .map((chapter: any) => {
          const lessonDocs = Array.isArray(chapter?.lessons) ? chapter.lessons : []
          const lessons = lessonDocs
            .map((lesson: any) => ({
              id: lesson?.id ?? lesson,
              title: lesson?.title ?? 'Untitled lesson',
              order: lesson?.order ?? null,
            }))
            .sort((a, b) => {
              const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
              const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
              if (orderA !== orderB) return orderA - orderB
              return String(a.title).localeCompare(String(b.title))
            })

          return {
            id: chapter?.id ?? chapter,
            title: chapter?.title ?? 'Untitled chapter',
            chapterNumber:
              typeof chapter?.chapterNumber === 'number' ? chapter.chapterNumber : null,
            lessons,
          }
        })
        .sort((a, b) => {
          const numberA =
            typeof a.chapterNumber === 'number' ? a.chapterNumber : Number.MAX_SAFE_INTEGER
          const numberB =
            typeof b.chapterNumber === 'number' ? b.chapterNumber : Number.MAX_SAFE_INTEGER
          if (numberA !== numberB) return numberA - numberB
          return String(a.title).localeCompare(String(b.title))
        })

      return {
        id: course?.id ?? course,
        title: course?.title ?? 'Untitled class',
        chapters,
      }
    })
  } catch {
    courseTree = []
  }

  try {
    const lessons = await payload.find({
      collection: 'lessons',
      depth: 0,
      limit: 2000,
    })

    const lessonFeedback = await payload.find({
      collection: 'lesson-feedback',
      depth: 0,
      limit: 5000,
    })

    const progress = await payload.find({
      collection: 'lesson-progress',
      depth: 0,
      limit: 5000,
    })

    const completed = await payload.find({
      collection: 'lesson-progress',
      depth: 0,
      limit: 5000,
      where: {
        completed: {
          equals: true,
        },
      },
    })

    const questions = await payload.find({
      collection: 'questions',
      depth: 0,
      limit: 5000,
    })

    const lessonById = new Map<string, { id: string | number; title: string }>()
    lessons.docs.forEach((lesson) => {
      lessonById.set(String(lesson.id), {
        id: lesson.id,
        title: lesson.title ?? 'Untitled lesson',
      })
    })

    const progressTotals = new Map<string, number>()
    progress.docs.forEach((doc) => {
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
    completed.docs.forEach((doc) => {
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
    questions.docs.forEach((doc) => {
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
    lessonFeedback.docs.forEach((doc: any) => {
      const lessonValue = doc.lesson
      const id =
        typeof lessonValue === 'string'
          ? lessonValue
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
      courseTree={courseTree}
    />
  )
}
