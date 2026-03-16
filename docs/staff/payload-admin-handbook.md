# Payload Admin Staff Handbook (NSF CURE SBP)

Last updated: March 3, 2026

This guide is for staff using the Payload admin at `admin.sbp.local` to manage courses, quizzes, student support, classrooms, and site content.

## Access and roles

- Admin URL (local): `http://admin.sbp.local:3000/admin`
- Sign in with a `users` account (admin, staff, or professor role).
- Role summary:
  - `admin`: full access, including user management and role changes.
  - `staff`: content and student-support operations.
  - `professor`: content operations; classroom records are limited to classrooms assigned to that professor.

Important permission note:
- `Admin Help` (`/admin/globals/admin-help`) is currently admin-only for updates.

## Admin layout quick tour

- Home dashboard: `/admin`
- NSF reporting workspace: `/admin/reporting`
- Top bar:
  - `Back` appears when you are not on `/admin`.
  - `Light mode`/`Dark mode` toggle.
  - User menu: `Your Account`, `Help`, `Log out`.
- Most edit screens open in read/view mode first. Click `Edit` in the top-right to make fields editable.

## Daily workflows

### 1. Manage courses, chapters, and lessons

Primary route:
- `/admin/courses` (Dashboard button: `Manage Courses`)

What you can do there:
- Reorder courses by drag-and-drop (then confirm `Save order` in modal).
- Reorder chapters inside each course by drag-and-drop (then confirm `Save order`).
- Add/edit content quickly:
  - `Add course`: `/admin/collections/classes/create`
  - `Add chapter`: `/admin/collections/chapters/create?class=<courseId>`
  - `Add lesson`: `/admin/collections/lessons/create?chapter=<chapterId>`
  - `Edit course/chapter/lesson`: links from each card

Lesson editing (`/admin/collections/lessons/<id>`):
- `Content` tab:
  - Page layout blocks (lesson body content)
  - Lesson order (managed via reorder list)
  - Lesson feedback panel (read student feedback and save staff replies)
- `Assessment` tab:
  - Attach quiz
  - Show answers after submit
  - Max attempts
  - Lesson-specific time limit override
  - Quiz preview

Draft/publish:
- Lessons support drafts and publishing.
- Use top document controls to save draft or publish when ready.

### 2. Quiz Bank (create, duplicate, assign, import)

Primary route:
- `/admin/quiz-bank` (Dashboard button: `Open Quiz Bank`)

What you can do:
- Filter quizzes by search/course/chapter/difficulty/tag.
- Create new quiz: `/admin/collections/quizzes/create`
- Duplicate an existing quiz.
- Assign quiz to one or more lessons (`Assign to lessons`).
- Open each quiz in full editor (`Edit quiz`).

Quiz editor highlights (`/admin/collections/quizzes/<id>`):
- Add questions with the question picker field.
- Create new questions from the picker dialog.
- Import question CSV from picker dialog or Quiz Bank modal.
- Quiz supports drafts/publishing.

CSV import requirements for quiz questions:
- Required columns: `title`, and `prompt` (or `question`)
- Must include at least `option_1`, `option_2`, `option_3`
- Correct answers:
  - either `option_n_correct` columns
  - or `correct_options` (comma-separated option indices, like `1,3`)
- Optional columns: `explanation`, `topic`, `tags`, `difficulty`

Example CSV row:
```csv
title,prompt,option_1,option_1_correct,option_2,option_3,correct_options,difficulty,tags
Forces intro,What is a force?,Push/pull,true,Velocity,Mass,1,intro,statics;basics
```

### 3. Student support operations

Collections to use:
- Questions: `/admin/collections/questions`
- Feedback: `/admin/collections/feedback`
- Lesson Feedback: `/admin/collections/lesson-feedback`
- Lesson Progress: `/admin/collections/lesson-progress`
- Quiz Attempts: `/admin/collections/quiz-attempts`
- Notifications: `/admin/collections/notifications`

Recommended workflow:
- Open unanswered questions:
  - `/admin/collections/questions?where[status][equals]=open`
- Add staff response in `Answers` array.
- Set/confirm status:
  - `open` -> waiting for staff
  - `answered` -> staff responded
  - `resolved` -> issue closed
- Mark platform feedback as read in `Feedback` (`read` checkbox).
- Reply to lesson feedback either:
  - in `Lesson Feedback` collection, or
  - directly inside a lesson edit page via `Lesson Feedback` panel.

Behavior to know:
- When a question gets a new answer and status is answered, a student notification is created automatically.

### 4. Classrooms and enrollments

Collections:
- Classrooms: `/admin/collections/classrooms`
- Classroom memberships: `/admin/collections/classroom-memberships`

Typical process:
- Create classroom, set class + professor.
- Join code is auto-generated and stored in sidebar.
- Use `Regenerate join code` (sidebar UI) when needed.
- Adjust:
  - join code length
  - join code duration hours
- Use memberships list to view:
  - joined date
  - completed lessons
  - completion rate
  - last activity

### 5. Site management

Primary route:
- `/admin/site-management`

What you can do:
- Navigation pages:
  - Create page: `/admin/collections/pages/create`
  - Reorder pages with drag-and-drop list (save confirm modal)
- Footer content:
  - `/admin/globals/footer`
  - edit links, contact info, feedback section, bottom lines
- Admin help content:
  - `/admin/globals/admin-help`
  - currently admin-only to update

### 6. NSF reporting (RPPR workflow)

Primary route:
- `/admin/reporting`

What you can do:
- Select a reporting period from `Reporting Periods`.
- Apply cohort filters (class, professor, classroom, first-gen, transfer).
- Review RPPR section completeness and missing fields.
- Review KPI trend deltas versus the most recent comparable snapshot.
- Review metric definitions and drilldown API links.
- Review data quality warnings and anomaly checks before export.
- Generate deterministic draft narratives (staff-edit required).
- Create immutable reporting snapshots (with automatic reuse when unchanged).
- Review evidence-link coverage by RPPR section.
- Save the current scope/filter combination for reuse.
- Review recent reporting audit events.
- Export period-specific outputs:
  - RPPR JSON
  - Overview CSV
  - Participants CSV
  - Organizations CSV
  - Products CSV
  - Evidence CSV
  - Data quality CSV
  - Metric drilldown CSV (authorized roles only)
- Save and reuse scope/filter sets via `Reporting Saved Views`.
- Edit manual narrative sections in `RPPR Reports`.
- Manage partner records in `Organizations`.

Pages support drafts and publishing.

## Draft/publish reference

Draft-enabled content in this project:
- `pages`
- `lessons`
- `quizzes`
- `quiz-questions`
- globals: `footer`, `admin-help`

No draft workflow (immediate save) for:
- `classes`, `chapters`
- `classrooms`, `classroom-memberships`
- most student-support records (questions, feedback, progress, attempts, notifications)

## Troubleshooting

Fields are not editable:
- Click `Edit` in the top-right of the document/global page.
- If still locked, check role permissions.
- For `Admin Help`, only admin can update currently.

Reorder did not persist:
- Confirm you clicked `Save order` in the confirmation modal after dragging.

Cannot find a page/action:
- Start from dashboard (`/admin`) and use:
  - `Manage Courses`
  - `Open Quiz Bank`
  - `Site Management`

Need to change user roles or create staff logins:
- Requires admin access in `/admin/collections/users`.

## Staff operating checklist

At the start of each day:
- Review open questions.
- Review unread platform feedback.
- Check lesson feedback and reply to actionable comments.
- Confirm any planned content changes are published.
- Validate quiz assignments for upcoming lessons.
