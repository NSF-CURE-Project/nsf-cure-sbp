## Data Models — NSF CURE SBP

The canonical data models live in `payload-cms/src/collections/`. Each Payload `CollectionConfig` defines the schema, access rules, and admin UI behavior. Registration order is in `payload-cms/src/payload.config.ts`.

There are **34 collections** plus **3 globals** (`AdminHelp`, `Footer`, `SiteBranding`).

## Identity and access

| Collection | Slug | Purpose |
| --- | --- | --- |
| `Users` | `users` | Staff identities (roles: `admin` \| `professor` \| `staff`). Drives admin auth. |
| `Accounts` | `accounts` | Learner identities (role: `student`). Separate auth collection from staff. Carries NSF demographic fields, heartbeat/activity counters, notification preferences. |
| `ApiKeys` | `api-keys` | Programmatic-access tokens scoped to a staff owner with optional expiry. |

`Users` is the admin/staff auth collection (`admin.user: 'users'`). `Accounts` is a parallel auth collection for learners on the public web app. Both are checked by collection access functions via `req.user?.collection`.

## Course content

| Collection | Slug | Purpose |
| --- | --- | --- |
| `Classes` | `classes` | Top-level course records. |
| `Chapters` | `chapters` | Sections within a class. Carries lesson order via custom field. |
| `Lessons` | `lessons` | Lesson body content (layout blocks), assessment attachment, lesson-level overrides. Drafts enabled. |
| `Pages` | `pages` | CMS pages for the public site. Drafts enabled. |
| `Media` | `media` | Uploaded assets. S3-backed when `S3_BUCKET` is set. |
| `EngineeringFigures` | `engineering-figures` | Structured figures (free-body diagrams, plots) authored via `FigureBuilderField` / `PlotWizardField`. |

## Assessments and problem-solving

| Collection | Slug | Purpose |
| --- | --- | --- |
| `Quizzes` | `quizzes` | Quiz definitions, question lists, attempt limits, time limits. Drafts enabled. |
| `QuizQuestions` | `quiz-questions` | Reusable question bank (multiple-choice, etc.). Drafts enabled. |
| `QuizAttempts` | `quiz-attempts` | Learner attempt records (score, mastery, timestamps). |
| `Problems` | `problems` | Individual problem definitions with templated parameters. Drafts enabled. |
| `ProblemSets` | `problem-sets` | Curated collections of problems served via `/public/problem-sets`. |
| `ProblemAttempts` | `problem-attempts` | Learner attempt records on problems. |
| `Concepts` | `concepts` | Learning outcomes / standards mapped onto questions and problems. |
| `PrePostAssessments` | `pre-post-assessments` | Pairs a pre-quiz with a post-quiz for normalized-gain (research) analysis. |

## Learner experience

| Collection | Slug | Purpose |
| --- | --- | --- |
| `LessonProgress` | `lesson-progress` | Per-learner lesson completion timestamps. |
| `LessonBookmarks` | `lesson-bookmarks` | Learner-saved lessons. |
| `Notifications` | `notifications` | Per-account inbox items (e.g. answer posted to your question). |
| `Questions` | `questions` | Learner Q&A threads on lessons. Staff respond via the `answers` array. |
| `Feedback` | `feedback` | Platform-level feedback submissions. |
| `LessonFeedback` | `lesson-feedback` | Per-lesson feedback with staff replies, surfaced inside the lesson editor. |

## Classrooms

| Collection | Slug | Purpose |
| --- | --- | --- |
| `Classrooms` | `classrooms` | Roster container tied to a class + professor. Auto-generates a join code (see `ClassroomJoinCodeField`). |
| `ClassroomMemberships` | `classroom-memberships` | Learner-classroom enrollment records with progress rollups. |

## NSF reporting (RPPR)

