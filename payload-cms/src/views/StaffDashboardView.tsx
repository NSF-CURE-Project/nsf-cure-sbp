import type { AdminViewServerProps } from 'payload';
import { Gutter } from '@payloadcms/ui';
import React from 'react';

const cppGreen = '#005030';
const cppGold = '#FFB81C';
const cppCream = '#f7f4ee';
const cppInk = '#0b3d27';
const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(0, 80, 48, 0.12)',
  borderRadius: 12,
  padding: '10px 12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  display: 'inline-block',
  minWidth: 180,
  maxWidth: 200,
  background: '#ffffff',
  transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
  textAlign: 'center',
};

const quickCardStyle: React.CSSProperties = {
  border: '1px solid rgba(15, 23, 42, 0.12)',
  borderRadius: 14,
  padding: '16px 18px',
  background: '#ffffff',
  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const statCardStyle: React.CSSProperties = {
  border: '1px solid rgba(0, 80, 48, 0.12)',
  borderRadius: 14,
  padding: '14px 16px',
  background: 'rgba(255, 255, 255, 0.85)',
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.08)',
  minWidth: 140,
};

const EditHomePageCard = () => (
  <a href="/admin/globals/home-page" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Edit Home Page</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Edit the landing NSF CURE SBP landing page content here.
      </div>
    </div>
  </a>
);

const EditResourcesCard = () => (
  <a href="/admin/globals/resources-page" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Edit Resources Page</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Manage resources sections, links, and downloads.
      </div>
    </div>
  </a>
);

const EditContactPageCard = () => (
  <a href="/admin/globals/contact-page" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Edit Contact Us Page</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Update contact cards, titles, and hero copy.
      </div>
    </div>
  </a>
);

const EditGettingStartedCard = () => (
  <a href="/admin/globals/getting-started" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Edit Getting Started</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
        Update onboarding steps and resources.
      </div>
    </div>
  </a>
);

const QuickActionCard = ({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) => (
  <a href={href} style={{ textDecoration: 'none', color: 'inherit' }} className="quick-action-card">
    <div style={quickCardStyle}>
      <div style={{ fontSize: 16, fontWeight: 700, color: cppGreen }}>{title}</div>
      <div style={{ fontSize: 13, color: '#5b6f66', lineHeight: 1.4 }}>
        {description}
      </div>
    </div>
  </a>
);

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div style={statCardStyle}>
    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#5b6f66', fontWeight: 700 }}>
      {label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color: cppInk, marginTop: 6 }}>
      {value}
    </div>
  </div>
);

const CreateClassCard = () => (
  <a href="/admin/collections/classes/create" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Add Class</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>Create a new class entry.</div>
    </div>
  </a>
);

const CreateChapterCard = () => (
  <a href="/admin/collections/chapters/create" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Add Chapter</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>Create a new chapter for a class.</div>
    </div>
  </a>
);

const CreateLessonCard = () => (
  <a href="/admin/collections/lessons/create" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>Add Lesson</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>Create a new lesson for a chapter.</div>
    </div>
  </a>
);

const ManageClassesCard = () => (
  <a href="/admin/collections/classes" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>View / Edit Classes</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>Review, edit, or delete classes.</div>
    </div>
  </a>
);

const ManageChaptersCard = () => (
  <a href="/admin/collections/chapters" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>View / Edit Chapters</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>Review, edit, or delete chapters.</div>
    </div>
  </a>
);

const ManageLessonsCard = () => (
  <a href="/admin/collections/lessons" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700, color: cppGreen }}>View / Edit Lessons</div>
      <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>Review, edit, or delete lessons.</div>
    </div>
  </a>
);

const LogoutCard = () => (
  <a
    href="/admin/logout"
    style={{
      ...cardStyle,
      background: '#0f172a',
      color: '#f8fafc',
      borderColor: 'rgba(15, 23, 42, 0.35)',
      minWidth: 220,
    }}
  >
    <div style={{ fontSize: 18, fontWeight: 700 }}>Log out</div>
    <div style={{ marginTop: 4, fontSize: 14, color: '#cbd5e1' }}>Sign out of the admin panel</div>
  </a>
);

