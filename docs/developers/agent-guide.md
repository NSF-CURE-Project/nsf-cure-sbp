# Agent Guide — quick orientation for contributors and AI agents

Purpose
- Short, actionable steps to use the repository-level AI guidance and to perform common contributor tasks quickly.

Where the AI guidance lives
- Primary instructions for AI agents: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Troubleshooting/runbook for humans & agents: [.github/AGENT.md](.github/AGENT.md)

Top quick tasks (copyable)
- Install and start CMS (admin):
```bash
cd payload-cms && pnpm install
cd payload-cms && pnpm dev
```
- Install and start web app:
```bash
cd web && pnpm install
cd web && pnpm dev
```
- Add local hosts (one-time):
```bash
./scripts/dev-setup.sh  # requires sudo
```

Schema / migrations / types
- Add migrations under `payload-cms/src/migrations/` using a timestamped filename: `YYYYMMDD_HHMMSS_description.ts`.
- After migrations or schema edits, regenerate types:
```bash
cd payload-cms && pnpm generate:types
```

Admin views & import map
- Put admin components in `payload-cms/src/views/`.
- Run `pnpm generate:importmap` in `payload-cms` after adding or moving views so `payload.config.ts` importMap paths resolve.

Tests & CI
- Local unit/integration tests: `pnpm run test:int` (vitest)
- Local E2E: `pnpm run test:e2e` (Playwright). If browsers are missing: `pnpm exec playwright install`.
- CI runs the root `test` script (see `package.json`) which runs both `test:int` and `test:e2e`.

Common troubleshooting (short)
- DB: check `payload-cms/.env:DATABASE_URI` and Postgres connectivity. See `docker-compose.pg.yml` example in `.github/copilot-instructions.md`.
- SMTP: verify `SMTP_*` variables in `payload-cms/.env`.
- Hosts/cookies: run `./scripts/dev-setup.sh`, then clear cookies for `admin.sbp.local` and `app.sbp.local` if sessions overlap.

How agents should behave (brief)
- Prefer editing under `payload-cms/` or `web/` only where appropriate — avoid unrelated large refactors.
- When adding schema/collection changes, always add a migration and run `pnpm generate:types`.
- For admin UI changes, add view under `src/views/`, run `pnpm generate:importmap`, and update `payload.config.ts` only if needed.