| Collection | Slug | Purpose |
| --- | --- | --- |
| `Organizations` | `organizations` | Normalized partner-organization records used in RPPR exports. |
| `ReportingPeriods` | `reporting-periods` | Budget-window definitions (`startDate`, `endDate`, `reportType`). |
| `RpprReports` | `rppr-reports` | Staff-entered narrative sections tied to a reporting period. Drafts enabled. |
| `ReportingSnapshots` | `reporting-snapshots` | Immutable serialized reporting outputs. Stores `snapshotHash`, `reproducibilityKey`, `versionLabel`. |
| `ReportingAuditEvents` | `reporting-audit-events` | Append-only provenance trail (generation, drilldowns, exports, snapshots). |
| `ReportingSavedViews` | `reporting-saved-views` | Reusable period/filter presets for the reporting center. |
| `ReportingEvidenceLinks` | `reporting-evidence-links` | Links RPPR sections to interventions and content artifacts. |
| `ReportingProductRecords` | `reporting-product-records` | First-class NSF product capture (publications, presentations, etc.). |

## Staff scratch space

| Collection | Slug | Purpose |
| --- | --- | --- |
| `SavedViews` | `saved-views` | Per-staff or shared filter/scope presets used outside RPPR (see `SavedViewsBar`). |

## Globals

- `Footer` (`/admin/globals/footer`) — footer navigation, contact info, feedback section, legal lines.
- `AdminHelp` (`/admin/globals/admin-help`) — admin-only help content shown from `/admin/help` and `/admin/help/[topic]`.
- `SiteBranding` — site name, logo, favicon, and theme tokens shared with the web app.

## Relationships

Collections reference each other through Payload `relationship` fields. Common chains:

- `Lessons → Chapters → Classes`
- `QuizAttempts → Quiz / Account / Lesson`
- `ClassroomMemberships → Classroom → Class`
- `Notifications → Account` (recipient)
- `ReportingSnapshots → ReportingPeriod`
- `ReportingEvidenceLinks → RpprReport (+ artifact references)`

Inspect each collection's `fields` to see the exact relations.

## Access control patterns

Most collections share two helpers, defined inline per file:

- `isStaff(req)` → `req.user?.collection === 'users'` and role in `admin|staff|professor`.
- `isAdmin(req)` → `req.user?.role === 'admin'`.

Learner-owned collections (`Notifications`, `LessonProgress`, `LessonBookmarks`, `Questions`, `QuizAttempts`, `ProblemAttempts`) scope read access to records where `recipient`/`account` equals `req.user.id` when the caller is an account.

Audit and snapshot records are immutable after create — enforced in `access.update` / `access.delete` returning `false`.

## Drafts and publishing

Draft workflow enabled (`versions.drafts: true`):

- `Pages`
- `Lessons`
- `Quizzes`
- `QuizQuestions`
- `Problems`
- `RpprReports`
- globals: `AdminHelp`, `Footer`

Everything else saves immediately (no draft state).

## Adding or changing models

1. Add or modify `payload-cms/src/collections/MyCollection.ts` and export a `CollectionConfig`.
2. Register it in the `collections` array in `payload-cms/src/payload.config.ts`.
3. Create a migration in `payload-cms/src/migrations/` (Payload will print a suggested SQL diff in dev).
4. Run migrations against your Postgres DB: `pnpm payload migrate` (from `payload-cms/`).
5. Regenerate types: `cd payload-cms && pnpm generate:types`.
6. If you added a custom admin field/view component, run `pnpm generate:importmap` so the admin can resolve it.

## Where to read example fields

- Staff auth and roles: `payload-cms/src/collections/Users.ts`.
- Learner auth, demographics, heartbeat: `payload-cms/src/collections/Accounts.ts`.
- Content with layout blocks: `payload-cms/src/collections/Lessons.ts`, `payload-cms/src/collections/Pages.ts`.
- Custom field UI (relationship pickers, builders): `payload-cms/src/views/*.tsx`.
