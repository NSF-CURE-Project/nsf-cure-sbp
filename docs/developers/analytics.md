## Analytics and Reporting — NSF CURE SBP

This project now separates two concerns:

- Operational analytics: day-to-day monitoring for staff dashboards.
- NSF reporting: period-specific RPPR-aligned summaries and exports.

## Current architecture

Primary modules
- Operational summary service: `payload-cms/src/utils/analyticsSummary.ts`
- Reporting period utilities: `payload-cms/src/reporting/period.ts`
- Reporting data helpers: `payload-cms/src/reporting/data.ts`
- RPPR summary service: `payload-cms/src/reporting/nsfRpprSummary.ts`
- Reporting Center aggregator: `payload-cms/src/reporting/reportingCenter.ts`
- Metric definitions registry: `payload-cms/src/reporting/metricDefinitions.ts`
- Cohort scope resolution: `payload-cms/src/reporting/cohorts.ts`
- Data quality/anomaly/narrative modules:
  - `payload-cms/src/reporting/dataQuality.ts`
  - `payload-cms/src/reporting/anomalies.ts`
  - `payload-cms/src/reporting/narrativeBuilder.ts`
- Snapshot/audit services:
  - `payload-cms/src/reporting/snapshots.ts`
  - `payload-cms/src/reporting/snapshotHash.ts`
  - `payload-cms/src/reporting/audit.ts`
  - `payload-cms/src/reporting/trends.ts`

Collections used by reporting
- `lesson-progress`
- `quiz-attempts`
- `problem-attempts`
- `accounts`
- `classroom-memberships`
- `organizations`
- `reporting-periods`
- `rppr-reports`
- `reporting-snapshots`
- `reporting-audit-events`
- `reporting-saved-views`
- `reporting-evidence-links`
- `reporting-product-records` — first-class NSF product capture (publications/presentations) alongside content-artifact products.
- content artifacts: `lessons`, `quizzes`, `pages`, `quiz-questions`, `problems`, `concepts`

Endpoints

Reporting (period-aware, RPPR-aligned):
- `GET /api/analytics/reporting-summary` — operational summary used by dashboards.
- `GET /api/analytics/nsf-rppr` — RPPR summary and exports.
- `GET /api/analytics/reporting-center` — Reporting Center payload, drilldowns, snapshot trigger.
  - actions: `summary`, `drilldown`, `create-snapshot`, `save-view`
  - CSV types: `summary`, `participants`, `organizations`, `products`, `evidence`, `data-quality`
- `GET /api/analytics/metric-definitions` — metric definition registry consumed by both UI and exports.
- `POST /api/analytics/generate-rppr-pdf` — staff-only PDF render of the current period.
- `GET /api/analytics/gpt-rppr-context` — read-only narrative context for AI-assisted drafts (admin/staff).

Operational staff analytics (powering the custom admin views):
- `GET /api/analytics/student` — per-learner activity drilldown (`studentAnalytics`).
- `GET /api/staff/student-performance` — roster-level performance used by `/admin/student-performance`.
- `GET /api/staff/user-analytics/list` and `GET /api/staff/user-analytics` — instructor performance roster and detail (`/admin/user-analytics`).
- `GET /api/staff/quiz-stats` — per-quiz attempts and mastery (`/admin/quiz-stats/[quizId]`).
- `GET /api/staff/question-stats` — per-question performance (`/admin/question-stats/[questionId]`).
- `GET /api/staff/question-bank` — cross-quiz question pool with usage counters (`/admin/question-bank`).
- `GET /api/staff/concept-list` and `GET /api/staff/concept-detail` — concept library data (`/admin/concepts`).
- `GET /api/staff/pre-post/list` and `GET /api/staff/pre-post/detail` — pre/post pairings and normalized-gain (`/admin/pre-post`).

These staff endpoints all gate on `isStaff(req)` (admin/staff/professor). Professor scope is narrowed to their own classrooms inside each handler.

Admin entry points
- Dashboard (operational, custom view): `/admin` (rendered by `StaffDashboardView`).
- RPPR reporting workspace: `/admin/reporting`.
- Staff analytics pages: `/admin/student-performance`, `/admin/user-analytics`, `/admin/quiz-bank`, `/admin/question-bank`, `/admin/concepts`, `/admin/pre-post`.

## Reporting period semantics

RPPR summaries are period-specific.

A reporting period includes:
- `startDate`
- `endDate`
- optional `label`
- optional `budgetPeriodName`
- optional `reportType` (`annual`, `final`, `internal`, `custom`)

In RPPR mode, period is required. Internal mode can still run all-time views for operations.

## Metric definitions

Completion metrics are unique-learner based.

Class/chapter completion
- denominator: `uniqueLearnersStarted`
- numerator: `uniqueLearnersCompleted`
- rate: `uniqueLearnersCompleted / uniqueLearnersStarted`

Quiz mastery
- denominator: `uniqueLearnersAttempted`
- numerator: `uniqueLearnersMastered`
- rate: `uniqueLearnersMastered / uniqueLearnersAttempted`
- mastery threshold: score >= 80%

Participation
- `uniqueLearnersActive`: unique learners with progress or quiz attempts in scope.

Products in period
- artifacts created in period from lessons/quizzes/pages/quiz-questions.

## Data quality and limits

- Reporting services use paginated full-collection reads (no hidden 2000/5000 truncation).
- Dashboard UI can remain operationally focused; official exports should use reporting endpoints.
- Empty periods produce explicit warnings; missing manual narrative fields are surfaced in completeness checks.
- Data Quality panel also flags missing organization metadata and missing evidence links in RPPR mode.

## Snapshot reproducibility

- Snapshot hash excludes volatile timestamps (`generatedAt`, `createdAt`, `updatedAt`) so semantically identical reports hash consistently.
- Snapshot creation supports reuse mode (`reuseIfUnchanged=true`) to return the most recent immutable snapshot with the same reproducibility hash.
- Each snapshot stores a `reproducibilityKey` and immutable `snapshotHash`.

## Manual RPPR inputs

Not all RPPR sections are auto-derivable.

Manual narratives are stored in `rppr-reports`:
- accomplishments narrative
- products narrative
- impact narrative
- changes/problems narrative
- special requirements narrative
- report notes and attachments

## Permissions

- Aggregate reporting endpoints require staff/admin/professor auth.
- Learner-level drilldowns are restricted to admin/staff (`reporting/permissions.ts`).
- Audit and snapshot records are immutable after creation.

## Known limitations

- Participant demographic detail is not fully standardized for all NSF program variants.
- DOCX packaging is not implemented; PDF (`/api/analytics/generate-rppr-pdf`) and JSON/CSV exports cover submission needs.
- Saved views and snapshot comparisons are currently lightweight and query-string driven; dedicated workflow UI can be expanded later.

## Snapshot automation scaffold

- Manual/automation entry script: `payload-cms/scripts/create-reporting-snapshot.ts`
- Package script: `cd payload-cms && pnpm snapshot:reporting`
- Supports:
  - `REPORTING_PERIOD_ID=<id>` for a single period
  - or `REPORTING_START_DATE` + `REPORTING_END_DATE`
  - else falls back to all `status=active` reporting periods
