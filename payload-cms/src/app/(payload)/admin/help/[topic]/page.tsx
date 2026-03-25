import React from 'react'
import Link from 'next/link'
import { Gutter } from '@payloadcms/ui'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { HELP_TOPICS, TOPIC_GLYPHS, findTopic } from '@/lib/adminHelpDocs'

type Props = { params: Promise<{ topic: string }> }

// ── CMS structured-content types ────────────────────────────────────────────

type CmsListItem = { text: string; href?: string | null }

type CmsBlock =
  | { blockType: 'paragraph'; text: string }
  | { blockType: 'note'; text: string }
  | { blockType: 'list'; type: 'bullets' | 'steps'; items: CmsListItem[] }
  | { blockType: 'linkCardGrid'; cards: { label: string; href: string; desc?: string | null }[] }

type CmsSection = {
  anchorId: string
  heading: string
  blocks?: CmsBlock[]
}

export async function generateStaticParams() {
  return HELP_TOPICS.map((t) => ({ topic: t.id }))
}

// ── Shared style helpers ────────────────────────────────────────────────────

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
  color: 'var(--cpp-muted)',
  fontWeight: 700,
  marginBottom: 10,
}

const card: React.CSSProperties = {
  border: '1px solid var(--admin-surface-border)',
  borderRadius: 10,
  padding: '11px 13px',
  background: '#fbfcff',
}

// ── Shared layout components ────────────────────────────────────────────────

function DocSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div id={id} style={{ marginBottom: 28, scrollMarginTop: 96 }}>
      <div
        style={{
          fontWeight: 800,
          fontSize: 16,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: '1px solid var(--admin-surface-border)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function StepList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ol style={{ paddingLeft: 20, margin: '8px 0', display: 'grid', gap: 5 }}>
      {items.map((item, i) => (
        <li key={i} style={{ lineHeight: 1.6, color: 'var(--cpp-muted)', fontSize: 13 }}>
          {item}
        </li>
      ))}
    </ol>
  )
}

function BulletList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul style={{ paddingLeft: 18, margin: '8px 0', display: 'grid', gap: 5 }}>
      {items.map((item, i) => (
        <li key={i} style={{ lineHeight: 1.6, color: 'var(--cpp-muted)', fontSize: 13 }}>
          {item}
        </li>
      ))}
    </ul>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderLeft: '3px solid #3b82f6',
        paddingLeft: 10,
        margin: '10px 0',
        color: 'var(--cpp-muted)',
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  )
}

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
    >
      {children}
    </Link>
  )
}

function Code({ children }: { children: string }) {
  return (
    <code
      style={{
        fontFamily: 'monospace',
        fontSize: 12,
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        borderRadius: 4,
        padding: '1px 5px',
      }}
    >
      {children}
    </code>
  )
}

// ── Per-topic content ────────────────────────────────────────────────────────

