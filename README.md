# NSF CURE Summer Bridge Program

## Project summary
The NSF CURE Summer Bridge Program (SBP) is a National Science Foundation-funded initiative (NSF Award #2318158) that launched in 2026 to help rising second-year engineering students build a strong foundation in Statics and Mechanics of Materials. This repository hosts the CMS/admin experience and the student-facing web application.

## Who is it for?
- Program staff and professors managing content, classes, and student progress in the admin dashboard.
- Students completing lessons, tracking progress, and submitting feedback on the public site.

## Tech stack
- Next.js 15, React 19, TypeScript
- Payload CMS 3 (admin + API)
- PostgreSQL (via `@payloadcms/db-postgres`)
- Tailwind CSS (web app)

## Quick start
1. Install dependencies:
   - `cd payload-cms && pnpm install`
   - `cd ../web && pnpm install`
2. Configure environment variables:
   - `payload-cms/.env`: set `DATABASE_URI` and optionally `PAYLOAD_PUBLIC_SERVER_URL`, `WEB_PREVIEW_URL`, `PREVIEW_SECRET`
   - `web/.env.local`: set `NEXT_PUBLIC_PAYLOAD_URL` and optionally `NEXT_PUBLIC_SITE_URL`
3. Run the CMS/admin app:
   - `cd payload-cms && pnpm dev`
   - Admin: `http://localhost:3000/admin`
4. Run the web app:
   - `cd web && pnpm dev`
   - Site: `http://localhost:3001`

## Documentation links
- Architecture overview: `docs/architecture/architecture.md`
- Data models: `docs/developers/data-models.md`
- Analytics: `docs/developers/analytics.md`
- Admin dashboard guide: `docs/staff/admin-dashboard.md`
- Deployment notes: `docs/operations/deployment.md`
- Decisions log: `docs/operations/decisions.md`

## Contact / ownership
Owner: Alex (Lead Programmer) aaokonkwo@cpp.edu
