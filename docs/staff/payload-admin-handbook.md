# Payload Admin Staff Handbook (NSF CURE SBP)

Last updated: May 12, 2026

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
  - User menu (avatar + name + role chip):
    - Account section: `Preferences` → `/admin/account`, `Notifications` → `/admin/collections/notifications`.
    - System section: `Help & Support` → `/admin/help`, `Sign Out`.
- Most edit screens open in read/view mode first. Click `Edit` in the top-right to make fields editable.

## Custom dashboard pages

Beyond Payload's collection lists, the dashboard surfaces purpose-built workspaces. All are linked from the home dashboard cards but can also be opened directly:

| Page | Route | What it is |
| --- | --- | --- |
| Courses workspace | `/admin/courses` | Drag-and-drop course/chapter/lesson outline with inline create. |
| Quiz Bank | `/admin/quiz-bank` | Filter, duplicate, assign, and CSV-import quizzes. |
| Question Bank | `/admin/question-bank` | Cross-quiz question pool with usage stats. |
| Question Stats | `/admin/question-stats/[questionId]` | Per-question performance + drilldown. |
| Quiz Stats | `/admin/quiz-stats/[quizId]` | Per-quiz attempt summary + mastery curve. |
| Concept Library | `/admin/concepts` (+ `/[slug]`) | Learning outcomes mapped to content. |
| Pre/Post Assessments | `/admin/pre-post` (+ `/[id]`) | Pre-vs-post quiz pairings, normalized-gain views. |
| Student Performance | `/admin/student-performance` | Roster-level progress and quiz performance. |
| User Analytics | `/admin/user-analytics` | Per-instructor activity, drilldown into class performance. |
| Site Management | `/admin/site-management` | Navigation pages, footer, branding, admin help. |
| Reporting Center | `/admin/reporting` | NSF RPPR workspace (see section below). |
| Settings | `/admin/settings` | Account/admin settings. |
| Help Portal | `/admin/help` (+ `/[topic]`) | Staff-facing help content backed by the `AdminHelp` global. |

## Daily workflows

### 1. Manage courses, chapters, and lessons

Primary route:
- `/admin/courses` (Dashboard button: `Manage Courses`)

What you can do there:
- Reorder courses by drag-and-drop (then confirm `Save order` in modal).
- Reorder chapters inside each course by drag-and-drop (then confirm `Save order`).
- Add content inline without leaving the page:
  - `+ Add chapter` button under each course (replaces the older `/admin/collections/chapters/create?class=…` link).
  - `+ Add lesson` row inside each chapter.
- Open the full lesson scaffold editor via the lesson row.
- Add a new course: `+ Add course` opens `/admin/courses/new`.

#### Lesson editor (scaffold)

Lesson editing now uses a 3-column scaffold editor at `/admin/courses/[courseId]/lessons/[lessonId]/edit` (also reachable from a lesson row). The Payload-default lesson document view is replaced by this custom editor for create and edit.

Layout:
- Left — **Outline panel**: chapter context, ordered list of blocks, jump-to navigation.
- Center — **Block canvas**: stack of block cards rendered by `BlockList` + `BlockCard`. Each card has a drag handle, inline edit (`BlockEditor`), and an overflow menu (duplicate / delete / move).
- Right — **Inspector panel**: settings for the currently selected block plus lesson-level fields (title, assessment, status).

Toolbar (sticky at top):
- `Cancel` returns to `/admin/courses`.
- Auto-save indicator (edit mode only) shows `Auto-saving…` / `Saved Xs ago` / `Save failed`.
- `Save draft` / `Publish` actions. Publish opens `PublishReviewModal` (live preview iframe + summary of changes).

Block types you can add (`payload-cms/src/blocks/pageBlocks.ts`):
- `sectionTitle` — section heading.
- `richTextBlock` — Lexical rich text with math and figure support.
- `textSection` — short text passage with optional heading.
- `videoBlock` — embedded video.
- `listBlock` — bulleted/numbered list.
- `stepsList` — ordered step-by-step list.
- `buttonBlock` — call-to-action button.
- `quizBlock` — embedded quiz reference.
- `heroBlock`, `resourcesList`, `contactsList` — used primarily on Pages.

