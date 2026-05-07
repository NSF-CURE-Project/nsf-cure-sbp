import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import React from 'react'
import Link from 'next/link'
import { getReportingSummary } from '../utils/analyticsSummary'
import { findAllDocs } from '../reporting/data'
import AnimatedNumber from './dashboard/AnimatedNumber'

const cppInk = 'var(--cpp-ink)'

// ---------- Icon primitives (no extra deps; lucide-style strokes) ----------
type IconProps = { size?: number; color?: string; strokeWidth?: number }

const Icon = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.75,
  children,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
)

const UsersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
)
const BookOpenIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </Icon>
)
const BarChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3v18h18" />
    <rect x="7" y="12" width="3" height="6" rx="0.5" />
    <rect x="12" y="8" width="3" height="10" rx="0.5" />
    <rect x="17" y="4" width="3" height="14" rx="0.5" />
  </Icon>
)
const MessageIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Icon>
)
const InboxIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Icon>
)
const GraduationIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M22 10v6" />
    <path d="M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </Icon>
)
const ClipboardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </Icon>
)
const SparklesIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M5 12H1" />
    <path d="M23 12h-4" />
    <path d="M18.36 5.64l-2.83 2.83" />
    <path d="M8.46 15.54l-2.83 2.83" />
    <path d="M18.36 18.36l-2.83-2.83" />
    <path d="M8.46 8.46L5.64 5.64" />
  </Icon>
)
const ArrowUpRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </Icon>
)
const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
)
const TrendUpIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m22 7-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </Icon>
)
const TrendDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m22 17-8.5-8.5-5 5L2 7" />
    <path d="M16 17h6v-6" />
  </Icon>
)
const SettingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 5 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 5a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 5a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z" />
  </Icon>
)
// ---------- end icons ----------

