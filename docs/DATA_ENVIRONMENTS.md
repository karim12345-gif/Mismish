# MishMish data environments

## Rule
Never point local Mac API or merchant Vite at production data for day-to-day QA.
Never wipe / truncate production without Karim’s explicit approve + backup plan.

## Local (Mac sandbox) — current default for joint QA
- Postgres: Docker container `mismish-local-pg` on host port **5433**
  - DB: `mismish_local` / user: `mismish` / password: `mismish_local`
  - Bound to `127.0.0.1`, so it is not exposed to the local network
  - Start: `cd backend && npm run local:up`
- Backend `.env` `DATABASE_URL=postgresql://mismish:mismish_local@127.0.0.1:5433/mismish_local?schema=public`
- Backend `.env` must include `APP_ENV=local`; startup refuses any non-local
  database while this guard is active
- Accelerate URL saved at `backend/.env.accelerate` (gitignored) — restore only when intentionally hitting cloud DB
- Prisma client: plain postgres uses `@prisma/adapter-pg`; Accelerate URLs still use `accelerateUrl`
- Seed: `cd backend && npx prisma db seed` (vendors/listings/test users)
- Test users (seed): `karim@mismish.app` / `sara@mismish.app` — password `password123`
- Vendors: seed emails `*@mismish.app` — password `password123`
- Admin (local bootstrap): `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`; created on API start
- SMS: keep `SMS_DEV_MODE=true`
- Website: `VITE_API_BASE=http://localhost:4000/api` in `.env.local`
- Mobile Expo local: point API at Mac LAN / localhost — not Railway

### Recreate local DB
```bash
cd backend
npm run local:up
npm run local:reset
```

### Local database commands
```bash
cd backend
npm run local:up       # start Postgres
npm run local:seed     # migrate, sync schema, and seed
npm run local:reset    # erase and rebuild the guarded local DB only
npm run local:down     # stop Postgres without deleting its volume
```

The reset and seed scripts refuse to run unless `APP_ENV=local` and the URL is
exactly the loopback `mismish_local` database on port `5433`.

Backend readiness is available at `GET http://127.0.0.1:4000/health`.

## Push notifications by environment

Push delivery is independent of whether the API uses a local, staging, or
production database. Each environment can send a real push when all three
parts are present:

1. The iOS app has notification permission and registers its FCM device token.
2. The backend environment has a valid `FIREBASE_SERVICE_ACCOUNT`.
3. Firebase has the APNs authentication key for the MishMish iOS bundle ID.

The successful physical-device push test confirms the app, Firebase, and APNs
configuration used by that test. Production will use the same flow, but the
Railway production service must also contain the Firebase service-account
environment value. `SMS_DEV_MODE` affects OTP only; it does not disable push.

## Staging (target for TestFlight later)
- Separate DB (not Accelerate prod, not Mac Docker)
- API host TBD (Railway staging or similar)
- Configure the EAS `preview` environment with the staging API **before** TF
- The EAS `production` profile remains connected to the production API
- Collect-in-prod gate: product call still open; staging can enable collect without touching prod

## Production
- Prisma Accelerate / Railway prod API
- Do not run `prisma db seed`, destructive SQL, or `db push --accept-data-loss` here
- Restore Mac to Accelerate only by copying URL from `.env.accelerate` back into `.env` and restarting API
- TF / EAS: HOLD until staging exists; then TF → staging only

## Switch Mac backend back to Accelerate (prod cloud data)
```bash
# from backend/
# copy DATABASE_URL line from .env.accelerate into .env, restart API
# WARNING: writes hit shared cloud data — avoid for QA
```