Drafts and publishing:
- Lessons (and pages, quizzes, problems, RPPR reports) support drafts.
- Use the toolbar `Save draft` / `Publish` controls in the scaffold editor, or the document controls on standard Payload views.

Feedback loop:
- The lesson editor surfaces the `LessonFeedback` panel inline so staff can read student feedback and respond without leaving the lesson.

### 2. Quiz Bank (create, duplicate, assign, import)

Primary route:
- `/admin/quiz-bank` (Dashboard button: `Open Quiz Bank`)

What you can do:
- Filter quizzes by search/course/chapter/difficulty/tag.
- Create new quiz: `/admin/collections/quizzes/create`.
- Duplicate an existing quiz.
- Assign quiz to one or more lessons (`Assign to lessons`).
- Open each quiz in full editor (`Edit quiz`).

Quiz editor highlights (`/admin/collections/quizzes/<id>`):
- Add questions with the question picker field.
- Create new questions from the picker dialog.
- Import question CSV from picker dialog or Quiz Bank modal.
- Quiz supports drafts/publishing.

CSV import requirements for quiz questions:
- Required columns: `title`, and `prompt` (or `question`).
- Must include at least `option_1`, `option_2`, `option_3`.
- Correct answers:
  - either `option_n_correct` columns,
  - or `correct_options` (comma-separated option indices, like `1,3`).
- Optional columns: `explanation`, `topic`, `tags`, `difficulty`.

Example CSV row:
```csv
title,prompt,option_1,option_1_correct,option_2,option_3,correct_options,difficulty,tags
Forces intro,What is a force?,Push/pull,true,Velocity,Mass,1,intro,statics;basics
```

### 3. Question Bank, Concepts, Pre/Post

- **Question Bank** (`/admin/question-bank`) — cross-quiz pool of questions with per-question usage and performance counters. Backed by the `quiz-questions` collection and the `/staff/question-bank` endpoint.
- **Concept Library** (`/admin/concepts`) — manage learning outcomes (`concepts` collection). Open a concept to see linked questions, problems, and lessons.
- **Pre/Post Assessments** (`/admin/pre-post`) — pair a pre-quiz with a post-quiz to drive normalized-gain analysis (`pre-post-assessments` collection). Open `/admin/pre-post/[id]` for per-pairing results.

### 4. Student support operations

Collections to use:
- Questions: `/admin/collections/questions`
- Feedback: `/admin/collections/feedback`
- Lesson Feedback: `/admin/collections/lesson-feedback`
- Lesson Progress: `/admin/collections/lesson-progress`
- Quiz Attempts: `/admin/collections/quiz-attempts`
- Problem Attempts: `/admin/collections/problem-attempts`
- Notifications: `/admin/collections/notifications`
- Lesson Bookmarks: `/admin/collections/lesson-bookmarks`

Recommended workflow:
- Open unanswered questions:
  - `/admin/collections/questions?where[status][equals]=open`
- Add staff response in `Answers` array.
- Set/confirm status:
  - `open` — waiting for staff.
  - `answered` — staff responded.
  - `resolved` — issue closed.
- Mark platform feedback as read in `Feedback` (`read` checkbox).
- Reply to lesson feedback either:
  - in `Lesson Feedback` collection, or
  - directly inside a lesson edit page via the `Lesson Feedback` panel.

Behavior to know:
- When a question gets a new answer and status is `answered`, a notification is created in the student's inbox automatically (respects the recipient's notification preferences).

### 5. Classrooms and enrollments

Collections:
- Classrooms: `/admin/collections/classrooms`
- Classroom memberships: `/admin/collections/classroom-memberships`

