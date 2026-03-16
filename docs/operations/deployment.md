## Deployment Notes — NSF CURE SBP

Overview
- This document captures recommended deployment procedures and environment considerations for deploying both the CMS (`payload-cms`) and the public site (`web`).

Environments
- Stages: `dev` (local), `preview` (staging), `prod` (production).
- Environment variables are primarily stored in per-service env files or the hosting provider's secret store. Key variables: `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`, `FRONTEND_URL`, and `SMTP_*`.
- Email provider env vars: priority order is Resend Starter relay (`RESEND_STARTER_SEND_URL`) -> direct Resend (`RESEND_API_KEY`, `RESEND_FROM`) -> SMTP (`SMTP_*`).

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
- Production automation: `.github/workflows/payload-cms-migrate.yml` runs `pnpm payload migrate` on pushes to `production` (and manual dispatch), serialized via a concurrency group.
- Required GitHub `production` environment secrets for migration job:
  - `PAYLOAD_DATABASE_URI` (Postgres connection string for production DB)
  - `PAYLOAD_SECRET` (Payload secret used by the CMS config)

Static hosting & CDN
- The `web` app is a standard Next.js app — host on Vercel, Netlify, or any platform that supports Next.js. Ensure `NEXT_PUBLIC_PAYLOAD_URL` points to the CMS API.

Scaling & considerations
- For production, run multiple instances behind a load balancer and use a managed Postgres for durability.
- Configure backups for Postgres and store them offsite.

Rollbacks
- Keep migrations reversible when possible. If a destructive migration is applied, follow DB restore steps from backups.


Branch strategy (recommended)
- Keep `main` and `prod` aligned for production reliability.
- Treat `prod` as a release pointer that should fast-forward from `main`.
- Promote releases with `git merge --ff-only origin/main` while on `prod`.
- Avoid direct commits to `prod`; for emergency hotfixes, immediately back-merge to `main`.


Release promotion commands
- Use fast-forward-only promotions to move tested commits through environments:
```bash
# dev -> main
git checkout main
git pull origin main
git merge --ff-only origin/dev
git push origin main

# main -> production
git checkout production
git pull origin production
git merge --ff-only origin/main
git push origin production
```

CI suggestions
- CI should run: `pnpm run test:int` and `pnpm run test:e2e` (Playwright) before deploying.

Contact
- Owner: Alex (aaokonkwo@cpp.edu) — ask before making infra-level changes.
