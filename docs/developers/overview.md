## Developer Overview — NSF CURE SBP

Purpose
- Quick onboarding checklist and pointers for contributors and maintainers.

What this repo contains
- `payload-cms/`: Payload CMS + Next.js admin and API (collections, endpoints, migrations).
- `web/`: Public Next.js application that consumes the Payload API.
- `docs/`: architecture, developer guides, and operations notes.

Quick start
1. Install dependencies per app:
```bash
cd payload-cms && pnpm install
cd ../web && pnpm install
```
2. Add local host entries (one-time):
```bash
./scripts/dev-setup.sh  # requires sudo
```
3. Run a local Postgres or use Docker Compose (see `docs/developers/stack.md` for a snippet).
4. Create `payload-cms/.env` (see `.github/AGENT.md` for a template) and set `DATABASE_URI`.
5. Start admin and web apps in separate terminals:
```bash
cd payload-cms && pnpm dev
cd web && pnpm dev
```

Where to change things
- Data models / collections: `payload-cms/src/collections/*.ts` — change schemas here and add migrations to `payload-cms/src/migrations/`.
- Admin views/components: `payload-cms/src/views/` — run `pnpm generate:importmap` after edits.
- API endpoints: `payload-cms/src/endpoints/` — handlers are registered in `payload.config.ts`.
- Public UI: `web/src/` contains pages and components for the student-facing site.

Testing and CI
- Local unit/integration tests: `pnpm run test:int`.
- Local E2E tests: `pnpm run test:e2e` (install Playwright browsers if needed).
- CI uses the root `test` script which runs both suites.

Standards and conventions
- Keep changes scoped to a single app unless a cross-app change is required.
- When adding or changing a collection, include a migration and run `pnpm generate:types`.
- Prefer small, reviewable PRs with clear migration steps and test coverage for behavioral changes.

Contacts
- Repo owner / lead: Alex (aaokonkwo@cpp.edu) — reach out for schema or deployment questions.

Further reading
- `docs/architecture/architecture.md` — system architecture and data flow.
- `docs/developers/stack.md` — tech stack and local dev commands.
- `.github/copilot-instructions.md` and `.github/AGENT.md` — AI agent guidance and troubleshooting.
