## Admin Dashboard — Quick Guide for Staff

For the complete staff manual, see [`docs/staff/payload-admin-handbook.md`](../staff/payload-admin-handbook.md).

## Access

- Admin UI runs at `http://admin.sbp.local:3000` in local dev (see `scripts/dev-setup.sh` to add host entries).
- Sign in using an account in the `users` collection (roles: `admin`, `professor`, `staff`). Admins can create other users.

## Dashboard at a glance

`/admin` is rendered by `StaffDashboardView` (`payload-cms/src/views/StaffDashboardView.tsx`). It surfaces:

- A "Today" summary: drafts in flight, unread feedback, open questions, pending lesson feedback.
- Action cards for the main staff workspaces.
- A reporting gateway (entry into the RPPR workspace) when the caller has reporting access.

Each card primary action is one click; secondary actions appear underneath.

## Custom workspaces

| Card | Primary action | Secondary action |
| --- | --- | --- |
| Courses | `/admin/courses` (Manage Courses) | |
| Quizzes | `/admin/quiz-bank` (Open Quiz Bank) | `/admin/question-bank` (Question Bank) |
| Classrooms | `/admin/collections/classrooms` (Manage Classrooms) | `/admin/collections/classroom-memberships` (Memberships) |
| Site | `/admin/site-management` (Open Site Settings) | |
| Reporting | `/admin/reporting` | `/admin/collections/reporting-periods`, `/admin/collections/rppr-reports`, `/admin/collections/reporting-snapshots` |
| Student support | `/admin/student-performance` | `/admin/collections/questions?where[status][equals]=open`, `/admin/collections/feedback?where[read][equals]=false`, `/admin/collections/lesson-feedback` |
| Analytics | `/admin/user-analytics` | per-quiz `/admin/quiz-stats/[id]`, per-question `/admin/question-stats/[id]` |

The handbook lists the full set of custom pages including `/admin/concepts`, `/admin/pre-post`, `/admin/help`, and `/admin/settings`.

## Common tasks

- Manage lessons and curriculum: open `/admin/courses` (drag-and-drop outline; inline `+ Add chapter` / `+ Add lesson`).
- Upload media: use the `Media` collection.
- View student progress: `LessonProgress`, `QuizAttempts`, `ProblemAttempts` collections, or the Student Performance workspace for roster summaries.
- Manage classrooms and enrollments: `Classrooms` (sidebar holds join code) and `ClassroomMemberships`.
- Generate NSF RPPR reporting outputs: open `/admin/reporting`. Includes period/date-range scope, cohort filters, KPI trend deltas vs previous snapshots, evidence-link summaries, data quality checks, anomalies, exports, and snapshot trigger/reuse.

## Previewing content

- Use the live preview pane for `lessons` and `pages` where configured (see `admin.livePreview` in `payload-cms/src/payload.config.ts`).
- The lesson scaffold editor opens a publish-review modal with an embedded preview iframe (resolved from `WEB_PREVIEW_URL` + `PREVIEW_SECRET` + the lesson slug).

## Permissions

- Roles: `admin`, `professor`, `staff`. Role-based access is enforced in collection `access` config (see `payload-cms/src/collections/Users.ts`).
- Learner-level drilldowns (in the reporting workspace) are restricted to admin/staff via `payload-cms/src/reporting/permissions.ts`.

If you need a walkthrough or to enable additional roles, contact the project owner.
