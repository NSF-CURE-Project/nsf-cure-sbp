## Admin Dashboard — Quick Guide for Staff

For the complete staff manual, see `docs/staff/payload-admin-handbook.md`.

Access

- Admin UI runs at `http://admin.sbp.local:3000` in local dev (see `scripts/dev-setup.sh` to add host entries).
- Sign in using an account in the `users` collection. Admins can create other users.

Common tasks

- Manage pages, branding, navigation, and admin users: open `/admin/site-management`.
- Manage lessons and curriculum: `Classes`, `Chapters`, and `Lessons` collections.
- Upload media: use the `Media` collection.
- View student progress: `LessonProgress` and `QuizAttempts` collections.
- Generate NSF RPPR reporting outputs: open `/admin/reporting`.
  - includes period/date-range scope, cohort filters, KPI trend deltas vs previous snapshots, evidence-link summaries, data quality checks, anomalies, exports, and snapshot trigger/reuse.

Previewing content

- Use the live preview pane for `lessons` and `pages` where configured (see `payload.config.ts` `admin.livePreview`).

Permissions

- Roles: `admin`, `professor`, `staff`. Role-based access is enforced in collection `access` config (see `Users.ts`).

If you need a walkthrough or to enable additional roles, contact the project owner.
