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
- `accounts`
- `organizations`
- `reporting-periods`
- `rppr-reports`
- `reporting-snapshots`
- `reporting-audit-events`
- `reporting-saved-views`
- `reporting-evidence-links`
- content artifacts: `lessons`, `quizzes`, `pages`, `quiz-questions`

Endpoints
- Internal/operational summary: `GET /api/analytics/reporting-summary`
- RPPR summary and exports: `GET /api/analytics/nsf-rppr`
- Reporting Center payload, drilldowns, and snapshot trigger: `GET /api/analytics/reporting-center`
  - actions: `summary`, `drilldown`, `create-snapshot`, `save-view`
  - CSV types: `summary`, `participants`, `organizations`, `products`, `evidence`, `data-quality`
- Metric definition registry: `GET /api/analytics/metric-definitions`

Admin entry points
- Dashboard (operational): `/admin`
- RPPR reporting workspace: `/admin/reporting`

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

- Publications/patents are not yet modeled as first-class product records; content artifacts are used as a proxy.
- Participant demographic detail is not fully standardized for all NSF program variants.
- Final submission packaging (PDF/DOCX) is not implemented yet; JSON/CSV exports are available.
- Saved views and snapshot comparisons are currently lightweight and query-string driven; dedicated workflow UI can be expanded later.

## Snapshot automation scaffold

- Manual/automation entry script: `payload-cms/scripts/create-reporting-snapshot.ts`
- Package script: `cd payload-cms && pnpm snapshot:reporting`
- Supports:
  - `REPORTING_PERIOD_ID=<id>` for a single period
  - or `REPORTING_START_DATE` + `REPORTING_END_DATE`
  - else falls back to all `status=active` reporting periods
