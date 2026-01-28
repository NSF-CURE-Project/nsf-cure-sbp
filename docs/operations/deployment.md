## Deployment Notes — NSF CURE SBP

Overview
- This document captures recommended deployment procedures and environment considerations for deploying both the CMS (`payload-cms`) and the public site (`web`).

Environments
- Stages: `dev` (local), `preview` (staging), `prod` (production).
- Environment variables are primarily stored in per-service env files or the hosting provider's secret store. Key variables: `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`, `FRONTEND_URL`, and `SMTP_*`.

Build & run (example)
- CMS (Payload + Next.js):
```bash
cd payload-cms
pnpm install
pnpm build
pnpm start
```
- Web (Next.js):
```bash
cd web
pnpm install
pnpm build
pnpm start
```

Database migrations
- Migrations live in `payload-cms/src/migrations/`. Run migrations as part of your deploy pipeline against the target Postgres database before starting the CMS. After migrations, ensure `payload-types.ts` is up to date.

Static hosting & CDN
- The `web` app is a standard Next.js app — host on Vercel, Netlify, or any platform that supports Next.js. Ensure `NEXT_PUBLIC_PAYLOAD_URL` points to the CMS API.

Scaling & considerations
- For production, run multiple instances behind a load balancer and use a managed Postgres for durability.
- Configure backups for Postgres and store them offsite.

Rollbacks
- Keep migrations reversible when possible. If a destructive migration is applied, follow DB restore steps from backups.

CI suggestions
- CI should run: `pnpm run test:int` and `pnpm run test:e2e` (Playwright) before deploying.

Contact
- Owner: Alex (aaokonkwo@cpp.edu) — ask before making infra-level changes.

