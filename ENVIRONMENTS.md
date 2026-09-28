# MishMish environments (zero test/prod mixing)

The canonical operating guide is
[`docs/DATA_ENVIRONMENTS.md`](docs/DATA_ENVIRONMENTS.md). Keep procedural
changes there and use this file as the high-level deployment matrix.

## Matrix

| | Local | Staging (planned) | Production |
|--|--|--|--|
| API | `http://localhost:4000/api` (Mac) | TBD Railway staging URL | `https://mismish-production.up.railway.app/api` |
| DB | Docker `mismish-local-pg` `:5433` | **Separate** Railway Postgres | Prisma Accelerate / prod Postgres |
| Website | Vite `:5173`, `VITE_API_BASE=http://localhost:4000/api` | Staging host → staging API | Prod host → prod API |
| Mobile Expo sim | `EXPO_PUBLIC_API_URL=http://127.0.0.1:4000/api` | n/a | n/a |
| Physical phone / TestFlight | Cannot use Mac localhost | EAS `preview` → **staging API only** | EAS `production` → prod API |
| `SMS_DEV_MODE` | `true` | `true` (until go-live of staging OTP) | `false` |
| Collect route | enabled (non-production NODE_ENV) | decide with Karim | currently gated off |

## Local (DONE on Mac)

- Container: `mismish-local-pg` (Postgres 15), `127.0.0.1:5433`
- Creds: user/db `mismish` / `mismish_local` (password local-only)
- Backend `.env` uses `APP_ENV=local` and the local database; the Accelerate URL is saved in `.env.accelerate` (gitignored)
- Commands:
  - `cd backend && npm run local:up`
  - `cd backend && npm run local:seed`
  - `cd backend && npm run local:reset` only when intentionally rebuilding local data
- Seed users (password `password123`): `karim@mismish.app`, `sara@mismish.app`
- Vendor seed password: `password123` (emails `*@mismish.app`)
- Admin row present in local DB (count=1) — confirm password with whoever seeded admin if not in `seed.ts`
- Website `.env.local` → localhost API; mobile `.env` → `127.0.0.1:4000`

## Staging plan (NOT built yet — needs Karim + Railway access)

1. Create Railway **staging** environment (or separate project) with its own Postgres plugin/service.
2. Deploy backend service with env: staging `DATABASE_URL`, `JWT_SECRET` (unique), `SMS_DEV_MODE=true`, Authentica keys as needed, `NODE_ENV=production` or `staging` (decide collect gate).
3. Run migrations against staging DB only; seed QA data (same seed script).
4. Website: Vercel preview/staging project env `VITE_API_BASE=<staging-api>/api`.
5. Mobile EAS environments:
   - Set `EXPO_PUBLIC_API_URL=<staging-api>/api` in the EAS `preview` environment
   - Keep `production` on the production API only
6. Physical phone reaches staging via public HTTPS staging API (not Mac localhost). Optional: tunnel (ngrok) for ad-hoc device→Mac — not for TF.
7. No git push until Karim says; create staging from Railway UI / approved deploy.

## TestFlight (HELD)

- Prerequisite: staging API+DB live; EAS login (`eas login`); `preview` profile → staging only.
- Do not ship TF against Railway production while sandboxing.

## Production cleanup plan (DRAFT ONLY — do not execute)

### Backup / restore
1. Railway Postgres snapshot / Prisma Accelerate backup / `pg_dump` of prod before any write.
2. Store dump off-box; verify restore to a scratch DB.
3. Written rollback: restore snapshot if delete goes wrong.

### Read-only inventory (criteria to classify test data)
Run **SELECT-only** queries after approve, e.g.:
- Vendors/users with emails matching `%mismish.app`, `%test%`, `%example.com`, seed names
- Listings with Unsplash seed image hosts / seed titles
- Orders tied to those users/vendors
- Admins created for QA
- Rows created in known seed windows

### Deletion criteria (for Karim approve before any DELETE)
- Only rows matching inventory allowlist
- Never delete real restaurant vendors / real customer phones without explicit list review
- Prefer soft-disable (`status=SUSPENDED`) before hard delete where FKs exist (orders)

### Rollback
- Restore from backup within RPO window; re-verify counts

## Safety rules
- No prod mutation without Karim explicit approve + backup
- No `SMS_DEV_MODE=false` on local during QA
- Collect-in-prod stays gated until staging decision
- No git push unless Karim says
