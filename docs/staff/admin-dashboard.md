## Admin Dashboard — Quick Guide for Staff

Access
- Admin UI runs at `http://admin.sbp.local:3000` in local dev (see `scripts/dev-setup.sh` to add host entries).
- Sign in using an account in the `users` collection. Admins can create other users.

Common tasks
- Manage pages and site content: use the `Pages` collection in the admin.
- Manage lessons and curriculum: `Classes`, `Chapters`, and `Lessons` collections.
- Upload media: use the `Media` collection.
- View student progress: `LessonProgress` and `QuizAttempts` collections.

Previewing content
- Use the live preview pane for `lessons` and `pages` where configured (see `payload.config.ts` `admin.livePreview`).

Permissions
- Roles: `admin`, `professor`, `staff`. Role-based access is enforced in collection `access` config (see `Users.ts`).

If you need a walkthrough or to enable additional roles, contact the project owner.
