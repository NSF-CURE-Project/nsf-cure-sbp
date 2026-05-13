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
| Classrooms | `/admin/classrooms` (Manage Classrooms) | `/admin/feedback` (Feedback inbox) |
| Site | `/admin/site-management` (Open Site Settings) | |
| Reporting | `/admin/reporting` | `/admin/collections/reporting-periods`, `/admin/collections/rppr-reports`, `/admin/collections/reporting-snapshots` |
| Student support | `/admin/student-performance` | `/admin/collections/questions?where[status][equals]=open`, `/admin/collections/feedback?where[read][equals]=false`, `/admin/collections/lesson-feedback` |
| Analytics | `/admin/user-analytics` | per-quiz `/admin/quiz-stats/[id]`, per-question `/admin/question-stats/[id]` |

The handbook lists the full set of custom pages including `/admin/concepts`, `/admin/pre-post`, `/admin/help`, and `/admin/settings`.

## Common tasks

- Manage lessons and curriculum: open `/admin/courses` (drag-and-drop outline; inline `+ Add chapter` / `+ Add lesson`).
- Upload media: use the `Media` collection.
- View student progress: `LessonProgress` and `QuizAttempts` collections, or the Student Performance workspace for roster summaries.
- Manage classrooms and enrollments: open `/admin/classrooms`. The list page filters by **Active / Archived / All**; the editor handles join-code rotation, archiving, and roster management (see "Custom admin pages" below).
- Generate NSF RPPR reporting outputs: open `/admin/reporting`. Includes period/date-range scope, cohort filters, KPI trend deltas vs previous snapshots, evidence-link summaries, data quality checks, anomalies, exports, and snapshot trigger/reuse.

## Custom admin pages

These pages live outside the generic `/admin/collections/...` UI and are the canonical surfaces for their data:

- **`/admin/classrooms`** — list of all classrooms with a status filter (Active / Archived / All), search, and member counts. Source: `payload-cms/src/views/classrooms/ClassroomsHome.tsx`.
  - **`/admin/classrooms/new`** — create wizard with searchable course + professor pickers. The current user is pre-selected as professor when eligible.
  - **`/admin/classrooms/[id]`** — editor with auto-save, join-code rotation (custom length / duration), copy code, copy invite message, duplicate, and archive. Archiving disables the join code immediately and surfaces a banner; the underlying `Classrooms` collection is hidden from the side-nav (`hidden: true`), so this view is the single edit surface.
  - **`/admin/classrooms/[id]/students`** — roster page with sort, search, per-student completion bar, last-activity, remove, and a row-click jump to `/admin/student-performance/[accountId]`.
- **`/admin/feedback`** — feedback inbox (unread/read filter, expand, delete). Source: `payload-cms/src/views/feedback/`.
- **`/admin/student-performance/[accountId]`** — per-student drill-down (chart, metrics, insights). Source: `payload-cms/src/views/student-performance/`.

The `Classrooms` and `ClassroomMemberships` collections are intentionally hidden from the standard Payload sidebar — edits made through `/admin/collections/...` bypass the polished UX. Use the custom pages above instead.

## Previewing content

- Use the live preview pane for `lessons` and `pages` where configured (see `admin.livePreview` in `payload-cms/src/payload.config.ts`).
- The lesson scaffold editor opens a publish-review modal with an embedded preview iframe (resolved from `WEB_PREVIEW_URL` + `PREVIEW_SECRET` + the lesson slug).

## Permissions

- Roles: `admin`, `professor`, `staff`. Role-based access is enforced in collection `access` config (see `payload-cms/src/collections/Users.ts`).
- Learner-level drilldowns (in the reporting workspace) are restricted to admin/staff via `payload-cms/src/reporting/permissions.ts`.

If you need a walkthrough or to enable additional roles, contact the project owner.
