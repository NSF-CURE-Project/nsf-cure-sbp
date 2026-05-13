# Handoff Notes

This document is the single entry point for someone taking the project
over. It is intentionally short — it points at the rest of the `docs/`
tree rather than duplicating it.

## What this is

The **NSF CURE Summer Bridge Program (SBP)** is an online learning
platform funded by NSF Award #2318158. Two services:

- **`web/`** — Next.js student-facing site (port 3001).
- **`payload-cms/`** — Payload CMS staff admin + API (port 3000).

Postgres is the canonical database. Media uploads go to local disk in
dev and S3-compatible storage in production.

## Day-one checklist (fresh clone)

1. **Install** — `pnpm install` in both `web/` and `payload-cms/`.
2. **Configure env** — copy `payload-cms/.env.example` and
   `web/.env.example` to `.env` in each directory and fill in real
   values. The CMS will not boot without `DATABASE_URI` and
   `PAYLOAD_SECRET`.
3. **Start Postgres** — either `docker compose up postgres` inside
   `payload-cms/`, or point `DATABASE_URI` at an existing Postgres.
4. **Run migrations** — `pnpm payload migrate` in `payload-cms/`.
5. **Seed dev data** — `pnpm seed` in `payload-cms/`. Creates an admin
   user (`admin@sbp.local` / `changeme123!`), a course, a chapter, a
   lesson, and the standard Pages. Override credentials with
   `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
6. **Run both services** — `pnpm dev` in each directory. Admin at
   <http://admin.sbp.local:3000/admin>, learner site at
   <http://localhost:3001>. Add `127.0.0.1 admin.sbp.local` to
   `/etc/hosts` if needed.

## Where things live

| Topic | Doc |
| --- | --- |
| System architecture, request flow, plugins | [docs/architecture/architecture.md](docs/architecture/architecture.md) |
| Stack choices and why | [docs/developers/stack.md](docs/developers/stack.md) |
| Developer overview / repo layout | [docs/developers/overview.md](docs/developers/overview.md) |
| Collections, slugs, access control | [docs/developers/data-models.md](docs/developers/data-models.md) |
| Analytics and reporting endpoints | [docs/developers/analytics.md](docs/developers/analytics.md) |
| SEO + canonicals on the learner site | [docs/developers/seo-implementation.md](docs/developers/seo-implementation.md) |
| Staff workflow: managing courses | [docs/staff/course-management.md](docs/staff/course-management.md) |
| Staff workflow: admin dashboard | [docs/staff/admin-dashboard.md](docs/staff/admin-dashboard.md) |
| Staff workflow: supporting learners | [docs/staff/student-support.md](docs/staff/student-support.md) |
| Roles and access model | [docs/staff/roles.md](docs/staff/roles.md) |
| Payload admin handbook | [docs/staff/payload-admin-handbook.md](docs/staff/payload-admin-handbook.md) |
| Safety / data privacy | [docs/staff/safety.md](docs/staff/safety.md) |
| Deployment | [docs/operations/deployment.md](docs/operations/deployment.md) |
| Architectural decisions log | [docs/operations/decisions.md](docs/operations/decisions.md) |
| NSF RPPR compliance checklist | [docs/operations/rppr-compliance-checklist.md](docs/operations/rppr-compliance-checklist.md) |

## Common operational tasks

- **Create another admin user** —
  `pnpm payload run scripts/promote-admin.ts --email user@example.com`
  after the user signs up, or invite them through `/admin/users/create`.
- **Regenerate Payload types after a collection change** —
  `pnpm generate:types` in `payload-cms/`.
- **Regenerate Payload import map after adding a custom view** —
  `pnpm generate:importmap` in `payload-cms/`.
- **Republish every lesson (e.g. after a schema bump)** —
  `pnpm publish:all`.
- **Run tests** — `pnpm test` in each service (Vitest + Playwright in
  `payload-cms/`; Next.js test scripts in `web/`).

## Backup and restore (Postgres)

Not currently automated. For production, take regular `pg_dump`s and
store them off-site. To restore: drop the database, `createdb`, then
`psql -f dump.sql`. Re-run `pnpm payload migrate` before booting the
CMS against the restored database.

## Things to know about the codebase

- **Auto-generated files** — `payload-cms/src/app/(payload)/layout.tsx`
  and `payload-cms/src/app/(payload)/admin/[[...segments]]/page.tsx` are
  re-emitted by Payload codegen. The page wraps `generateMetadata` to
  force a constant "Admin" tab title via `src/lib/adminMetadata.ts`;
  re-apply the swap if you ever run `payload generate:importmap` and
  the file is rewritten.
- **Branches** — `prod` is the live branch; `main` is the GitHub default.
  Confirm with the maintainer which one is intended as the trunk before
  forking the project. Stale branches `dev` and
  `phase-1-courses-workspace` exist on `origin` and may be deleted.
- **CI** — `.github/workflows/` contains three workflows
  (`payload-cms-tests.yml`, `payload-cms-migrate.yml`, `web-ci.yml`).
  Migrations run on push to `main`; tests run on PRs.

## Where to ask

- NSF Award contact / PI: maintained by Cal Poly Pomona faculty.
- Codebase questions: search [docs/](docs/) first, then `git log` /
  `git blame` for the file in question — commit messages are kept
  descriptive.