Typical process:
- Create classroom, set class + professor.
- Join code is auto-generated and stored in sidebar (`ClassroomJoinCodeField`).
- Use `Regenerate join code` (sidebar UI) when needed.
- Adjust:
  - join code length
  - join code duration hours
- Use memberships list to view:
  - joined date
  - completed lessons
  - completion rate
  - last activity
- Per-classroom certificate PDFs are served from `/api/classrooms/:classroomId/certificate`.

### 6. Site management

Primary route:
- `/admin/site-management`

What you can do:
- Navigation pages:
  - Create page: `/admin/collections/pages/create`.
  - Reorder pages with drag-and-drop list (save confirm modal).
- Footer content:
  - `/admin/globals/footer` — edit links, contact info, feedback section, bottom lines.
- Site branding (`/admin/globals/site-branding`) — name, logo, favicon, theme tokens shared with the web app.
- Admin help content (`/admin/globals/admin-help`) — admin-only to update.

### 7. NSF reporting (RPPR workflow)

Primary route:
- `/admin/reporting`

What you can do:
- Select a reporting period from `Reporting Periods`.
- Apply cohort filters (class, professor, classroom, first-gen, transfer).
- Review RPPR section completeness and missing fields.
- Review KPI trend deltas versus the most recent comparable snapshot.
- Review metric definitions and drilldown API links.
- Review data quality warnings and anomaly checks before export.
- Generate deterministic draft narratives (staff edit required before export).
- Create immutable reporting snapshots (with automatic reuse when unchanged).
- Review evidence-link coverage by RPPR section.
- Save the current scope/filter combination for reuse.
- Review recent reporting audit events.
- Capture NSF products in `Reporting Product Records` (`/admin/collections/reporting-product-records`).
- Export period-specific outputs:
  - RPPR JSON
  - Overview CSV
  - Participants CSV
  - Organizations CSV
  - Products CSV
  - Evidence CSV
  - Data quality CSV
  - Metric drilldown CSV (authorized roles only)
- Generate RPPR PDF via `/api/analytics/generate-rppr-pdf`.
- Save and reuse scope/filter sets via `Reporting Saved Views`.
- Edit manual narrative sections in `RPPR Reports`.
- Manage partner records in `Organizations`.

## Draft/publish reference

Draft-enabled content in this project:
- `pages`
- `lessons`
- `quizzes`
- `quiz-questions`
- `problems`
- `rppr-reports`
- globals: `footer`, `admin-help`

No draft workflow (immediate save) for:
- `classes`, `chapters`
- `classrooms`, `classroom-memberships`
- learner records (`accounts`, `lesson-progress`, `lesson-bookmarks`, `quiz-attempts`, `problem-attempts`)
- support records (`questions`, `feedback`, `lesson-feedback`, `notifications`)
- reporting append-only records (`reporting-snapshots`, `reporting-audit-events`)

## Troubleshooting

Fields are not editable:
- Click `Edit` in the top-right of the document/global page.
- If still locked, check role permissions.
- For `Admin Help`, only admin can update currently.

Reorder did not persist:
- Confirm you clicked `Save order` in the confirmation modal after dragging.

Lesson editor shows `Save failed`:
- The auto-save call returned an error. Try `Save draft` manually; if it still fails, check the browser console / server logs for the lesson `PATCH` response.

Cannot find a page/action:
- Start from dashboard (`/admin`) and use the cards:
  - `Manage Courses`
  - `Open Quiz Bank`
  - `Question Bank`
  - `Student Performance`
  - `Site Management`
  - `Reporting Center`

Need to change user roles or create staff logins:
- Requires admin access in `/admin/collections/users`. Use `/admin/users/create` for the guided create flow.

## Staff operating checklist

At the start of each day:
- Review open questions.
- Review unread platform feedback.
- Check lesson feedback and reply to actionable comments.
- Confirm any planned content changes are published.
- Validate quiz assignments for upcoming lessons.
- For active reporting periods, check the Reporting Center for new data quality warnings.