const AccountCard = () => (
  <a href="/admin/account" style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={cardStyle}>
      <div style={{ fontSize: 18, fontWeight: 700, color: cppGreen }}>View / Edit Staff Account</div>
    </div>
  </a>
);

const cardRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
};
const containerStyle: React.CSSProperties = {
  maxWidth: 1200,
  width: '100%',
  margin: '0 auto',
  padding: '24px 16px 48px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  alignItems: 'center',
};
const contentBoxStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 980,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 14,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: '#334155',
  marginTop: 8,
  fontWeight: 700,
  alignSelf: 'flex-start',
};

const helpBoxStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 720,
  borderRadius: 14,
  border: '1px solid rgba(0, 80, 48, 0.15)',
  background: '#f8f6f0',
  padding: '14px 16px',
  color: '#1f2937',
  lineHeight: 1.5,
};

const heroGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)',
  gap: 28,
  width: '100%',
  alignItems: 'center',
};

const heroCardStyle: React.CSSProperties = {
  borderRadius: 22,
  padding: '26px 28px',
  background: '#ffffff',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(0, 80, 48, 0.08)',
};

const mockPanelStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 18,
  border: '1px solid rgba(0, 80, 48, 0.12)',
  boxShadow: '0 18px 38px rgba(0, 0, 0, 0.12)',
  padding: '18px',
};

const mockHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
};

const mockChipStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  background: 'rgba(0, 80, 48, 0.08)',
  color: cppInk,
};

