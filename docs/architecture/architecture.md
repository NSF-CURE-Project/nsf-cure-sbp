## Architecture Overview — NSF CURE SBP

Summary
- Two primary applications in the repo: the CMS/admin app (`payload-cms/`) and the public web app (`web/`). The CMS hosts the Payload admin UI and provides the API used by the `web` app.

Primary components
- `payload-cms/` (Payload + Next.js)
	- Responsibilities: admin UI, content authoring, API endpoints, authentication, email sending, and DB migrations.
	- Key files: `src/payload.config.ts` (central registration of collections, globals, endpoints, email adapter, DB adapter), `src/collections/` (data models), `src/endpoints/` (custom API handlers), `src/views/` (custom admin views), and `src/migrations/`.
- `web/` (Next.js public app)
	- Responsibilities: public site rendering, student-facing UI, and consuming the Payload API.
	- Key files: `src/app/`, `src/components/`, `next.config.ts` and `web/package.json` scripts.
- Database: PostgreSQL
	- The canonical datastore, accessed by the `payload-cms` app via `@payloadcms/db-postgres`. Connection configured with `payload-cms/.env:DATABASE_URI`.

Service boundaries and data flow
- Authors/staff use the admin UI (`admin.sbp.local:3000`) to create and manage content (collections, pages, lessons, quizzes).
- The CMS persists data to Postgres and exposes API endpoints (both automatically via Payload collections and via custom endpoints registered in `payload.config.ts`).
- The `web` app fetches content from the CMS API (configured by `NEXT_PUBLIC_PAYLOAD_URL` in `web/.env.local`) to render student-facing pages.
- Preview and live-preview features are wired in `payload.config.ts` (see `admin.livePreview`) to render preview frames for pages and lessons.

Why this structure
- Payload CMS was chosen to provide a powerful admin UI with minimal custom UI work and to centralize data modelling and access control.
- Separating the admin (Payload) and the public `web` app enables the public site to be optimized for delivery while the admin handles content and business logic.

Integration points & cross-cutting concerns
- Authentication: collections check `req.user` in access functions (see `src/collections/Users.ts`). The admin user collection is declared in `payload.config.ts` under `admin.user`.
- Email: the `nodemailer` adapter is created in `payload.config.ts` using `SMTP_*` env vars. Use the same adapter pattern when sending programmatic messages.
- File handling & images: `sharp` is registered in the Payload config for image processing — watch native build issues on macOS.
- Import map: admin views are referenced via import map entries (generated with `pnpm generate:importmap`) and resolved by `admin.importMap`.

Operational notes
- Hosts: local dev uses `admin.sbp.local:3000` (admin) and `app.sbp.local:3001` (web). Use `./scripts/dev-setup.sh` to add them to `/etc/hosts`.
- Migrations: contained in `payload-cms/src/migrations/`. After schema changes, add a migration and run `pnpm generate:types` in `payload-cms`.
- Tests: unit/integration via `vitest` and E2E via Playwright — scripts defined in root `package.json`.

Where to read next
- `docs/developers/stack.md` — quick stack and commands.
- `docs/developers/data-models.md` — collection schemas and relationships.
- `payload-cms/src/payload.config.ts` — concrete wiring of collections, endpoints, and admin UI.