function GettingStartedContent() {
  return (
    <>
      <DocSection id="access" title="Access & Sign-in">
        <BulletList
          items={[
            <>Admin URL (local dev): <Code>http://admin.sbp.local:3000/admin</Code></>,
            <>Sign in with a <Code>users</Code> account — admin, staff, or professor role.</>,
            <>Forgot password? Use the forgot-password flow on the web app or ask an admin to reset it in <InlineLink href="/admin/collections/users">Users</InlineLink>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="roles" title="Roles">
        <div style={{ display: 'grid', gap: 7 }}>
          {[
            { role: 'admin', color: '#ef4444', desc: 'Full access — user management, role changes, settings, migrations, all content.' },
            { role: 'staff', color: '#f59e0b', desc: 'Content and student-support operations. Cannot manage users or change roles.' },
            { role: 'professor', color: '#10b981', desc: 'Content operations; classroom records limited to classrooms assigned to that professor.' },
          ].map(({ role, color, desc }) => (
            <div key={role} style={{ ...card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 999,
                  border: `1px solid ${color}40`,
                  color,
                  background: color + '12',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {role}
              </span>
              <span style={{ fontSize: 13, color: 'var(--cpp-muted)', lineHeight: 1.55 }}>{desc}</span>
            </div>
          ))}
        </div>
        <Note>
          Only <strong>admin</strong> users can assign roles. Use{' '}
          <InlineLink href="/admin/collections/users">Users</InlineLink> to change a user&apos;s{' '}
          <Code>role</Code> field.
        </Note>
      </DocSection>

      <DocSection id="layout" title="Admin Layout Tour">
        <BulletList
          items={[
            <><InlineLink href="/admin">Home dashboard</InlineLink> — main entry point</>,
            <><InlineLink href="/admin/reporting">NSF Reporting workspace</InlineLink> — RPPR hub</>,
            <>Top bar includes Back (when not on <Code>/admin</Code>), Light/Dark toggle, and user menu (Account, Help, Log out).</>,
            <>Most edit screens open in read/view mode first. Click <strong>Edit</strong> in the top-right to make fields editable.</>,
          ]}
        />
      </DocSection>

      <DocSection id="daily-checklist" title="Daily Opening Checklist">
        <StepList
          items={[
            <><InlineLink href="/admin/collections/questions?where[status][equals]=open">Review open questions</InlineLink> — answer unanswered student questions.</>,
            <><InlineLink href="/admin/collections/feedback">Review unread platform feedback</InlineLink> — mark read after reviewing.</>,
            <><InlineLink href="/admin/collections/lesson-feedback">Check lesson feedback</InlineLink> — reply to actionable comments.</>,
            <>Confirm any planned content changes are published.</>,
            <>Validate quiz assignments for upcoming lessons in <InlineLink href="/admin/quiz-bank">Quiz Bank</InlineLink>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="account" title="Your Account">
        <BulletList
          items={[
            <><InlineLink href="/admin/account">Your Account</InlineLink> — update your profile, email, and preferences.</>,
            <>To change your password, use the account page or the forgot-password flow.</>,
          ]}
        />
      </DocSection>
    </>
  )
}

function CoursesContent() {
  return (
    <>
      <DocSection id="overview" title="Course Structure">
        <BulletList
          items={[
            <><strong>Classes</strong> — top-level courses (e.g. &quot;Intro to Statics&quot;).</>,
            <><strong>Chapters</strong> — sections within a class.</>,
            <><strong>Lessons</strong> — individual content units within chapters. Lessons support drafts, publishing, and live preview.</>,
          ]}
        />
      </DocSection>

      <DocSection id="courses-dashboard" title="Courses Dashboard">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          The <InlineLink href="/admin/courses">Courses Dashboard</InlineLink> is the primary entry point for curriculum work.
        </p>
        <BulletList
          items={[
            <>Reorder courses by drag-and-drop, then confirm <strong>Save order</strong> in the modal.</>,
            <>Reorder chapters inside each course by drag-and-drop (then confirm <strong>Save order</strong>).</>,
          ]}
        />
      </DocSection>

      <DocSection id="creating" title="Creating Content">
        <div style={{ display: 'grid', gap: 7 }}>
          {[
            { label: 'Add course', href: '/admin/collections/classes/create', note: 'New class record' },
            { label: 'Add chapter', href: '/admin/collections/chapters/create', note: 'Link chapter to a class' },
            { label: 'Add lesson', href: '/admin/collections/lessons/create', note: 'Link lesson to a chapter' },
            { label: 'All classes', href: '/admin/collections/classes', note: 'Browse & edit courses' },
            { label: 'All chapters', href: '/admin/collections/chapters', note: 'Browse & edit chapters' },
            { label: 'All lessons', href: '/admin/collections/lessons', note: 'Browse & edit lessons' },
          ].map(({ label, href, note }) => (
            <div key={href} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{note}</div>
              </div>
              <Link
                href={href}
                style={{
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '5px 10px',
                  borderRadius: 7,
                  background: '#111827',
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Open →
              </Link>
            </div>
          ))}
        </div>
        <Note>
          To add a chapter to a specific course: <Code>/admin/collections/chapters/create?class=&#123;courseId&#125;</Code>
          <br />
          To add a lesson to a specific chapter: <Code>/admin/collections/lessons/create?chapter=&#123;chapterId&#125;</Code>
        </Note>
      </DocSection>

      <DocSection id="lesson-editor" title="Lesson Editor Tabs">
        <div style={{ display: 'grid', gap: 9 }}>
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Content tab</div>
            <BulletList
              items={[
                'Page layout blocks — lesson body content',
                'Lesson order — managed via reorder list',
                'Lesson Feedback panel — read student feedback and save staff replies',
              ]}
            />
          </div>
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Assessment tab</div>
            <BulletList
              items={[
                'Attach quiz',
                'Show answers after submit',
                'Max attempts',
                'Lesson-specific time limit override',
                'Quiz preview',
              ]}
            />
          </div>
        </div>
      </DocSection>

      <DocSection id="draft-publish" title="Draft & Publish">
        <BulletList
          items={[
            'Lessons support drafts and publishing.',
            'Use the top document controls to save draft or publish when ready.',
            'Classes and chapters do NOT have a draft workflow — changes save immediately.',
          ]}
        />
      </DocSection>
    </>
  )
}

function QuizzesContent() {
  return (
    <>
      <DocSection id="quiz-bank-overview" title="Quiz Bank Overview">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          The <InlineLink href="/admin/quiz-bank">Quiz Bank</InlineLink> is the primary entry point for quiz work.
        </p>
        <BulletList
          items={[
            'Filter quizzes by search, course, chapter, difficulty, and tag.',
            <>Create new quiz: <InlineLink href="/admin/collections/quizzes/create">Create Quiz</InlineLink>.</>,
            'Duplicate an existing quiz from the quiz card.',
            'Assign a quiz to one or more lessons (Assign to lessons button).',
            'Open each quiz in the full editor (Edit quiz button).',
          ]}
        />
      </DocSection>

      <DocSection id="quiz-editor" title="Quiz Editor">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Open a quiz at <InlineLink href="/admin/collections/quizzes">All Quizzes</InlineLink> or from the Quiz Bank.
        </p>
        <BulletList
          items={[
            'Add questions with the question picker field.',
            'Create new questions directly from the picker dialog.',
            <>Import questions via CSV from the picker dialog or Quiz Bank modal.</>,
            'Quizzes support drafts and publishing.',
          ]}
        />
      </DocSection>

      <DocSection id="csv-import" title="CSV Import Format">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Import quiz questions in bulk from a CSV file. Required and optional columns:
        </p>
        <div style={{ display: 'grid', gap: 6 }}>
          {[
            { col: 'title', req: true, desc: 'Question title' },
            { col: 'prompt (or question)', req: true, desc: 'Question text shown to students' },
            { col: 'option_1, option_2, option_3', req: true, desc: 'At least 3 answer options' },
            { col: 'option_n_correct', req: false, desc: 'Set true on correct option column(s)' },
            { col: 'correct_options', req: false, desc: 'Comma-separated option indices, e.g. 1,3' },
            { col: 'explanation', req: false, desc: 'Post-answer explanation' },
            { col: 'topic, tags, difficulty', req: false, desc: 'Metadata for filtering' },
          ].map(({ col, req, desc }) => (
            <div key={col} style={{ ...card, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Code>{col}</Code>
              {req && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', padding: '1px 5px', borderRadius: 4, border: '1px solid #ef444430', background: '#ef444410', flexShrink: 0, marginTop: 1 }}>
                  required
                </span>
              )}
              <span style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.5 }}>{desc}</span>
            </div>
          ))}
        </div>
        <Note>
          Example row: <Code>title,prompt,option_1,option_1_correct,option_2,option_3,correct_options,difficulty,tags</Code>
          <br />
          <Code>Forces intro,What is a force?,Push/pull,true,Velocity,Mass,1,intro,statics;basics</Code>
        </Note>
      </DocSection>

      <DocSection id="quiz-attempts" title="Quiz Attempts">
        <BulletList
          items={[
            <><InlineLink href="/admin/collections/quiz-attempts">Quiz Attempts</InlineLink> — view student attempt history, scores, and timestamps.</>,
            'Use filters to view per-student or per-quiz attempt records.',
          ]}
        />
      </DocSection>
    </>
  )
}

function StudentSupportContent() {
  return (
    <>
      <DocSection id="questions" title="Answering Student Questions">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Start with <InlineLink href="/admin/collections/questions?where[status][equals]=open">Open Questions</InlineLink> to see unanswered items.
        </p>
        <StepList
          items={[
            <>Open <InlineLink href="/admin/collections/questions?where[status][equals]=open">unanswered questions</InlineLink>.</>,
            'Add a staff response in the Answers array field.',
            <>Set status: <Code>open</Code> → waiting for staff | <Code>answered</Code> → staff responded | <Code>resolved</Code> → closed.</>,
          ]}
        />
        <Note>
          When a question gets a new answer and status is set to <Code>answered</Code>, a student notification is created automatically.
        </Note>
      </DocSection>

      <DocSection id="feedback" title="Platform Feedback">
        <BulletList
          items={[
            <><InlineLink href="/admin/collections/feedback">Feedback</InlineLink> — general platform feedback from students.</>,
            <>Mark items as read using the <Code>read</Code> checkbox after reviewing.</>,
            <><InlineLink href="/admin/collections/lesson-feedback">Lesson Feedback</InlineLink> — per-lesson comments from students.</>,
            'Reply to lesson feedback either in the Lesson Feedback collection or directly inside a lesson edit page via the Lesson Feedback panel.',
          ]}
        />
      </DocSection>

      <DocSection id="progress" title="Progress & Attempts">
        <div style={{ display: 'grid', gap: 7 }}>
          {[
            { label: 'Lesson Progress', href: '/admin/collections/lesson-progress', desc: 'Student completion state, timestamps, and rates per lesson.' },
            { label: 'Quiz Attempts', href: '/admin/collections/quiz-attempts', desc: 'Attempt history, scores, and timestamps per quiz.' },
            { label: 'Notifications', href: '/admin/collections/notifications', desc: 'System notifications sent to students.' },
          ].map(({ label, href, desc }) => (
            <div key={href} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{desc}</div>
              </div>
              <Link href={href} style={{ textDecoration: 'none', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 7, background: '#111827', color: '#f8fafc', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Open →
              </Link>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="account-issues" title="Account & Access Issues">
        <BulletList
          items={[
            <>For login issues, confirm account existence in <InlineLink href="/admin/collections/users">Users</InlineLink>.</>,
            <>Password reset: trigger from <InlineLink href="/admin/collections/users">Users</InlineLink> or ask student to use the forgot-password flow on the web app.</>,
            <>Re-enroll or override progress: admins may edit <InlineLink href="/admin/collections/lesson-progress">Lesson Progress</InlineLink> records directly in exceptional cases.</>,
          ]}
        />
      </DocSection>

      <DocSection id="escalation" title="When to Escalate">
        <BulletList
          items={[
            'If issues appear to be production infrastructure problems (DB outages, email delivery failures), escalate to the repo owner and ops lead.',
            'For access/permission problems beyond your role, escalate to an admin.',
          ]}
        />
      </DocSection>
    </>
  )
}

function ClassroomsContent() {
  return (
    <>
      <DocSection id="creating-classrooms" title="Creating a Classroom">
        <StepList
          items={[
            <><InlineLink href="/admin/collections/classrooms/create">Create a new classroom</InlineLink> — set class and professor.</>,
            <>A join code is auto-generated and stored in the sidebar.</>,
            'Use Regenerate join code (sidebar UI) when the current code needs to be refreshed.',
          ]}
        />
      </DocSection>

      <DocSection id="join-codes" title="Join Code Settings">
        <BulletList
          items={[
            'Adjust join code length from the classroom edit page.',
            'Adjust join code duration hours — how long the code remains valid.',
          ]}
        />
      </DocSection>

      <DocSection id="memberships" title="Memberships & Enrollment">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Use <InlineLink href="/admin/collections/classroom-memberships">Classroom Memberships</InlineLink> to view enrollment records.
        </p>
        <BulletList
          items={[
            'Joined date',
            'Completed lessons count',
            'Completion rate percentage',
            'Last activity timestamp',
          ]}
        />
      </DocSection>

      <DocSection id="classrooms-nav" title="Quick Links">
        <div style={{ display: 'grid', gap: 7 }}>
          {[
            { label: 'All Classrooms', href: '/admin/collections/classrooms', desc: 'Browse and edit classrooms' },
            { label: 'Create Classroom', href: '/admin/collections/classrooms/create', desc: 'New classroom record' },
            { label: 'Classroom Memberships', href: '/admin/collections/classroom-memberships', desc: 'Enrollment records' },
          ].map(({ label, href, desc }) => (
            <div key={href} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{desc}</div>
              </div>
              <Link href={href} style={{ textDecoration: 'none', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 7, background: '#111827', color: '#f8fafc', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Open →
              </Link>
            </div>
          ))}
        </div>
      </DocSection>
    </>
  )
}

function ReportingContent() {
  return (
    <>
      <DocSection id="rppr-workflow" title="RPPR Workflow">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Open the <InlineLink href="/admin/reporting">Reporting Center</InlineLink> to begin.
        </p>
        <StepList
          items={[
            <>Select a <InlineLink href="/admin/collections/reporting-periods">Reporting Period</InlineLink>.</>,
            'Apply cohort filters: class, professor, classroom, first-gen, transfer.',
            'Review RPPR section completeness and missing fields.',
            'Check KPI trend deltas vs. most recent comparable snapshot.',
            'Review data quality warnings and anomaly checks.',
            'Generate deterministic draft narratives (staff-edit required).',
            'Create immutable reporting snapshots (auto-reused when unchanged).',
            'Review evidence-link coverage by RPPR section.',
            'Export period outputs (see exports list below).',
          ]}
        />
      </DocSection>

      <DocSection id="exports" title="Available Exports">
        <div style={{ display: 'grid', gap: 5 }}>
          {[
            'RPPR JSON',
            'Overview CSV',
            'Participants CSV',
            'Organizations CSV',
            'Products CSV',
            'Evidence CSV',
            'Data quality CSV',
            'Metric drilldown CSV (authorized roles only)',
          ].map((exp) => (
            <div key={exp} style={{ ...card, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px' }}>
              <span style={{ fontSize: 12, color: '#6b7280', flexShrink: 0 }}>↓</span>
              <span style={{ fontSize: 13, color: 'var(--cpp-muted)' }}>{exp}</span>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="saved-views" title="Saved Views & Narratives">
        <BulletList
          items={[
            <>Save and reuse scope/filter sets via <InlineLink href="/admin/collections/reporting-saved-views">Reporting Saved Views</InlineLink>.</>,
            <>Edit manual narrative sections in <InlineLink href="/admin/collections/rppr-reports">RPPR Reports</InlineLink>.</>,
            <>Manage partner records in <InlineLink href="/admin/collections/organizations">Organizations</InlineLink>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="reporting-links" title="All Reporting Links">
        <div style={{ display: 'grid', gap: 7 }}>
          {[
            { label: 'Reporting Center', href: '/admin/reporting', desc: 'Main RPPR workspace' },
            { label: 'Reporting Periods', href: '/admin/collections/reporting-periods', desc: 'Manage & activate periods' },
            { label: 'RPPR Reports', href: '/admin/collections/rppr-reports', desc: 'Narrative sections' },
            { label: 'Organizations', href: '/admin/collections/organizations', desc: 'Partner records' },
            { label: 'Product Records', href: '/admin/collections/reporting-product-records', desc: 'Publications, patents, datasets, software' },
          ].map(({ label, href, desc }) => (
            <div key={href} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{desc}</div>
              </div>
              <Link href={href} style={{ textDecoration: 'none', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 7, background: '#111827', color: '#f8fafc', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Open →
              </Link>
            </div>
          ))}
        </div>
      </DocSection>
    </>
  )
}

function SiteManagementContent() {
  return (
    <>
      <DocSection id="pages" title="Managing Pages">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Start from <InlineLink href="/admin/site-management">Site Management</InlineLink> for an overview.
        </p>
        <BulletList
          items={[
            <>Create page: <InlineLink href="/admin/collections/pages/create">New Page</InlineLink>.</>,
            'Reorder pages with drag-and-drop list — confirm Save order in the modal.',
            'Pages support drafts and publishing. Use live preview for content review.',
          ]}
        />
      </DocSection>

      <DocSection id="footer" title="Footer Settings">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Edit the site footer at <InlineLink href="/admin/globals/footer">Footer Settings</InlineLink>.
        </p>
        <BulletList
          items={[
            'Footer links — update navigation links shown in the footer.',
            'Contact info — email, phone, and address.',
            'Feedback section — feedback CTA configuration.',
            'Bottom lines — copyright and legal text.',
          ]}
        />
      </DocSection>

      <DocSection id="admin-help-settings" title="Admin Help Content">
        <p style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Edit the help portal content at <InlineLink href="/admin/globals/admin-help">Admin Help Settings</InlineLink>.
        </p>
        <Note>Admin Help is currently admin-only to update.</Note>
        <BulletList
          items={[
            'Title and subtitle shown on the help hub.',
            'Quick actions — card links in the help portal.',
            'FAQ items — accordion questions and answers.',
            'Support email and response target.',
            'Resource cards.',
            'Rich text body for program-specific guidance.',
          ]}
        />
      </DocSection>

      <DocSection id="site-links" title="Quick Links">
        <div style={{ display: 'grid', gap: 7 }}>
          {[
            { label: 'Site Management', href: '/admin/site-management', desc: 'Overview & quick actions' },
            { label: 'All Pages', href: '/admin/collections/pages', desc: 'Browse published pages' },
            { label: 'Create Page', href: '/admin/collections/pages/create', desc: 'New page' },
            { label: 'Footer Settings', href: '/admin/globals/footer', desc: 'Footer links & content' },
            { label: 'Admin Help Settings', href: '/admin/globals/admin-help', desc: 'Edit help portal' },
          ].map(({ label, href, desc }) => (
            <div key={href} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{desc}</div>
              </div>
              <Link href={href} style={{ textDecoration: 'none', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 7, background: '#111827', color: '#f8fafc', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Open →
              </Link>
            </div>
          ))}
        </div>
      </DocSection>
    </>
  )
}

function TroubleshootingContent() {
  return (
    <>
      <DocSection id="locked-fields" title="Fields Are Not Editable">
        <StepList
          items={[
            <>Click <strong>Edit</strong> in the top-right of the document or global page.</>,
            <>If still locked, check your role in <InlineLink href="/admin/collections/users">Users</InlineLink> — some fields require admin.</>,
            <><strong>Admin Help</strong> global is admin-only to update.</>,
          ]}
        />
      </DocSection>

      <DocSection id="reorder-failed" title="Reorder Did Not Persist">
        <BulletList
          items={[
            'Confirm you clicked Save order in the confirmation modal after dragging.',
            'If the modal was dismissed without saving, changes are not persisted. Re-drag and confirm.',
          ]}
        />
      </DocSection>

      <DocSection id="schema-errors" title="Reporting Schema Errors">
        <StepList
          items={[
            <>Run <Code>pnpm payload migrate</Code> with Node 20.6+ in the <Code>payload-cms</Code> directory.</>,
            'Restart the dev server.',
            <><InlineLink href="/admin/reporting">Refresh the reporting page</InlineLink>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="cant-find" title="Cannot Find a Page or Action">
        <BulletList
          items={[
            <><InlineLink href="/admin">Return to Dashboard</InlineLink> and use the primary action buttons.</>,
            <><InlineLink href="/admin/courses">Manage Courses</InlineLink> — course/chapter/lesson work.</>,
            <><InlineLink href="/admin/quiz-bank">Open Quiz Bank</InlineLink> — quiz creation and assignment.</>,
            <><InlineLink href="/admin/site-management">Site Management</InlineLink> — pages and footer.</>,
            <><InlineLink href="/admin/reporting">Reporting Center</InlineLink> — RPPR workspace.</>,
          ]}
        />
      </DocSection>

      <DocSection id="user-roles" title="Need to Change User Roles or Create Staff Logins">
        <BulletList
          items={[
            <>Requires admin access. Use <InlineLink href="/admin/collections/users">Users</InlineLink> to change a user&apos;s <Code>role</Code> field.</>,
            <>Only <Code>admin</Code> users can assign or modify roles.</>,
          ]}
        />
      </DocSection>

      <DocSection id="draft-reference" title="Draft/Publish Reference">
        <div style={{ display: 'grid', gap: 7 }}>
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5 }}>Has draft workflow</div>
            <BulletList
              items={[
                <><InlineLink href="/admin/collections/pages">Pages</InlineLink></>,
                <><InlineLink href="/admin/collections/lessons">Lessons</InlineLink></>,
                <><InlineLink href="/admin/collections/quizzes">Quizzes</InlineLink></>,
                <><InlineLink href="/admin/collections/quiz-questions">Quiz Questions</InlineLink></>,
                <>Globals: <InlineLink href="/admin/globals/footer">Footer</InlineLink>, <InlineLink href="/admin/globals/admin-help">Admin Help</InlineLink></>,
              ]}
            />
          </div>
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5 }}>No draft workflow (immediate save)</div>
            <BulletList
              items={[
                'Classes, Chapters',
                'Classrooms, Classroom Memberships',
                'Student support records (questions, feedback, progress, attempts, notifications)',
              ]}
            />
          </div>
        </div>
      </DocSection>
    </>
  )
}

// ── TOC config per topic ────────────────────────────────────────────────────

const TOPIC_TOC: Record<string, { id: string; label: string }[]> = {
  'getting-started': [
    { id: 'access', label: 'Access & Sign-in' },
    { id: 'roles', label: 'Roles' },
    { id: 'layout', label: 'Admin Layout Tour' },
    { id: 'daily-checklist', label: 'Daily Checklist' },
    { id: 'account', label: 'Your Account' },
  ],
  courses: [
    { id: 'overview', label: 'Course Structure' },
    { id: 'courses-dashboard', label: 'Courses Dashboard' },
    { id: 'creating', label: 'Creating Content' },
    { id: 'lesson-editor', label: 'Lesson Editor Tabs' },
    { id: 'draft-publish', label: 'Draft & Publish' },
  ],
  quizzes: [
    { id: 'quiz-bank-overview', label: 'Quiz Bank Overview' },
    { id: 'quiz-editor', label: 'Quiz Editor' },
    { id: 'csv-import', label: 'CSV Import Format' },
    { id: 'quiz-attempts', label: 'Quiz Attempts' },
  ],
  'student-support': [
    { id: 'questions', label: 'Answering Questions' },
    { id: 'feedback', label: 'Platform Feedback' },
    { id: 'progress', label: 'Progress & Attempts' },
    { id: 'account-issues', label: 'Account Issues' },
    { id: 'escalation', label: 'When to Escalate' },
  ],
  classrooms: [
    { id: 'creating-classrooms', label: 'Creating a Classroom' },
    { id: 'join-codes', label: 'Join Code Settings' },
    { id: 'memberships', label: 'Memberships & Enrollment' },
    { id: 'classrooms-nav', label: 'Quick Links' },
  ],
  reporting: [
    { id: 'rppr-workflow', label: 'RPPR Workflow' },
    { id: 'exports', label: 'Available Exports' },
    { id: 'saved-views', label: 'Saved Views & Narratives' },
    { id: 'reporting-links', label: 'All Reporting Links' },
  ],
  'site-management': [
    { id: 'pages', label: 'Managing Pages' },
    { id: 'footer', label: 'Footer Settings' },
    { id: 'admin-help-settings', label: 'Admin Help Content' },
    { id: 'site-links', label: 'Quick Links' },
  ],
  troubleshooting: [
    { id: 'locked-fields', label: 'Fields Not Editable' },
    { id: 'reorder-failed', label: 'Reorder Did Not Persist' },
    { id: 'schema-errors', label: 'Schema Errors' },
    { id: 'cant-find', label: 'Cannot Find a Page' },
    { id: 'user-roles', label: 'Change User Roles' },
    { id: 'draft-reference', label: 'Draft/Publish Reference' },
  ],
}

function renderTopicContent(topicId: string): React.ReactNode {
  switch (topicId) {
    case 'getting-started': return <GettingStartedContent />
    case 'courses': return <CoursesContent />
    case 'quizzes': return <QuizzesContent />
    case 'student-support': return <StudentSupportContent />
    case 'classrooms': return <ClassroomsContent />
    case 'reporting': return <ReportingContent />
    case 'site-management': return <SiteManagementContent />
    case 'troubleshooting': return <TroubleshootingContent />
    default: return null
  }
}

// ── CMS block renderer ───────────────────────────────────────────────────────

function renderCmsBlock(block: CmsBlock, idx: number): React.ReactNode {
  if (block.blockType === 'paragraph') {
    return (
      <p key={idx} style={{ color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.6, margin: '0 0 8px' }}>
        {block.text}
      </p>
    )
  }
  if (block.blockType === 'note') {
    return (
      <Note key={idx}>{block.text}</Note>
    )
  }
  if (block.blockType === 'list') {
    const items = block.items ?? []
    const rendered = items.map((item, i) =>
      item.href ? (
        <InlineLink key={i} href={item.href}>{item.text}</InlineLink>
      ) : (
        item.text
      ),
    )
    return block.type === 'steps' ? (
      <StepList key={idx} items={rendered} />
    ) : (
      <BulletList key={idx} items={rendered} />
    )
  }
  if (block.blockType === 'linkCardGrid') {
    const cardStyle: React.CSSProperties = {
      border: '1px solid var(--admin-surface-border)',
      borderRadius: 10,
      padding: '11px 13px',
      background: '#fbfcff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    }
    return (
      <div key={idx} style={{ display: 'grid', gap: 7 }}>
        {(block.cards ?? []).map((card) => (
          <div key={card.href} style={cardStyle}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{card.label}</div>
              {card.desc && <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>{card.desc}</div>}
            </div>
            <Link
              href={card.href}
              style={{
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: 7,
                background: '#111827',
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Open →
            </Link>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function renderCmsSections(sections: CmsSection[]): React.ReactNode {
  return sections.map((section) => (
    <DocSection key={section.anchorId} id={section.anchorId} title={section.heading}>
      {(section.blocks ?? []).map((block, i) => renderCmsBlock(block, i))}
    </DocSection>
  ))
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function HelpTopicPage({ params }: Props) {
  const { topic: topicId } = await params
  const topic = findTopic(topicId)
  if (!topic) notFound()

  // Fetch CMS overrides
  const payload = await getPayload({ config: configPromise })
  const help = await payload.findGlobal({ slug: 'admin-help', overrideAccess: true })
  const helpAny = help as unknown as Record<string, unknown> | null
  const cmsTopics = (helpAny?.helpTopics as { topicId: string; sections?: CmsSection[] }[] | null) ?? []
  const cmsTopic = cmsTopics.find((t) => t.topicId === topic.id)
  const cmsSections: CmsSection[] = cmsTopic?.sections ?? []
  const hasCmsContent = cmsSections.length > 0

  // TOC: prefer CMS anchors, fall back to hardcoded
  const toc = hasCmsContent
    ? cmsSections.map((s) => ({ id: s.anchorId, label: s.heading }))
    : (TOPIC_TOC[topic.id] ?? [])

  return (
    <Gutter>
      <div style={{ maxWidth: 1120, margin: '20px auto 72px', color: 'var(--cpp-ink)' }}>
        {/* ── Breadcrumb ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--cpp-muted)',
            marginBottom: 14,
          }}
        >
          <Link href="/admin/help" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
            Help & Support
          </Link>
          <span>/</span>
          <span style={{ fontWeight: 600 }}>{topic.title}</span>
        </div>

        {/* ── Topic Header ── */}
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
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: topic.accentColor + '18',
                border: `1px solid ${topic.accentColor}30`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {TOPIC_GLYPHS[topic.id] ?? '📄'}
            </span>
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
                Help &amp; Support
              </div>
              <h1 style={{ fontSize: 24, margin: '4px 0 4px', fontWeight: 800 }}>{topic.title}</h1>
              <p style={{ margin: 0, color: 'var(--cpp-muted)', fontSize: 13, lineHeight: 1.5 }}>
                {topic.description}
              </p>
            </div>
          </div>
          <Link
            href="/admin/help"
            style={{
              textDecoration: 'none',
              borderRadius: 9,
              padding: '9px 14px',
              background: '#f8fafc',
              color: 'var(--cpp-ink)',
              fontWeight: 700,
              border: '1px solid var(--admin-surface-border)',
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            ← All Topics
          </Link>
        </div>

        {/* ── Primary Links Bar ── */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 14,
          }}
        >
          {topic.primaryLinks.map((lnk) => (
            <Link
              key={lnk.href}
              href={lnk.href}
              title={lnk.desc}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 13px',
                borderRadius: 9,
                border: `1px solid ${topic.accentColor}40`,
                background: topic.accentColor + '0d',
                color: topic.accentColor,
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: 'nowrap',
              }}
            >
              {lnk.label}
              <span style={{ opacity: 0.6, fontSize: 11 }}>↗</span>
            </Link>
          ))}
        </div>

        {/* ── Two-col: doc content + sidebar ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) minmax(220px, 1fr)',
            gap: 14,
            alignItems: 'start',
          }}
        >
          {/* Doc content */}
          <div
            style={{
              border: '1px solid var(--admin-surface-border)',
              borderRadius: 12,
              background: 'var(--admin-surface)',
              padding: '20px 20px',
            }}
          >
            {hasCmsContent ? renderCmsSections(cmsSections) : renderTopicContent(topic.id)}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'grid', gap: 10 }}>
            {/* TOC */}
            {toc.length > 0 && (
              <div
                style={{
                  border: '1px solid var(--admin-surface-border)',
                  borderRadius: 12,
                  background: 'var(--admin-surface)',
                  padding: '14px 14px',
                  position: 'sticky',
                  top: 88,
                }}
              >
                <div style={{ ...sectionLabel, marginBottom: 8 }}>In this topic</div>
                <div style={{ display: 'grid', gap: 3 }}>
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      style={{
                        textDecoration: 'none',
                        fontSize: 13,
                        color: 'var(--cpp-muted)',
                        padding: '4px 8px',
                        borderRadius: 6,
                        display: 'block',
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Support card */}
            <div
              style={{
                border: '1px solid var(--admin-surface-border)',
                borderRadius: 12,
                background: 'var(--admin-surface)',
                padding: '14px 14px',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15 }}>Need help now?</div>
              <p style={{ margin: '6px 0 10px', color: 'var(--cpp-muted)', fontSize: 12, lineHeight: 1.55 }}>
                For blockers or data issues, contact support with a screenshot and URL.
              </p>
              <Link
                href="/admin/collections/feedback/create"
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: 'center',
                  borderRadius: 8,
                  background: '#111827',
                  color: '#f8fafc',
                  border: '1px solid #111827',
                  fontWeight: 700,
                  padding: '9px 10px',
                  fontSize: 13,
                }}
              >
                Submit Support Request
              </Link>
            </div>

            {/* Other topics */}
            <div
              style={{
                border: '1px solid var(--admin-surface-border)',
                borderRadius: 12,
                background: 'var(--admin-surface)',
                padding: '14px 14px',
              }}
            >
              <div style={{ ...sectionLabel, marginBottom: 8 }}>Other topics</div>
              <div style={{ display: 'grid', gap: 4 }}>
                {HELP_TOPICS.filter((t) => t.id !== topic.id).map((t) => (
                  <Link
                    key={t.id}
                    href={`/admin/help/${t.id}`}
                    style={{
                      textDecoration: 'none',
                      fontSize: 13,
                      color: 'var(--cpp-ink)',
                      fontWeight: 600,
                      padding: '5px 8px',
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{TOPIC_GLYPHS[t.id] ?? '📄'}</span>
                    {t.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Gutter>
  )
}
