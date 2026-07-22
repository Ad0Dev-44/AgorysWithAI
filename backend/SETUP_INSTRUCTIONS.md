# What was fixed, and what to run

## Round 1 fixes (already applied)
1. `server.ts` was a disconnected stub -- it now boots the real `app.ts`,
   which has your actual routes wired in.
2. `schema.prisma` rewritten to match your live database exactly (verified
   via `db pull`): `User`, `RefreshToken`, `EmailVerification`,
   `PasswordReset`, `Dataset`, `DataRecord`.
3. Added `Forecast`, `KPI`, `Recommendation` tables -- `Forecast` is actively
   used by `dataset.service.ts`; `KPI`/`Recommendation` are required
   structurally because of a `_count` select on `Dataset`.
4. Dropped two unused, blocking `NOT NULL` columns on `Dataset`
   (`filepath`, `columns`).

## Round 2 fixes (this pass -- "perfect the backend")

### 1. companyId is now real (invite-into-existing-company model)
You chose: **users are invited into an existing company**, not
self-registered as a new company. So:

- Added a `Company` model/table.
- Added `User.companyId` (nullable FK to `Company`, `onDelete: SetNull`).
- `POST /api/auth/register` now **requires** a `companyId` in the request
  body, and rejects registration with `404 COMPANY_NOT_FOUND` if that
  company doesn't exist. There's no admin/invite-code UI yet -- for now,
  create companies directly (e.g. via `npx prisma studio`, or a quick
  `prisma.company.create(...)` script) and hand out their `id` as the
  "invite."
- The JWT access token now carries `companyId` alongside `userId`.
- `auth.middleware.ts` now sets `req.user.companyId` from the verified
  token, so `dataset.controller.ts`'s `getCompanyId()` actually works --
  **dataset routes will no longer silently 401.**
- `refresh()` re-fetches the user's current `companyId` from the DB before
  issuing a new access token, so a company reassignment takes effect on the
  next refresh rather than being stuck in a stale token.

### 2. Fixed the forecast handler argument-order bug
`generateForecastHandler` was calling
`generateForecastForDataset(req.user!.userId, datasetId)` -- passing a
userId where a companyId was expected. Now correctly calls
`generateForecastForDataset(datasetId, companyId)`, matching every other
handler in that file.

## Commands to run, in order

```bash
cd backend
npm install
```

Reset Prisma's migration bookkeeping (only clears the internal tracking
table -- no business data):

```bash
npx prisma db execute --stdin <<< "DROP TABLE IF EXISTS \"_prisma_migrations\";"
```

Mark the baseline as already applied (describes what's already live --
nothing is executed):

```bash
npx prisma migrate resolve --applied 0_baseline
```

Apply the real changes (Forecast/KPI/Recommendation tables, dropped unused
columns, new Company table + User.companyId):

```bash
npx prisma migrate deploy
```

Confirm everything is in sync:

```bash
npx prisma migrate status
npx prisma generate
```

Create at least one company so you have something to register into:

```bash
npx prisma studio
```
(Open the Company table in the browser UI and add a row manually, or run a
one-off script with `prisma.company.create({ data: { name: "Acme" } })`.)
Copy its `id` -- that's what you'll pass as `companyId` when registering a
user via `POST /api/auth/register`.

```bash
npm run dev
```

`GET http://localhost:5000/` should return the health check instantly.
`POST /api/auth/register` now requires `{ email, password, companyId }`.

## Still not built (not bugs, just not implemented yet)
- No endpoint to create a `Company` or generate invite codes -- registration
  currently expects you to hand out a raw `companyId`. If you want a real
  invite-code flow (time-limited, single-use codes) instead of raw IDs, say
  the word and I'll build it.
- `forgotPassword` / `resetPassword` are still placeholders (as they were
  before) -- they don't send emails or touch the `PasswordReset` table yet,
  even though that table exists.
