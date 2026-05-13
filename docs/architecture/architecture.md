## Architecture Overview — NSF CURE SBP

## Summary

Two primary applications live in this repo: the CMS/admin app (`payload-cms/`) and the public web app (`web/`). The CMS hosts the Payload admin UI and exposes the API consumed by `web`. PostgreSQL is the canonical datastore. Object storage (S3) is optional but used in production for `Media`.

## Primary components

### `payload-cms/` (Payload 3 + Next.js 15)

- **Responsibilities**: admin UI, content authoring, API endpoints, dual-collection authentication, email sending, DB migrations, NSF reporting.
- **Key paths**:
  - `src/payload.config.ts` — central registration of collections (34), globals (3), endpoints, custom admin views, email adapter, DB adapter, S3 storage plugin.
  - `src/collections/` — Payload collection configs (data models + access rules).
  - `src/endpoints/` — custom REST handlers mounted at `/api/...` (see "Custom endpoints" below).
  - `src/views/` — React components for custom admin views, fields, and dashboards.
  - `src/app/(payload)/admin/` — Next.js pages that wrap custom admin routes (`/admin/courses`, `/admin/reporting`, `/admin/student-performance`, etc.).
  - `src/reporting/` — period-aware aggregation, snapshot hashing, narrative/anomaly modules.
  - `src/migrations/` — Drizzle/SQL migrations applied via Payload's migrate command.
  - `src/blocks/pageBlocks.ts` — shared block definitions used by lessons and pages.

### `web/` (Next.js 15 public app)

- **Responsibilities**: public site, student-facing UI, consuming the Payload API.
- **Key paths**:
  - `src/app/(public)/` — public routes (home, learning hub, classes/chapters/lessons, directory, search, classrooms, data-transparency, etc.).
  - `src/app/(auth)/` — learner auth routes.
  - `src/app/(instructor)/`, `src/app/(personal)/` — gated experiences for instructors and signed-in learners.
  - `src/app/api/` — server-side routes including the Payload API proxy (`PAYLOAD_PROXY_TARGET`).
  - `src/lib/payloadSdk/` — typed client for the CMS API.
  - `next.config.ts`, `package.json` scripts.

### Database — PostgreSQL

- Accessed by `payload-cms` via `@payloadcms/db-postgres`. Connection via `payload-cms/.env:DATABASE_URI`.
- `push: false` is set on the postgres adapter to prevent accidental schema drift; schema changes go through migrations.

### Object storage — S3 (optional)

