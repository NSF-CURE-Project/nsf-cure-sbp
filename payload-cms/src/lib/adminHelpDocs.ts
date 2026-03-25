export type HelpLink = {
  label: string
  href: string
  desc?: string
}

export type HelpTopic = {
  id: string
  title: string
  description: string
  accentColor: string
  primaryLinks: HelpLink[]
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Dashboard orientation, navigation layout, roles, and daily checklist.',
    accentColor: '#3b82f6',
    primaryLinks: [
      { label: 'Dashboard', href: '/admin', desc: 'Admin home' },
      { label: 'Your Account', href: '/admin/account', desc: 'Profile & preferences' },
      { label: 'Users', href: '/admin/collections/users', desc: 'Manage user roles' },
    ],
  },
  {
    id: 'courses',
    title: 'Courses & Curriculum',
    description: 'Create and manage courses, chapters, lessons, content blocks, and publishing.',
    accentColor: '#8b5cf6',
    primaryLinks: [
      { label: 'Courses Dashboard', href: '/admin/courses', desc: 'Reorder & overview' },
      { label: 'Add Course', href: '/admin/collections/classes/create', desc: 'New class' },
      { label: 'All Chapters', href: '/admin/collections/chapters', desc: 'Browse chapters' },
      { label: 'All Lessons', href: '/admin/collections/lessons', desc: 'Browse lessons' },
    ],
  },
  {
    id: 'quizzes',
    title: 'Quiz Bank',
    description: 'Create, duplicate, assign, and CSV-import quizzes and quiz questions.',
    accentColor: '#f59e0b',
    primaryLinks: [
      { label: 'Quiz Bank', href: '/admin/quiz-bank', desc: 'Browse & manage' },
      { label: 'Create Quiz', href: '/admin/collections/quizzes/create', desc: 'New quiz' },
      { label: 'Quiz Questions', href: '/admin/collections/quiz-questions', desc: 'Question library' },
      { label: 'Quiz Attempts', href: '/admin/collections/quiz-attempts', desc: 'Student attempts' },
    ],
  },
  {
    id: 'student-support',
    title: 'Student Support',
    description: 'Answer questions, review feedback, track progress, and send notifications.',
    accentColor: '#10b981',
    primaryLinks: [
      {
        label: 'Open Questions',
        href: '/admin/collections/questions?where[status][equals]=open',
        desc: 'Unanswered questions',
      },
      { label: 'All Feedback', href: '/admin/collections/feedback', desc: 'Platform feedback' },
      { label: 'Lesson Feedback', href: '/admin/collections/lesson-feedback', desc: 'Per-lesson feedback' },
      { label: 'Lesson Progress', href: '/admin/collections/lesson-progress', desc: 'Student progress' },
    ],
  },
  {
    id: 'classrooms',
    title: 'Classrooms',
    description: 'Create classrooms, manage join codes, and review enrollment records.',
    accentColor: '#ec4899',
    primaryLinks: [
      { label: 'Classrooms', href: '/admin/collections/classrooms', desc: 'All classrooms' },
      { label: 'Memberships', href: '/admin/collections/classroom-memberships', desc: 'Enrollment records' },
    ],
  },
  {
    id: 'reporting',
    title: 'NSF Reporting',
    description: 'RPPR workflow, KPI trends, data quality checks, exports, and snapshots.',
    accentColor: '#ef4444',
    primaryLinks: [
      { label: 'Reporting Center', href: '/admin/reporting', desc: 'RPPR workspace' },
      {
        label: 'Reporting Periods',
        href: '/admin/collections/reporting-periods',
        desc: 'Manage periods',
      },
      { label: 'RPPR Reports', href: '/admin/collections/rppr-reports', desc: 'Narrative sections' },
      { label: 'Organizations', href: '/admin/collections/organizations', desc: 'Partner records' },
    ],
  },
  {
    id: 'site-management',
    title: 'Site Management',
    description: 'Manage navigation pages, footer content, and global site settings.',
    accentColor: '#06b6d4',
    primaryLinks: [
      { label: 'Site Management', href: '/admin/site-management', desc: 'Overview' },
      { label: 'All Pages', href: '/admin/collections/pages', desc: 'Published pages' },
      { label: 'Create Page', href: '/admin/collections/pages/create', desc: 'New page' },
      { label: 'Footer Settings', href: '/admin/globals/footer', desc: 'Footer links & content' },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Fixes for locked fields, reorder failures, schema errors, and access issues.',
    accentColor: '#6b7280',
    primaryLinks: [
      { label: 'Dashboard', href: '/admin', desc: 'Start from home' },
      { label: 'Users', href: '/admin/collections/users', desc: 'Access & role issues' },
      {
        label: 'Admin Help Settings',
        href: '/admin/globals/admin-help',
        desc: 'Edit help content',
      },
    ],
  },
]

export const TOPIC_GLYPHS: Record<string, string> = {
  'getting-started': '⚡',
  courses: '📚',
  quizzes: '🧠',
  'student-support': '🎓',
  classrooms: '🏫',
  reporting: '📊',
  'site-management': '🌐',
  troubleshooting: '🔧',
}

export function findTopic(id: string): HelpTopic | undefined {
  return HELP_TOPICS.find((t) => t.id === id)
}
