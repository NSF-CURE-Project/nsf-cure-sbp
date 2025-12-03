import type { AdminViewServerProps } from 'payload';
import { Gutter } from '@payloadcms/ui';
import React from 'react';

const cppGreen = '#005030';
const cppGold = '#FFB81C';
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
  gap: 12,
  flexWrap: 'wrap',
  justifyContent: 'center',
};
const containerStyle: React.CSSProperties = {
  maxWidth: 1100,
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
  maxWidth: 720,
};

const StaffDashboardContent = ({
  user,
}: {
  user?: AdminViewServerProps['initPageResult']['req']['user'];
}) => (
  <Gutter>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
    <div style={containerStyle}>
      <div
        style={{
          background: `linear-gradient(135deg, ${cppGreen} 0%, ${cppGold} 100%)`,
          color: '#fefefe',
          borderRadius: 18,
          padding: '20px 22px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
          width: '100%',
          maxWidth: 720,
        }}
      >
        <div style={{ fontSize: 14, letterSpacing: 0.4, opacity: 0.95, fontWeight: 700 }}>
          Role: Staff
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '4px 0 6px' }}>NSF CURE SBP Dashboard</h1>
        <div style={{ fontSize: 15, opacity: 0.95 }}>
          Welcome, {user?.email ?? 'team member'} 👋 <br></br>
           Here you can modify page content, create classes and lessons and more. <br></br>
           <strong>
            This is the staff view. For software engineer level access, contact the site administrator. 
           </strong>
        </div>
      </div>
      <div style={{ ...contentBoxStyle, display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <AccountCard />
      </div>
      <div style={{ fontSize: 15, letterSpacing: 0.6, textTransform: 'uppercase', color: '#334155', marginTop: 10, fontWeight: 700 }}>
        Manage main page content
      </div>
      <div style={{ ...contentBoxStyle }}>
        <div style={{ marginTop: 4, ...cardRowStyle }}>
          <EditHomePageCard />
          <EditResourcesCard />
          <EditContactPageCard />
        </div>
      </div>
      <div
        style={{
          margin: '18px 0 10px',
          width: '100%',
          maxWidth: 720,
          height: 1,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 15%, rgba(255,255,255,0.25) 85%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div style={{ fontSize: 15, letterSpacing: 0.6, textTransform: 'uppercase', color: '#334155', marginTop: 10, fontWeight: 700 }}>
        Manage course content
      </div>
      <div style={{ ...contentBoxStyle }}>
        <div style={{ marginTop: 4, ...cardRowStyle }}>
          <CreateClassCard />
          <CreateChapterCard />
          <CreateLessonCard />
          <ManageClassesCard />
          <ManageChaptersCard />
          <ManageLessonsCard />
        </div>
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
}: {
  user?: AdminViewServerProps['initPageResult']['req']['user'];
}) => (
  <Gutter>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={containerStyle}>
      <div
        style={{
          background: `linear-gradient(135deg, ${cppGold} 0%, ${cppGreen} 100%)`,
          color: '#0f172a',
          borderRadius: 18,
          padding: '20px 22px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
          width: '100%',
          maxWidth: 720,
        }}
      >
        <div style={{ fontSize: 14, letterSpacing: 0.4, color: '#0f172a', fontWeight: 700 }}>
          Role: Admin
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '4px 0 6px' }}>NSF CURE SBP Dashboard</h1>
        <div style={{ fontSize: 15, color: '#1f2937' }}>
          Welcome, {user?.email ?? 'admin'} 👋 <br></br>
          You have complete admin access to the site and it's configurations. <br></br>
          <strong>
            Only designated software engineers are allowed this level of access.
          </strong>
        </div>
      </div>
      <div style={{ ...contentBoxStyle, display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <AccountCard />
      </div>
      <div style={{ fontSize: 15, letterSpacing: 0.6, textTransform: 'uppercase', color: '#334155', marginTop: 10, fontWeight: 700 }}>
        Manage main page content
      </div>
      <div style={{ ...contentBoxStyle }}>
        <div style={{ marginTop: 4, ...cardRowStyle }}>
          <EditHomePageCard />
          <EditResourcesCard />
          <EditContactPageCard />
        </div>
      </div>
      <div
        style={{
          margin: '18px 0 10px',
          width: '100%',
          maxWidth: 720,
          height: 1,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 15%, rgba(255,255,255,0.25) 85%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div style={{ fontSize: 15, letterSpacing: 0.6, textTransform: 'uppercase', color: '#334155', marginTop: 10, fontWeight: 700 }}>
        Manage course content
      </div>
      <div style={{ ...contentBoxStyle }}>
        <div style={{ marginTop: 4, ...cardRowStyle }}>
          <CreateClassCard />
          <CreateChapterCard />
          <CreateLessonCard />
          <ManageClassesCard />
          <ManageChaptersCard />
          <ManageLessonsCard />
        </div>
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

export default function StaffDashboardView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { req } = initPageResult;
  const user = req.user;
  const role = user?.role ?? 'staff';

  return role === 'staff' ? (
    <StaffDashboardContent user={user} />
  ) : (
    <AdminDashboardContent user={user} />
  );
}