- When `S3_BUCKET` is set, `@payloadcms/storage-s3` is registered as a plugin and the `media` collection is offloaded to the bucket. Credentials via `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, optional `S3_ENDPOINT`.

## Authentication model

Two parallel auth collections:

- `users` (`admin.user: 'users'`) — staff identities. Roles: `admin`, `professor`, `staff`. Used for the admin UI.
- `accounts` — learner identities (role: `student`). Used by the public web app. Carries NSF demographics, heartbeat counters, and notification preferences.

Collection `access` functions branch on `req.user?.collection` (`'users'` vs `'accounts'`) to decide visibility. Custom endpoints reuse `isStaff(req)` and `isAdmin(req)` helpers from collection files.

`ApiKeys` (`api-keys` collection) provide programmatic access scoped to a staff owner.

## Service boundaries and data flow

1. Staff/admins author content in the admin UI (`admin.sbp.local:3000`).
2. Learners visit the public web app (`app.sbp.local:3001`).
3. The web app reads from the CMS API (`NEXT_PUBLIC_PAYLOAD_URL`) and proxies through `/api/*` (`PAYLOAD_PROXY_TARGET`).
4. Custom REST handlers under `/api/staff/*`, `/api/analytics/*`, `/api/accounts/*`, `/api/classrooms/*`, `/api/public/*` are mounted directly in `payload.config.ts` and reuse Payload's `req` (auth, db, locale).
5. Live preview frames for `lessons` and `pages` are wired in `admin.livePreview`; the lesson scaffold editor's publish-review modal renders an iframe at `WEB_PREVIEW_URL` signed with `PREVIEW_SECRET`.

## Custom admin views

Registered in `payload.config.ts` via `admin.components.views.dashboard` and Next.js pages under `src/app/(payload)/admin/`:

- `StaffDashboardView` — replaces the default dashboard (`/admin`).
- `StaffProvider` — global admin provider (theme, user menu, breadcrumbs).
- Custom workspaces: `/admin/courses`, `/admin/quiz-bank`, `/admin/question-bank`, `/admin/concepts`, `/admin/pre-post`, `/admin/student-performance`, `/admin/user-analytics`, `/admin/site-management`, `/admin/reporting`, `/admin/help`, `/admin/settings`, and per-record drilldowns (`/admin/quiz-stats/[quizId]`, `/admin/question-stats/[questionId]`).

Custom field UIs (e.g., `FigureBuilderField`, `PlotWizardField`, `ClassroomJoinCodeField`, `LessonFeedbackPanel`, the lesson scaffold editor under `views/courses/`) are resolved through Payload's import map (`pnpm generate:importmap`).

## Custom endpoints (overview)

Roughly 35 custom handlers are registered. Groups:

- **Health**: `/health`.
- **Learner auth/profile**: `/accounts/me`, `/accounts/heartbeat`, `/accounts/me/demographics`, `/accounts/me/notification-preferences`, `/accounts/me/data-summary`, `/accounts/logout-all`.
- **Classrooms**: `/classrooms/join`, `/classrooms/regenerate-code`, `/classrooms/:classroomId/leave`, `/classrooms/:classroomId/certificate`.
- **Preview**: `/preview-url` (GET/POST).
- **API keys**: `/auth/api-key-info`.
- **Admin user create**: `/admin/users/create`.
- **Email previews / demo**: `/accounts/email-preview`, `/demo/quiz-formats`.
- **Public content**: `/public/problem-sets`, `/public/problem-sets/[id]`.
- **Attempts review**: `/quiz-attempts/:attemptId/review`, `/problem-attempts/:attemptId/review`.
- **Q&A**: `/questions/...` (lesson questions, question detail).
- **Reporting / analytics**: `/analytics/reporting-summary`, `/analytics/nsf-rppr`, `/analytics/reporting-center`, `/analytics/metric-definitions`, `/analytics/student`, `/analytics/gpt-rppr-context`, `/analytics/generate-rppr-pdf`.
- **Staff analytics**: `/staff/student-performance`, `/staff/user-analytics`, `/staff/user-analytics/list`, `/staff/quiz-stats`, `/staff/question-stats`, `/staff/concept-list`, `/staff/concept-detail`, `/staff/question-bank`, `/staff/pre-post/list`, `/staff/pre-post/detail`.
- **Instructor**: classroom list and roster handlers.

See `payload-cms/src/payload.config.ts` `endpoints: [ … ]` for the authoritative list and `docs/developers/analytics.md` for the reporting/staff endpoints in particular.

## Cross-cutting concerns

- **Email**: Payload uses a provider-switching adapter in `payload.config.ts` with priority: Resend Starter relay (`RESEND_STARTER_*`), then direct Resend (`RESEND_*`), then SMTP (`SMTP_*`). Use the same adapter when sending programmatic messages.
- **Images**: `sharp` is registered in the Payload config — watch native build issues on macOS.
- **Cookies**: `PAYLOAD_COOKIE_SECURE`, `PAYLOAD_COOKIE_SAMESITE`, `PAYLOAD_APP_COOKIE_DOMAIN` override defaults for cross-subdomain cookies in production.
- **Reporting reproducibility**: `ReportingSnapshots.snapshotHash` excludes volatile timestamps so semantically identical reports hash identically (see `docs/developers/analytics.md`).
- **Audit**: `ReportingAuditEvents` is append-only — `access.update` / `access.delete` return false.

## Why this structure

- Payload CMS centralizes data modelling, access control, and the admin UI with minimal hand-rolled code.
- Splitting admin and web apps lets the public site stay lean and cacheable while the admin handles complex authoring/reporting.
- Two auth collections keep staff and learner identities cleanly separated, simplifying access rules and audit.

## Operational notes

- Local hosts: `admin.sbp.local:3000` (admin) and `app.sbp.local:3001` (web). Use `./scripts/dev-setup.sh` to add `/etc/hosts` entries.
- Migrations: `payload-cms/src/migrations/`. Re-run `pnpm generate:types` and `pnpm generate:importmap` after schema or admin-component changes.
- Tests: unit/integration via `vitest`, E2E via Playwright. Scripts defined in root `package.json`.

## Where to read next

- `docs/developers/stack.md` — quick stack and commands.
- `docs/developers/data-models.md` — every collection and global.
- `docs/developers/analytics.md` — reporting modules and endpoint inventory.
- `docs/operations/deployment.md` — deployment workflow and gotchas.
- `payload-cms/src/payload.config.ts` — concrete wiring of collections, endpoints, and admin UI.
