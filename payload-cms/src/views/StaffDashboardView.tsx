import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

const cppGreen = '#334155'
const cppGold = '#94a3b8'
const cppCream = '#f8fafc'
const cppInk = '#0f172a'
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
  border: '1px solid rgba(0, 80, 48, 0.12)',
  borderRadius: 0,
  padding: '14px 16px',
  background: 'rgba(255, 255, 255, 0.85)',
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.08)',
  minWidth: 140,
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
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#5b6f66',
        fontWeight: 700,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color: cppInk, marginTop: 6 }}>{value}</div>
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
  maxWidth: 980,
  alignSelf: 'flex-start',
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 14,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: '#334155',
  marginTop: 8,
  fontWeight: 700,
  alignSelf: 'flex-start',
}

const helpBoxStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 720,
  borderRadius: 0,
  border: '1px solid rgba(0, 80, 48, 0.15)',
  background: '#f8f6f0',
  padding: '14px 16px',
  color: '#1f2937',
  lineHeight: 1.5,
}

const contentHealthCardStyle: React.CSSProperties = {
  borderRadius: 0,
  border: '1px solid rgba(15, 23, 42, 0.12)',
  background: '#ffffff',
  padding: '14px 16px',
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
}

import CourseCardList from './CourseCardList'

const heroGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)',
  gap: 28,
  width: '100%',
  alignItems: 'center',
}

const heroCardStyle: React.CSSProperties = {
  borderRadius: 0,
  padding: '20px 22px',
  background: '#ffffff',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(0, 80, 48, 0.08)',
  maxWidth: 520,
  width: '100%',
}

const mockPanelStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 0,
  border: '1px solid rgba(0, 80, 48, 0.12)',
  boxShadow: '0 18px 38px rgba(0, 0, 0, 0.12)',
  padding: '18px',
}

const mockHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
}

const mockChipStyle: React.CSSProperties = {
  borderRadius: 0,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  background: 'rgba(0, 80, 48, 0.08)',
  color: cppInk,
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
  }
  contentHealth: {
    lowCompletion: { id: string | number; title: string; rate: number }[]
    highQuestions: { id: string | number; title: string; count: number }[]
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
    `}</style>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={containerStyle}>
        <div
          style={{
            width: '100%',
            maxWidth: 1080,
            margin: '0 auto',
            borderRadius: 0,
            padding: '22px 22px 24px',
            background: `linear-gradient(135deg, rgba(148,163,184,0.16) 0%, rgba(226,232,240,0.5) 100%)`,
            border: '1px solid rgba(148, 163, 184, 0.28)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right, rgba(148, 163, 184, 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.16) 1px, transparent 1px)',
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
                  color: cppGreen,
                  fontWeight: 800,
                }}
              >
                Dashboard
              </div>
              <h1
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  margin: '8px 0 12px',
                  color: cppInk,
                  lineHeight: 1.05,
                }}
              >
                NSF CURE Summer Bridge Program
              </h1>
              <p style={{ fontSize: 16, color: '#4b5f56', maxWidth: 460 }}>
                Welcome, {user?.email ?? 'team member'}, <br />
                This is the dashboard for managing NSF CURE SBP operations.
              </p>
              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="/admin/collections/questions" style={{ textDecoration: 'none' }}>
                  <div
                    style={{ ...mockChipStyle, background: cppGreen, color: '#ffffff' }}
                    className="dashboard-chip"
                  >
                    Questions Inbox
                  </div>
                </a>
                <a href="/admin/collections/feedback" style={{ textDecoration: 'none' }}>
                  <div style={mockChipStyle} className="dashboard-chip">
                    Feedback Inbox
                  </div>
                </a>
                <a href="/admin/account" style={{ textDecoration: 'none' }}>
                  <div style={mockChipStyle} className="dashboard-chip">
                    Your Account
                  </div>
                </a>
                <a href="/admin/logout" style={{ textDecoration: 'none' }}>
                  <div style={mockChipStyle} className="dashboard-chip">
                    Log out
                  </div>
                </a>
              </div>
            </div>
            <div style={heroCardStyle}>
              <div style={mockHeaderStyle}>
                <div style={{ fontWeight: 700, color: cppInk }}>Quick Overview</div>
                <div style={mockChipStyle}>Live</div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <StatCard label="Student Accounts" value={`${stats.accounts}`} />
                <StatCard label="Unanswered Questions" value={`${stats.unanswered}`} />
                <StatCard label="Unread Feedback" value={`${stats.unreadFeedback}`} />
              </div>
              <div style={{ marginTop: 14 }}>
                <a
                  href="/admin/collections/lessons?where[_status][equals]=draft"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={mockPanelStyle} className="dashboard-panel">
                    <div style={{ fontSize: 13, fontWeight: 700, color: cppInk }}>View drafts</div>
                    <div style={{ fontSize: 12, color: '#5b6f66', marginTop: 4 }}>
                      See lessons that are still in draft.
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div style={sectionLabelStyle}>Courses</div>
        <div style={{ ...contentBoxStyle }}>
          <CourseCardList initialCourses={courseTree} />
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
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                Low completion lessons
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Lessons with completion rates below the threshold.
              </div>
              <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {contentHealth.lowCompletion.length ? (
                  contentHealth.lowCompletion.map((item) => (
                    <li key={String(item.id)}>
                      <a
                        href={`/admin/collections/lessons/${item.id}`}
                        style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 600 }}
                      >
                        {item.title}
                      </a>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {Math.round(item.rate * 100)}% complete
                      </div>
                    </li>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: '#64748b' }}>No low-completion lessons.</div>
                )}
              </ul>
            </div>
            <div style={contentHealthCardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                High question volume
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Lessons with unusually high student questions.
              </div>
              <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {contentHealth.highQuestions.length ? (
                  contentHealth.highQuestions.map((item) => (
                    <li key={String(item.id)}>
                      <a
                        href={`/admin/collections/lessons/${item.id}`}
                        style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 600 }}
                      >
                        {item.title}
                      </a>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{item.count} questions</div>
                    </li>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: '#64748b' }}>No high-volume lessons.</div>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div style={helpBoxStyle}>
          <strong style={{ color: cppGreen }}>How to publish:</strong> open a page or lesson, click
          <strong> Save Draft</strong> while editing, then choose <strong>Publish changes</strong>{' '}
          when ready. Use the left menu for all content.
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
  let courseTree: CourseTree[] = []
  const LOW_COMPLETION_THRESHOLD = 0.4
  const HIGH_QUESTION_THRESHOLD = 5
  let contentHealth = {
    lowCompletion: [] as { id: string | number; title: string; rate: number }[],
    highQuestions: [] as { id: string | number; title: string; count: number }[],
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
    }
  } catch {
    contentHealth = { lowCompletion: [], highQuestions: [] }
  }

  const stats = {
    accounts: accountsCount,
    unanswered: unansweredCount,
    unreadFeedback: unreadFeedbackCount,
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