const StaffDashboardContent = ({
  user,
  stats,
}: {
  user?: AdminViewServerProps['initPageResult']['req']['user'];
  stats: {
    accounts: number;
    lessons: number;
    drafts: number;
  };
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
    `}</style>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
    <div style={containerStyle}>
      <div
        style={{
          width: '100%',
          borderRadius: 26,
          padding: '28px 28px 30px',
          background: `linear-gradient(135deg, rgba(0,80,48,0.06) 0%, rgba(255,184,28,0.2) 100%)`,
          border: '1px solid rgba(0, 80, 48, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)',
            backgroundSize: '120px 120px',
            opacity: 0.25,
            pointerEvents: 'none',
          }}
        />
        <div style={heroGridStyle}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: cppGreen, fontWeight: 800 }}>
              Staff Dashboard
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: '8px 0 12px', color: cppInk, lineHeight: 1.05 }}>
              NSF CURE Summer Bridge Program
            </h1>
            <p style={{ fontSize: 16, color: '#4b5f56', maxWidth: 460 }}>
              Welcome, {user?.email ?? 'team member'}, <br/>
              This is the dashboard for managing NSF CURE SBP operations.
            </p>
            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/admin/globals/home-page" style={{ textDecoration: 'none' }}>
                <div style={{ ...mockChipStyle, background: cppGreen, color: '#ffffff' }}>Edit Home Page</div>
              </a>
              <a href="/admin/collections/lessons/create" style={{ textDecoration: 'none' }}>
                <div style={mockChipStyle}>Add Lesson</div>
              </a>
              <a href="/admin/collections/classes" style={{ textDecoration: 'none' }}>
                <div style={mockChipStyle}>View Classes</div>
              </a>
              <a href="/admin/account" style={{ textDecoration: 'none' }}>
                <div style={mockChipStyle}>Your Account</div>
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
              <StatCard label="Lessons" value={`${stats.lessons}`} />
              <StatCard label="Drafts" value={`${stats.drafts}`} />
            </div>
            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              <div style={mockPanelStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: cppInk }}>Top task</div>
                <div style={{ fontSize: 12, color: '#5b6f66', marginTop: 4 }}>
                  Use the quick actions below to jump straight into edits.
                </div>
              </div>
              <div style={mockPanelStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: cppInk }}>Status</div>
                <div style={{ fontSize: 12, color: '#5b6f66', marginTop: 4 }}>
                  Drafts count updates from pages and lessons in progress.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={sectionLabelStyle}>Quick actions</div>
      <div style={{ ...contentBoxStyle }}>
        <div style={{ marginTop: 6, ...cardRowStyle }}>
          <QuickActionCard
            href="/admin/globals/home-page"
            title="Edit Home Page"
            description="Update hero, highlights, and blocks."
          />
          <QuickActionCard
            href="/admin/globals/resources-page"
            title="Edit Resources Page"
            description="Manage resources and downloads."
          />
          <QuickActionCard
            href="/admin/globals/contact-page"
            title="Edit Contact Page"
            description="Update staff contact cards."
          />
          <QuickActionCard
            href="/admin/globals/getting-started"
            title="Edit Getting Started"
            description="Refresh onboarding steps."
          />
          <QuickActionCard
            href="/admin/collections/lessons/create"
            title="Add Lesson"
            description="Create a new lesson for a chapter."
          />
        </div>
      </div>

      <div style={sectionLabelStyle}>Course actions</div>
      <div style={{ ...contentBoxStyle }}>
        <div style={{ marginTop: 6, ...cardRowStyle }}>
          <QuickActionCard
            href="/admin/collections/classes"
            title="View Classes"
            description="Review and edit class entries."
          />
          <QuickActionCard
            href="/admin/collections/classes/create"
            title="Add Class"
            description="Create a new class entry."
          />
          <QuickActionCard
            href="/admin/collections/chapters"
            title="View Chapters"
            description="Review and edit chapters."
          />
          <QuickActionCard
            href="/admin/collections/chapters/create"
            title="Add Chapter"
            description="Create a chapter for a class."
          />
          <QuickActionCard
            href="/admin/collections/lessons"
            title="View Lessons"
            description="Review and edit lessons."
          />
        </div>
      </div>

      <div style={helpBoxStyle}>
        <strong style={{ color: cppGreen }}>How to publish:</strong> open a page or lesson, click
        <strong> Save Draft</strong> while editing, then choose <strong>Publish changes</strong> when ready.
        Use the left menu for all content.
      </div>
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <LogoutCard />
      </div>
    </div>
    </div>
  </Gutter>
);

const AdminDashboardContent = ({
  user,
  stats,
}: {
  user?: AdminViewServerProps['initPageResult']['req']['user'];
  stats: {
    accounts: number;
    lessons: number;
    drafts: number;
  };
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
    `}</style>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={containerStyle}>
      <div
        style={{
          width: '100%',
          borderRadius: 26,
          padding: '28px 28px 30px',
          background: `linear-gradient(135deg, rgba(0,80,48,0.06) 0%, rgba(255,184,28,0.2) 100%)`,
          border: '1px solid rgba(0, 80, 48, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)',
            backgroundSize: '120px 120px',
            opacity: 0.25,
            pointerEvents: 'none',
          }}
        />
        <div style={heroGridStyle}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: cppGreen, fontWeight: 800 }}>
              Admin Dashboard
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: '8px 0 12px', color: cppInk, lineHeight: 1.05 }}>
              Full access, clean controls
            </h1>
            <p style={{ fontSize: 16, color: '#4b5f56', maxWidth: 460 }}>
              Welcome, {user?.email ?? 'admin'}. You have full access to content and settings.
              Use the quick actions to jump straight to edits and builds.
            </p>
            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/admin/globals/home-page" style={{ textDecoration: 'none' }}>
                <div style={{ ...mockChipStyle, background: cppGreen, color: '#ffffff' }}>Edit Home Page</div>
              </a>
              <a href="/admin/collections/lessons/create" style={{ textDecoration: 'none' }}>
                <div style={mockChipStyle}>Add Lesson</div>
              </a>
              <a href="/admin/collections/classes" style={{ textDecoration: 'none' }}>
                <div style={mockChipStyle}>View Classes</div>
              </a>
              <a href="/admin/account" style={{ textDecoration: 'none' }}>
                <div style={mockChipStyle}>Your Account</div>
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
              <StatCard label="Lessons" value={`${stats.lessons}`} />
              <StatCard label="Drafts" value={`${stats.drafts}`} />
            </div>
            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              <div style={mockPanelStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: cppInk }}>Top task</div>
                <div style={{ fontSize: 12, color: '#5b6f66', marginTop: 4 }}>
                  Use the quick actions below to jump straight into edits.
                </div>
              </div>
              <div style={mockPanelStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: cppInk }}>Status</div>
                <div style={{ fontSize: 12, color: '#5b6f66', marginTop: 4 }}>
                  Drafts count updates from pages and lessons in progress.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={sectionLabelStyle}>Quick actions</div>
      <div style={{ ...contentBoxStyle }}>
        <div style={{ marginTop: 6, ...cardRowStyle }}>
          <QuickActionCard
            href="/admin/globals/home-page"
            title="Edit Home Page"
            description="Update hero, highlights, and blocks."
          />
          <QuickActionCard
            href="/admin/globals/resources-page"
            title="Edit Resources Page"
            description="Manage resources and downloads."
          />
          <QuickActionCard
            href="/admin/globals/contact-page"
            title="Edit Contact Page"
            description="Update staff contact cards."
          />
          <QuickActionCard
            href="/admin/globals/getting-started"
            title="Edit Getting Started"
            description="Refresh onboarding steps."
          />
          <QuickActionCard
            href="/admin/collections/lessons/create"
            title="Add Lesson"
            description="Create a new lesson for a chapter."
          />
        </div>
      </div>

      <div style={sectionLabelStyle}>Course actions</div>
      <div style={{ ...contentBoxStyle }}>
        <div style={{ marginTop: 6, ...cardRowStyle }}>
          <QuickActionCard
            href="/admin/collections/classes"
            title="View Classes"
            description="Review and edit class entries."
          />
          <QuickActionCard
            href="/admin/collections/classes/create"
            title="Add Class"
            description="Create a new class entry."
          />
          <QuickActionCard
            href="/admin/collections/chapters"
            title="View Chapters"
            description="Review and edit chapters."
          />
          <QuickActionCard
            href="/admin/collections/chapters/create"
            title="Add Chapter"
            description="Create a chapter for a class."
          />
          <QuickActionCard
            href="/admin/collections/lessons"
            title="View Lessons"
            description="Review and edit lessons."
          />
        </div>
      </div>

      <div style={helpBoxStyle}>
        <strong style={{ color: cppGreen }}>How to publish:</strong> open a page or lesson, click
        <strong> Save Draft</strong> while editing, then choose <strong>Publish changes</strong> when ready.
        Use the left menu for all content.
      </div>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <LogoutCard />
      </div>
    </div>
    </div>
  </Gutter>
);

