# AGENT: Quick Troubleshooting & Runbook

Purpose
- Short, actionable steps an AI agent or developer can follow when running into common problems while developing or testing locally.

Minimal `.env` template (copy to `payload-cms/.env`)
```
# Database
DATABASE_URI=postgres://payload:payload@localhost:5432/payload_db

# Payload
PAYLOAD_SECRET=supersecret
PAYLOAD_PUBLIC_SERVER_URL=http://admin.sbp.local:3000
FRONTEND_URL=http://app.sbp.local:3001

# SMTP (optional for emails)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM="NSF CURE SBP <info@example.com>"
```

Quick Postgres (Docker) for local dev
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: payload
      POSTGRES_DB: payload_db
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```
Set `DATABASE_URI=postgres://payload:payload@localhost:5432/payload_db` in `payload-cms/.env`.

Example migration filename pattern
- Use a timestamp prefix and short description, matching existing files:
  `20260105_120000_add_professor_role.ts`

Example admin view creation (step-by-step)
- Create `payload-cms/src/views/MyView.tsx` exporting a default React component.
- Run `cd payload-cms && pnpm generate:importmap` to produce import map entries.
- In `payload-cms/src/payload.config.ts`, register the component path: `{ path: '@/views/MyView#default' }`.

Playwright & tests
- Install browsers if Playwright tests fail: `pnpm exec playwright install`.
- Run unit/integration tests: `pnpm run test:int` (root).
- Run E2E: `pnpm run test:e2e` (root).

Common fixes
- DB connection: verify `payload-cms/.env:DATABASE_URI` and that Postgres is reachable. For quick local setup use the Docker snippet above.
- Email: verify SMTP env vars; use `smtp4dev` for local testing.
- Hosts/cookies: run `./scripts/dev-setup.sh` and clear cookies for `admin.sbp.local` and `app.sbp.local`.
- Sharp/native builds on macOS: ensure Node matches `engines` and re-run `pnpm install` (repo includes `pnpm.overrides`).

Useful quick commands
```bash
cd payload-cms && pnpm install
cd payload-cms && pnpm dev
cd web && pnpm install && pnpm dev
pnpm run test:int
pnpm run test:e2e
```

Commit checklist for schema/admin changes
- Add migration(s) under `payload-cms/src/migrations/`.
- Run `cd payload-cms && pnpm generate:types` and commit `payload-types.ts` if changed.
- If admin components/views changed, run `pnpm generate:importmap` and include the import map changes.

If you'd like, I can add more OS-specific notes (macOS Apple Silicon fixes, Docker approaches, or CI examples for GitHub Actions).
# AGENT: Quick Troubleshooting & Runbook

Purpose
- Short, actionable steps an AI agent or developer can follow when running into common problems while developing or testing locally.

DB / migrations
- Confirm Postgres is running and `payload-cms/.env:DATABASE_URI` is correct.
- To regenerate types after schema changes: `cd payload-cms && pnpm generate:types`.
- Migrations are located at `payload-cms/src/migrations/` (JSON and TS). Apply them to your database using your normal deployment/migration process.

SMTP / email
- Check `payload-cms/.env` for `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM`.
- To test email sending from dev, you can temporarily set up a local SMTP dev server (e.g., `smtp4dev`) or use valid SMTP creds and watch logs.

Hosts & cookies
- Run `./scripts/dev-setup.sh` (requires `sudo`) to add `preview.sbp.local`, `app.sbp.local`, and `admin.sbp.local` to `/etc/hosts`.
- If admin sessions appear on the wrong host, clear cookies for the two hosts in your browser (admin.sbp.local, app.sbp.local).

Tests & Playwright
- If Playwright tests fail locally, ensure browsers are installed: `pnpm exec playwright install`.
- Run unit tests: `pnpm run test:int` (from repo root).
- Run E2E: `pnpm run test:e2e` (from repo root).

Common platform issues
- macOS + sharp: repo contains a `pnpm.overrides` entry to help with sharp on Apple Silicon. If native build fails, ensure Node version matches `engines` and re-run `pnpm install`.

Useful commands
```
cd payload-cms && pnpm install
cd payload-cms && pnpm dev
cd web && pnpm dev
pnpm run test:int
pnpm run test:e2e
```

If you want, I can add OS-specific troubleshooting notes (Docker, M1/M2 builds, Postgres Docker setup).
