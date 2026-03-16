# NSF RPPR Compliance Checklist (Implementation Baseline)

This checklist is mapped to the NSF RPPR policy page and PAPPG Chapter VII requirements.

## Implemented in Admin Reporting Center

- Reporting period definition (`reporting-periods`) with report type and date range.
- RPPR narrative record (`rppr-reports`) covering accomplishments, products, impact, changes/problems, and special requirements.
- Participant and partner organization metadata (Accounts + Organizations).
- Evidence traceability (`reporting-evidence-links`) scoped by reporting period.
- Product records (`reporting-product-records`) for publication/patent/dataset/software capture.
- Data quality checks and compliance checklist status in `/admin/reporting`.
- CSV exports for summary, participants, organizations, products, evidence, data quality, and compliance checks.

## Operational Requirements (Still External)

- Official RPPR submission still occurs in Research.gov.
- Project Outcomes Report (POR) publishing still occurs in Research.gov.
- Program-specific solicitation requirements must be reviewed per award and attached as needed.

## Runbook

1. Ensure Node runtime is `>=20.6`.
2. Apply DB migrations:
   - `cd payload-cms`
   - `pnpm payload migrate`
3. Open `/admin/reporting` and select a period.
4. Review `NSF RPPR compliance checklist` status and resolve `missing`/`partial` items.
5. Export `Compliance CSV` and archive with reporting artifacts.
