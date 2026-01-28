## Decisions Log — NSF CURE SBP

Purpose
- Capture high-level architectural and operational decisions to provide context for future contributors.

Recent decisions
- Payload + Next.js split: Use Payload CMS for admin and a separate Next.js `web` app for public site to optimize delivery and admin UX. (Decision date: 2025-12-01)
- Postgres as canonical DB: Chosen for reliability and compatibility with `@payloadcms/db-postgres`. (Decision date: 2025-12-05)

How to record a decision
1. Add an entry here with a short title, rationale, date, and owner.
2. Link to any relevant PR or issue for traceability.

Example entry
- Title: Use `nodemailer` adapter for dev and prod emails
	- Date: 2025-12-10
	- Owner: Alex
	- Rationale: `nodemailer` provides a simple adapter used by Payload; environment-driven config allows switching to other providers later.
	- PR: `#123`

Keep entries concise and link to PRs or RFCs when available.

