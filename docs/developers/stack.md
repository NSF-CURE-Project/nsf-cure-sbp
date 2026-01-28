# Tech Stack — NSF CURE SBP

Short summary
- Frontend: Next.js (app + admin) using React and TypeScript.
- CMS / Admin: Payload CMS (Payload 3) integrated into `payload-cms/` (Next.js + Payload admin + custom endpoints).
- Public site: Next.js app in `web/` that consumes the Payload API.
- Database: PostgreSQL via `@payloadcms/db-postgres` (configured in `payload-cms/src/payload.config.ts`).
- Styling: Tailwind CSS in the `web` app.

Key versions (from repository)
- Next.js ~15, React 19, TypeScript 5.x — see `payload-cms/package.json` and `web/package.json` for exact versions.
- Payload: 3.65.x (see `payload-cms/package.json`).

Local development (quick commands)
- Install dependencies (per app):
```bash
cd payload-cms && pnpm install
cd ../web && pnpm install
```
- Start the admin/CMS (dev):
```bash
cd payload-cms && pnpm dev
# admin available at http://admin.sbp.local:3000
```
- Start the public web app (dev):
```bash
cd web && pnpm dev
# site available at http://app.sbp.local:3001
```
- Add required local host entries (one-time):
```bash
./scripts/dev-setup.sh   # requires sudo
```

Environment variables (important)
- `payload-cms/.env` (important keys):
	- `DATABASE_URI`: Postgres connection string
	- `PAYLOAD_SECRET`: Payload secret
	- `PAYLOAD_PUBLIC_SERVER_URL`: public URL for the CMS server (used in email links / previews)
	- `FRONTEND_URL`: `http://app.sbp.local:3001` by default
	- `SMTP_*`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (for Nodemailer adapter)
- `web/.env.local`: `NEXT_PUBLIC_PAYLOAD_URL` (the API URL the web app queries)

Database & migrations
- Postgres is canonical. Migrations live in `payload-cms/src/migrations/` (JSON/TS files). Use timestamped filenames like `YYYYMMDD_HHMMSS_description.ts`.
- After applying migrations, regenerate types used by the repo:
```bash
cd payload-cms && pnpm generate:types
```

Dev helpers (import map & types)
- When adding or moving admin views/components, run:
```bash
cd payload-cms && pnpm generate:importmap
```
- After schema changes or migrations, run:
```bash
cd payload-cms && pnpm generate:types
```

Testing
- Unit / integration tests: `pnpm run test:int` (uses `vitest`).
- E2E tests: `pnpm run test:e2e` (uses Playwright). If Playwright browsers are missing, run `pnpm exec playwright install`.
- CI uses the root `test` script (see `package.json`) which runs both `test:int` and `test:e2e`.

Quick Docker Postgres for local dev
- Create `docker-compose.pg.yml` with a Postgres 15 service and set `payload-cms/.env:DATABASE_URI` to `postgres://payload:payload@localhost:5432/payload_db`.

Common troubleshooting
- DB connection errors: check `DATABASE_URI` and that Postgres is running (docker or local). Use the Docker snippet for a fast local DB.
- Email issues: check `SMTP_*` env vars. For development consider `smtp4dev`.
- Host / cookie issues: run `./scripts/dev-setup.sh` and clear cookies for `admin.sbp.local` and `app.sbp.local`.
- Native module problems (e.g., `sharp`) on macOS: ensure Node matches `engines` in `package.json` and re-run `pnpm install` (pnpm overrides exist to help Apple Silicon).

Where to read next
- `docs/architecture/architecture.md` — higher-level architecture and rationale.
- `docs/developers/data-models.md` — data model and collection overview.
- `payload-cms/src/payload.config.ts` — central registration of collections, endpoints, email adapter, and admin import map.