export default async function StaffDashboardView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { req } = initPageResult;
  const user = req.user;
  const role = user?.role ?? 'staff';
  const payload = req.payload;

  let lessonsCount = 0;
  let lessonsDraftCount = 0;
  let globalsDraftCount = 0;
  let accountsCount = 0;

  try {
    const lessons = await payload.find({
      collection: 'lessons',
      depth: 0,
      limit: 0,
    });
    lessonsCount = lessons.totalDocs ?? 0;
  } catch {
    lessonsCount = 0;
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
    });
    lessonsDraftCount = lessonDrafts.totalDocs ?? 0;
  } catch {
    lessonsDraftCount = 0;
  }

  try {
    const accounts = await payload.find({
      collection: 'accounts',
      depth: 0,
      limit: 0,
    });
    accountsCount = accounts.totalDocs ?? 0;
  } catch {
    accountsCount = 0;
  }

  const globalSlugs = ['home-page', 'resources-page', 'contact-page', 'getting-started'];
  for (const slug of globalSlugs) {
    try {
      const global = await payload.findGlobal({
        slug,
        draft: true,
      });
      if ((global as { _status?: string })._status === 'draft') {
        globalsDraftCount += 1;
      }
    } catch {
      // ignore
    }
  }

  const stats = {
    accounts: accountsCount,
    lessons: lessonsCount,
    drafts: lessonsDraftCount + globalsDraftCount,
  };

  return role === 'staff' ? (
    <StaffDashboardContent user={user} stats={stats} />
  ) : (
    <AdminDashboardContent user={user} stats={stats} />
  );
}