// Tiny inline sparkline. Provides motion/visual interest without a chart lib.
const Sparkline = ({
  values,
  color = '#1e3a8a',
  width = 84,
  height = 28,
}: {
  values: number[]
  color?: string
  width?: number
  height?: number
}) => {
  if (!values.length) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = values.length > 1 ? width / (values.length - 1) : 0
  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const linePath = `M${points.join(' L')}`
  const areaPath = `${linePath} L${(width).toFixed(1)},${height} L0,${height} Z`
  const gradientId = `spark-${Math.random().toString(36).slice(2, 8)}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
  border: '1px solid rgba(15, 23, 42, 0.07)',
  borderRadius: 16,
  padding: '14px 16px',
  background: 'rgba(255, 255, 255, 0.92)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.72)',
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
  padding: '20px 18px 56px',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  alignItems: 'center',
}
const contentBoxStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1120,
  alignSelf: 'center',
  margin: '0 auto',
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  color: 'var(--cpp-muted)',
  marginTop: 12,
  marginBottom: 2,
  fontWeight: 800,
  alignSelf: 'center',
  textAlign: 'left',
  width: '100%',
  maxWidth: 1120,
}

const contentHealthCardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(15, 23, 42, 0.06)',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: '14px 16px',
  boxShadow: 'none',
}

const workspaceCardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(15, 23, 42, 0.06)',
  background: 'rgba(255, 255, 255, 0.94)',
  padding: '16px',
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

const quickActionCardStyle: React.CSSProperties = {
  ...workspaceCardStyle,
  minHeight: 86,
  padding: '12px 14px',
  gap: 4,
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
  borderRadius: 20,
  border: '1px solid rgba(15, 23, 42, 0.06)',
  background: 'rgba(255, 255, 255, 0.97)',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
  padding: '18px 20px',
}

const moduleRowStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(15, 23, 42, 0.06)',
  background:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 255, 0.96) 100%)',
  padding: '14px 16px',
  boxShadow:
    '0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 6px 14px rgba(15, 23, 42, 0.04)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 14,
  flexWrap: 'wrap',
}

const moduleMetaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const moduleIconStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  border: '1px solid rgba(21, 83, 207, 0.16)',
  background: 'linear-gradient(180deg, rgba(21, 83, 207, 0.1) 0%, rgba(21, 83, 207, 0.04) 100%)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#1553cf',
  flexShrink: 0,
  boxShadow: '0 1px 0 rgba(255, 255, 255, 0.6) inset',
}

type ModuleTone = 'blue' | 'emerald' | 'amber' | 'purple' | 'pink' | 'slate'

const moduleToneStyles: Record<ModuleTone, { color: string; border: string; bg: string }> = {
  blue: {
    color: '#1553cf',
    border: 'rgba(21, 83, 207, 0.18)',
    bg: 'linear-gradient(180deg, rgba(21, 83, 207, 0.12) 0%, rgba(21, 83, 207, 0.04) 100%)',
  },
  emerald: {
    color: '#047857',
    border: 'rgba(4, 120, 87, 0.2)',
    bg: 'linear-gradient(180deg, rgba(4, 120, 87, 0.12) 0%, rgba(4, 120, 87, 0.04) 100%)',
  },
  amber: {
    color: '#b45309',
    border: 'rgba(180, 83, 9, 0.22)',
    bg: 'linear-gradient(180deg, rgba(217, 119, 6, 0.14) 0%, rgba(217, 119, 6, 0.05) 100%)',
  },
  purple: {
    color: '#7e22ce',
    border: 'rgba(126, 34, 206, 0.22)',
    bg: 'linear-gradient(180deg, rgba(168, 85, 247, 0.14) 0%, rgba(168, 85, 247, 0.05) 100%)',
  },
  pink: {
    color: '#be185d',
    border: 'rgba(190, 24, 93, 0.22)',
    bg: 'linear-gradient(180deg, rgba(219, 39, 119, 0.13) 0%, rgba(219, 39, 119, 0.05) 100%)',
  },
  slate: {
    color: '#475569',
    border: 'rgba(71, 85, 105, 0.2)',
    bg: 'linear-gradient(180deg, rgba(71, 85, 105, 0.1) 0%, rgba(71, 85, 105, 0.04) 100%)',
  },
}

const ModuleIcon = ({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode
  tone?: ModuleTone
}) => {
  const palette = moduleToneStyles[tone]
  return (
    <div
      style={{
        ...moduleIconStyle,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
      }}
      aria-hidden="true"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </div>
  )
}

const mockHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
}

const mockChipStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: '7px 12px',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.02,
  background: 'rgba(15, 23, 42, 0.04)',
  color: cppInk,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 34,
}

const heroPrimaryStyle: React.CSSProperties = {
  ...mockChipStyle,
  background: '#1f4578',
  color: 'var(--admin-chip-primary-text)',
  borderColor: 'rgba(31, 69, 120, 0.4)',
  boxShadow: 'none',
}

const heroSecondaryStyle: React.CSSProperties = {
  ...mockChipStyle,
  background: 'rgba(15, 23, 42, 0.04)',
  borderColor: 'rgba(15, 23, 42, 0.08)',
  color: 'var(--cpp-ink)',
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
    accent: '#1553cf',
    iconBg: 'rgba(21, 83, 207, 0.14)',
    badgeBg: 'rgba(21, 83, 207, 0.12)',
  },
  questions: {
    accent: '#0a89c2',
    iconBg: 'rgba(10, 137, 194, 0.14)',
    badgeBg: 'rgba(10, 137, 194, 0.12)',
  },
  helpfulness: {
    accent: '#11a36f',
    iconBg: 'rgba(17, 163, 111, 0.14)',
    badgeBg: 'rgba(17, 163, 111, 0.12)',
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
  kpiHistory,
}: {
  user?: AdminViewServerProps['initPageResult']['req']['user']
  stats: {
    accounts: number
    unanswered: number
    unreadFeedback: number
    awaitingLessonFeedback: number
    helpfulnessAvg: number | null
    activeStudents: number
    publishedLessons: number
    avgCompletion: number | null
  }
  kpiHistory?: {
    activeStudents: number[]
    publishedLessons: number[]
    completionRate: number[]
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
    weeklyEngagement: {
      weekStart: string
      activeStudents: number
      weekOverWeekChange: number | null
    }[]
  }
}) => (
  <Gutter>
    <style>{`
      @keyframes dashboardFadeUp {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .dashboard-fade-in {
        animation: dashboardFadeUp 380ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
      }
      @media (prefers-reduced-motion: reduce) {
        .dashboard-fade-in { animation: none !important; }
      }
      .quick-action-card > div {
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }
      .quick-action-card:hover > div {
        transform: translateY(-1px);
        box-shadow: 0 16px 28px rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.1);
      }
      .quick-action-card:active > div {
        transform: translateY(0);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
      }
      .dashboard-card {
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }
      .dashboard-card-link:hover .dashboard-card {
        transform: translateY(-1px);
        box-shadow: 0 16px 28px rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.1);
      }
      .dashboard-card-link:active .dashboard-card {
        transform: translateY(0);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
      }
      .dashboard-chip {
        transition: box-shadow 150ms ease, border-color 150ms ease;
      }
      .dashboard-chip:hover {
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
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
        transform: translateY(-1px);
        box-shadow: 0 16px 28px rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.1);
      }
      .dashboard-panel {
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }
      .dashboard-panel:hover {
        transform: translateY(-1px);
        box-shadow: 0 18px 32px rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.1);
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
        font-size: 13px;
        font-weight: 800;
        letter-spacing: -0.01em;
        color: var(--cpp-ink);
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
        border-radius: 16px;
        border: 1px solid rgba(15, 23, 42, 0.06);
        background: rgba(255, 255, 255, 0.96);
        padding: 14px;
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
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
        border: 1px solid rgba(15, 23, 42, 0.06);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.72);
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
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.04);
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
        border: 1px dashed rgba(15, 23, 42, 0.12);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.68);
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
            borderRadius: 20,
            padding: '20px 22px 18px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(244, 248, 255, 0.92) 60%, rgba(238, 244, 255, 0.92) 100%)',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.7) inset, 0 14px 32px rgba(15, 23, 42, 0.05), 0 2px 6px rgba(15, 23, 42, 0.04)',
          }}
          className="admin-dashboard-hero"
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right, var(--admin-hero-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--admin-hero-grid) 1px, transparent 1px)',
              backgroundSize: '120px 120px',
              opacity: 0.08,
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -80,
              right: -90,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background:
                'radial-gradient(closest-side, rgba(21, 83, 207, 0.12), rgba(21, 83, 207, 0))',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: 18,
              alignItems: 'center',
              position: 'relative',
            }}
            className="admin-dashboard-hero-grid"
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: 'var(--cpp-muted)',
                    fontWeight: 700,
                  }}
                >
                  Admin Dashboard
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(21, 83, 207, 0.1)',
                    color: '#1553cf',
                    letterSpacing: 0.4,
                  }}
                >
                  Cohort {new Date().getFullYear()}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--cpp-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'inline-block',
                    }}
                  />
                  Live · updated just now
                </span>
              </div>
              <h1
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  margin: '4px 0 6px',
                  color: 'var(--cpp-ink)',
                  lineHeight: 1.1,
                  letterSpacing: -0.4,
                }}
              >
                NSF CURE Summer Bridge Program
              </h1>
              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--cpp-muted)',
                  margin: 0,
                  maxWidth: 560,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: 'var(--cpp-ink)', fontWeight: 600 }}>
                  Welcome,{' '}
                  {(user as { firstName?: string } | null)?.firstName ??
                    user?.email ??
                    'team member'}
                  .
                </span>{' '}
                Manage program content, access analytics, and support students.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <Link
                  href="/admin/courses"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: 'linear-gradient(180deg, #1e3a8a 0%, #163074 100%)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow:
                      '0 1px 0 rgba(255,255,255,0.18) inset, 0 8px 20px rgba(21,83,207,0.25)',
                  }}
                >
                  <PlusIcon size={14} /> Manage Courses
                </Link>
                <Link
                  href="/admin/quiz-bank"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.7)',
                    color: 'var(--cpp-ink)',
                    fontSize: 13,
                    fontWeight: 600,
                    border: '1px solid rgba(15, 23, 42, 0.1)',
                  }}
                >
                  <ClipboardIcon size={14} /> Open Quiz Bank
                </Link>
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 8,
              }}
              className="admin-dashboard-hero-stats"
            >
              {[
                {
                  label: 'Active (7d)',
                  value: `${stats.activeStudents}`,
                  icon: <UsersIcon size={14} color="#1553cf" />,
                  tone: 'rgba(21, 83, 207, 0.08)',
                },
                {
                  label: 'Lessons',
                  value: `${stats.publishedLessons}`,
                  icon: <BookOpenIcon size={14} color="#0891b2" />,
                  tone: 'rgba(8, 145, 178, 0.08)',
                },
                {
                  label: 'Completion',
                  value:
                    stats.avgCompletion != null
                      ? `${Math.round(stats.avgCompletion * 100)}%`
                      : '—',
                  icon: <BarChartIcon size={14} color="#0d9488" />,
                  tone: 'rgba(13, 148, 136, 0.08)',
                },
              ].map((kpi, idx) => (
                <div
                  key={kpi.label}
                  className="dashboard-fade-in"
                  style={{
                    background: kpi.tone,
                    border: '1px solid rgba(15, 23, 42, 0.05)',
                    borderRadius: 12,
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minWidth: 0,
                    animationDelay: `${40 + idx * 50}ms`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      color: 'var(--cpp-muted)',
                      fontWeight: 700,
                    }}
                  >
                    {kpi.icon}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {kpi.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: 'var(--cpp-ink)',
                      lineHeight: 1,
                      letterSpacing: -0.4,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ ...contentBoxStyle, marginTop: 2 }}>
          <div className="dashboard-top-grid">
            <Link
              href="/admin/user-analytics"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              aria-label="Open per-user analytics"
            >
              <div
                style={{
                  borderRadius: 16,
                  padding: '14px 16px',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248, 250, 255, 0.96) 100%)',
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  boxShadow:
                    '0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 20px rgba(15, 23, 42, 0.04)',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
                className="dashboard-panel"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        color: 'var(--cpp-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <BarChartIcon size={13} color="#1553cf" />
                      Analytics
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 3 }}>
                      Click any tile to drill into per-student data.
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#1553cf',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    Open <ArrowUpRightIcon size={12} />
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gap: 10,
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  }}
                >
                  {(() => {
                    const activeSeries = (kpiHistory?.activeStudents?.length
                      ? kpiHistory.activeStudents
                      : [stats.activeStudents]) as number[]
                    const lessonsSeries = (kpiHistory?.publishedLessons?.length
                      ? kpiHistory.publishedLessons
                      : [stats.publishedLessons]) as number[]
                    const completionSeries = (kpiHistory?.completionRate?.length
                      ? kpiHistory.completionRate
                      : [
                          stats.avgCompletion != null
                            ? Math.round(stats.avgCompletion * 100)
                            : 0,
                        ]) as number[]

                    const computeDelta = (
                      series: number[],
                      formatter: (v: number) => string = (v) =>
                        `${v >= 0 ? '+' : ''}${v}`,
                    ) => {
                      if (series.length < 2) return null
                      const last = series[series.length - 1]
                      const prev = series[series.length - 2]
                      const diff = last - prev
                      if (!Number.isFinite(diff) || diff === 0) return null
                      return {
                        text: formatter(diff),
                        direction: (diff > 0 ? 'up' : 'down') as 'up' | 'down',
                      }
                    }
                    const computePctDelta = (series: number[]) => {
                      if (series.length < 2) return null
                      const last = series[series.length - 1]
                      const prev = series[series.length - 2]
                      if (!prev) return null
                      const pct = Math.round(((last - prev) / prev) * 100)
                      if (!Number.isFinite(pct) || pct === 0) return null
                      return {
                        text: `${pct >= 0 ? '+' : ''}${pct}%`,
                        direction: (pct > 0 ? 'up' : 'down') as 'up' | 'down',
                      }
                    }

                    return [
                      {
                        label: 'Active (7d)',
                        rawValue: stats.activeStudents,
                        icon: <UsersIcon size={14} color="#1553cf" />,
                        accent: '#1553cf',
                        delta: computePctDelta(activeSeries),
                        sparkline: activeSeries,
                        hint: 'students engaged this week',
                      },
                      {
                        label: 'Published Lessons',
                        rawValue: stats.publishedLessons,
                        icon: <BookOpenIcon size={14} color="#0891b2" />,
                        accent: '#0891b2',
                        delta: computeDelta(lessonsSeries),
                        sparkline: lessonsSeries,
                        hint: 'live across all courses',
                      },
                      {
                        label: 'Completion Rate',
                        rawValue:
                          stats.avgCompletion != null
                            ? Math.round(stats.avgCompletion * 100)
                            : null,
                        suffix: stats.avgCompletion != null ? '%' : '',
                        icon: <ClipboardIcon size={14} color="#0d9488" />,
                        accent: '#0d9488',
                        delta: computeDelta(completionSeries, (v) => `${v >= 0 ? '+' : ''}${v}pp`),
                        sparkline: completionSeries,
                        hint: 'weekly avg lessons completed',
                      },
                    ]
                  })().map((kpi, kpiIdx) => (
                    <div
                      key={kpi.label}
                      className="dashboard-fade-in"
                      style={{
                        borderRadius: 12,
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(248,250,255,0.85) 100%)',
                        border: '1px solid rgba(15, 23, 42, 0.05)',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        minWidth: 0,
                        position: 'relative',
                        animationDelay: `${80 + kpiIdx * 60}ms`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: 0.6,
                            color: 'var(--cpp-muted)',
                            fontWeight: 700,
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              width: 18,
                              height: 18,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 6,
                              background: `${kpi.accent}1a`,
                            }}
                          >
                            {kpi.icon}
                          </span>
                          {kpi.label}
                        </div>
                        {kpi.delta ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                              fontSize: 10,
                              fontWeight: 700,
                              color: kpi.delta.direction === 'up' ? '#127455' : '#b91c1c',
                              background:
                                kpi.delta.direction === 'up'
                                  ? 'rgba(18, 116, 85, 0.1)'
                                  : 'rgba(185, 28, 28, 0.1)',
                              padding: '2px 6px',
                              borderRadius: 999,
                              letterSpacing: 0.2,
                            }}
                          >
                            {kpi.delta.direction === 'up' ? (
                              <TrendUpIcon size={10} />
                            ) : (
                              <TrendDownIcon size={10} />
                            )}
                            {kpi.delta.text}
                          </span>
                        ) : null}
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: 'var(--cpp-ink)',
                          lineHeight: 1,
                          letterSpacing: -0.4,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {kpi.rawValue == null ? (
                          '—'
                        ) : (
                          <AnimatedNumber
                            value={kpi.rawValue}
                            suffix={kpi.suffix ?? ''}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          gap: 6,
                        }}
                      >
                        <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>{kpi.hint}</div>
                        <Sparkline
                          values={kpi.sparkline}
                          color={kpi.accent}
                          width={64}
                          height={20}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
            <div
              style={{
                borderRadius: 16,
                padding: '14px 16px',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248, 250, 255, 0.96) 100%)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 20px rgba(15, 23, 42, 0.04)',
              }}
              className="dashboard-panel"
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  color: 'var(--cpp-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <SparklesIcon size={13} color="#a855f7" />
                Quick Actions
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 3 }}>
                Respond to current support needs.
              </div>
              <div
                className="dashboard-quick-grid"
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 8,
                }}
              >
                {[
                  {
                    href: '/admin/collections/questions?where[status][equals]=open',
                    label: 'Questions',
                    value: stats.unanswered,
                    hint: 'Unanswered',
                    accent: '#d97706',
                    accentBg: 'rgba(217, 119, 6, 0.1)',
                    accentBorder: 'rgba(217, 119, 6, 0.22)',
                    icon: <MessageIcon size={15} color="#d97706" />,
                  },
                  {
                    href: '/admin/collections/feedback?where[read][equals]=false',
                    label: 'Sitewide',
                    value: stats.unreadFeedback,
                    hint: 'Unread feedback',
                    accent: '#a855f7',
                    accentBg: 'rgba(168, 85, 247, 0.1)',
                    accentBorder: 'rgba(168, 85, 247, 0.22)',
                    icon: <InboxIcon size={15} color="#a855f7" />,
                  },
                  {
                    href: '/admin/collections/lesson-feedback',
                    label: 'Lessons',
                    value: stats.awaitingLessonFeedback,
                    hint: 'Awaiting staff reply',
                    accent: '#db2777',
                    accentBg: 'rgba(219, 39, 119, 0.08)',
                    accentBorder: 'rgba(219, 39, 119, 0.22)',
                    icon: <BookOpenIcon size={15} color="#db2777" />,
                  },
                  {
                    href: '/admin/student-performance',
                    label: 'Performance',
                    value: 'Open',
                    hint: 'Cohort dashboard',
                    accent: '#1553cf',
                    accentBg: 'rgba(21, 83, 207, 0.1)',
                    accentBorder: 'rgba(21, 83, 207, 0.22)',
                    icon: <GraduationIcon size={15} color="#1553cf" />,
                  },
                ].map((tile) => (
                  <Link
                    key={tile.label}
                    href={tile.href}
                    className="quick-action-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        borderRadius: 12,
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.8)',
                        border: `1px solid ${tile.accentBorder}`,
                        boxShadow:
                          '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 10px rgba(15, 23, 42, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        minHeight: 70,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 3,
                          height: '100%',
                          background: tile.accent,
                          opacity: 0.7,
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: 0.6,
                            color: 'var(--cpp-muted)',
                            fontWeight: 700,
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              width: 22,
                              height: 22,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 6,
                              background: tile.accentBg,
                            }}
                          >
                            {tile.icon}
                          </span>
                          {tile.label}
                        </div>
                        <ArrowUpRightIcon size={12} color="var(--cpp-muted)" />
                      </div>
                      <div
                        style={{
                          fontSize: typeof tile.value === 'number' ? 22 : 16,
                          fontWeight: 800,
                          color: 'var(--cpp-ink)',
                          lineHeight: 1,
                          letterSpacing: -0.3,
                        }}
                      >
                        {tile.value}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>{tile.hint}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={sectionLabelStyle}>Course & Site Management</div>
        <div style={{ ...contentBoxStyle }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={moduleRowStyle}>
              <div style={moduleMetaStyle}>
                <ModuleIcon tone="blue">
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
                <ModuleIcon tone="emerald">
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
                <ModuleIcon tone="slate">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 5 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 5a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 5a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z" />
                </ModuleIcon>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                    Site Management
                  </div>
                  <div className="dashboard-module-description">
                    Manage navigation order, global pages, site settings, and users & roles.
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
                <ModuleIcon tone="amber">
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
                  background: 'rgba(237, 246, 255, 0.9)',
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
                  <div
                    style={heroSecondaryStyle}
                    className="dashboard-chip dashboard-chip--secondary"
                  >
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
                          <div style={{ color: 'var(--cpp-ink)', fontWeight: 600 }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                            {Math.round(item.completionRate * 100)}% ({item.uniqueLearnersCompleted}
                            /{item.uniqueLearnersStarted})
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
                          <div style={{ color: 'var(--cpp-ink)', fontWeight: 600 }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                            {Math.round(item.completionRate * 100)}% ({item.uniqueLearnersCompleted}
                            /{item.uniqueLearnersStarted})
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
                          <div style={{ color: 'var(--cpp-ink)', fontWeight: 600 }}>
                            {item.title}
                          </div>
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
                          <div style={{ color: 'var(--cpp-ink)', fontWeight: 600 }}>
                            {item.weekStart}
                          </div>
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
                    <div
                      style={heroPrimaryStyle}
                      className="dashboard-chip dashboard-chip--primary"
                    >
                      Download NSF summary CSV
                    </div>
                  </Link>
                  <Link
                    href="/api/analytics/reporting-summary?format=csv&type=class-completion"
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={heroSecondaryStyle}
                      className="dashboard-chip dashboard-chip--secondary"
                    >
                      Class completion CSV
                    </div>
                  </Link>
                  <Link
                    href="/api/analytics/reporting-summary?format=csv&type=quiz-performance"
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={heroSecondaryStyle}
                      className="dashboard-chip dashboard-chip--secondary"
                    >
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

export default async function StaffDashboardView({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult
  const user = req.user
  const payload = req.payload

  let unansweredCount = 0
  let unreadFeedbackCount = 0
  let awaitingLessonFeedbackCount = 0
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
    weeklyEngagement: [] as {
      weekStart: string
      activeStudents: number
      weekOverWeekChange: number | null
    }[],
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
      const userValue = (doc as { user?: string | number | { id?: string | number } | null }).user
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
    awaitingLessonFeedbackCount = lessonFeedback.filter((doc) => {
      const reply = (doc as { reply?: unknown }).reply
      return !(typeof reply === 'string' && reply.trim())
    }).length

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
        typeof lesson.title === 'string' && lesson.title.trim() ? lesson.title : 'Untitled lesson'
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
      const lessonValue = (
        doc as {
          lesson?: string | number | { id?: string | number } | null
          rating?: unknown
        }
      ).lesson
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
    const totalProgressCount = Array.from(progressTotals.values()).reduce(
      (sum, value) => sum + value,
      0,
    )
    const totalCompletedCount = Array.from(progressCompleted.values()).reduce(
      (sum, value) => sum + value,
      0,
    )
    avgCompletionRate = totalProgressCount ? totalCompletedCount / totalProgressCount : null
    contentHealth.lowHelpfulness = lowHelpfulness.sort((a, b) => a.rating - b.rating).slice(0, 6)
  } catch {
    contentHealth = { lowCompletion: [], highQuestions: [], lowHelpfulness: [] }
    awaitingLessonFeedbackCount = 0
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

  // Compute weekly history series so the dashboard sparklines + delta chips
  // come from real data instead of placeholder series. Anchored to the same
  // 8-week window as reporting.weeklyEngagement.
  const HISTORY_WEEKS = 8
  const computeKpiHistory = async () => {
    // Build the week-start anchor list from reporting; pad to 8 weeks if needed.
    const fromReporting = (reporting?.weeklyEngagement ?? [])
      .map((w) => w.weekStart)
      .filter((s): s is string => typeof s === 'string')

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const dow = today.getUTCDay()
    const offset = (dow + 6) % 7
    today.setUTCDate(today.getUTCDate() - offset)
    const weekStarts: string[] = []
    for (let i = HISTORY_WEEKS - 1; i >= 0; i -= 1) {
      const d = new Date(today)
      d.setUTCDate(today.getUTCDate() - i * 7)
      weekStarts.push(d.toISOString().slice(0, 10))
    }
    // Prefer reporting's anchors when they cover the window — keeps charts
    // consistent with the reporting view.
    const anchors = fromReporting.length >= HISTORY_WEEKS ? fromReporting.slice(-HISTORY_WEEKS) : weekStarts

    const weekIndex = (iso: string | null | undefined): number => {
      if (!iso) return -1
      const ts = new Date(iso).getTime()
      if (Number.isNaN(ts)) return -1
      for (let i = anchors.length - 1; i >= 0; i -= 1) {
        if (ts >= new Date(anchors[i]).getTime()) return i
      }
      return -1
    }

    const activeStudents: number[] = anchors.map((anchor) => {
      const w = (reporting?.weeklyEngagement ?? []).find((x) => x.weekStart === anchor)
      return w?.activeStudents ?? 0
    })

    // Cumulative published-lesson count as of each anchor's end-of-week.
    let publishedLessons: number[] = anchors.map(() => 0)
    try {
      const lessonsAll = await findAllDocs(payload, 'lessons')
      const sorted = (lessonsAll as Array<{ _status?: string; createdAt?: string; publishedAt?: string }>)
        .filter((l) => (l._status ?? 'published') !== 'draft')
        .map((l) => l.publishedAt || l.createdAt)
        .filter((d): d is string => typeof d === 'string' && !!d)
        .sort()
      publishedLessons = anchors.map((anchor) => {
        const cutoff = new Date(anchor).getTime() + 7 * 24 * 60 * 60 * 1000
        return sorted.filter((d) => new Date(d).getTime() < cutoff).length
      })
    } catch {
      publishedLessons = anchors.map((_, i) => Math.max(0, publishedLessonsCount - (HISTORY_WEEKS - 1 - i)))
    }

    // Per-week completion ratio over lesson-progress entries that updated in that week.
    const completionRate: number[] = anchors.map(() => 0)
    try {
      const progress = await findAllDocs(payload, 'lesson-progress')
      const buckets: Array<{ total: number; done: number }> = anchors.map(() => ({ total: 0, done: 0 }))
      ;(progress as Array<{ updatedAt?: string; completed?: boolean }>).forEach((p) => {
        const idx = weekIndex(p.updatedAt)
        if (idx < 0) return
        buckets[idx].total += 1
        if (p.completed) buckets[idx].done += 1
      })
      buckets.forEach((b, i) => {
        completionRate[i] = b.total ? Math.round((b.done / b.total) * 100) : 0
      })
    } catch {
      // leave zeros
    }

    return { activeStudents, publishedLessons, completionRate }
  }

  const kpiHistory = await (async () => {
    try {
      return await computeKpiHistory()
    } catch {
      return {
        activeStudents: Array(HISTORY_WEEKS).fill(0),
        publishedLessons: Array(HISTORY_WEEKS).fill(0),
        completionRate: Array(HISTORY_WEEKS).fill(0),
      }
    }
  })()

  const stats = {
    accounts: accountsCount,
    unanswered: unansweredCount,
    unreadFeedback: unreadFeedbackCount,
    awaitingLessonFeedback: awaitingLessonFeedbackCount,
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
      kpiHistory={kpiHistory}
    />
  )
}
