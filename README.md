# 📊 AGORYS — Smart Decision Support System for Businesses

AGORYS is a full-stack intelligent decision support platform designed to help businesses transform raw data into actionable insights.

It enables users to manage datasets, compute KPIs, generate forecasts, and receive automated recommendations through a scalable modern architecture.

---

# 🎯 Goal

The goal of AGORYS is to provide a unified data intelligence system where users can:

- Register and manage a company account (with teammates under the same company)
- Store and manage structured datasets
- Compute real-time KPIs
- Generate predictive forecasts
- Receive automated recommendations
- Build executive-summary reports from business data (viewable in-app and exportable as PDF/Excel)
- Support future AI-driven analytics and decision systems

The system is designed with modular scalability and clean separation of concerns (frontend, backend, and future analytics layer).

---

# 🚀 Tech Stack

## Frontend
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui components + Lucide Icons
- Zustand (auth/session state, persisted to `localStorage`)
- Zod (client-side form validation)
- Sonner (toast notifications)

## Backend
- Node.js + Express.js
- TypeScript (`tsx` watch runtime in dev)
- Prisma ORM
- Zod (request validation)
- JWT (access + refresh tokens) via `jsonwebtoken`
- bcryptjs (password hashing)

## Database
- PostgreSQL (Neon Cloud, accessed via Neon's pooled connection string with `pgbouncer=true`)

## Future Extensions
- `analytics-service` — AI/ML forecasting microservice (scaffolded, not yet wired to the main app)

---

# 🧠 Core Features

### Working end-to-end
- **Authentication:** register (with automatic self-serve company creation, or joining an existing company via `companyId`), email verification via one-time code, login, JWT access + refresh tokens, logout
- **Session persistence:** frontend automatically refreshes an expired access token in the background and retries the failed request — users stay logged in past the 15-minute access token lifetime without noticing
- **Dataset management:** CSV upload, column mapping, preview, delete
- **KPI engine:** computes and persists key metrics (total revenue, average revenue, top/bottom product, transaction count, revenue growth %) per dataset
- **Revenue trend & forecasting:** historical trend extraction plus a 6-month forward forecast
- **Recommendation engine:** rule-based suggestions generated from KPIs, trend, and forecast
- **Executive summary:** plain-language report generated on demand from KPIs + trend + recommendations, viewable in the dashboard and exportable as PDF or Excel

### Scaffolded, not yet functional
- **Forgot / reset password:** routes and validation schemas exist; the actual reset-token + email flow is not implemented yet
- **Email delivery:** `sendEmail()` currently only `console.log`s the message (OTPs and future notifications appear in the backend terminal, not in a real inbox) — swap in Resend/SendGrid/Nodemailer when ready
- **Company invites:** there's no UI yet for inviting a teammate to an existing company by anything other than manually sharing a `companyId`
- **`analytics-service`:** placeholder microservice for future AI/ML-driven forecasting, not yet connected to the backend

---

# 🏗️ Project Architecture

```bash
techtalks-agorys/
│
├── frontend/                          # Next.js (UI layer)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/                # /login, /register, /verify-email
│   │   │   ├── dashboard/
│   │   │   ├── upload/
│   │   │   └── reports/[datasetId]/   # KPIs, trend chart, forecast, recommendations, executive summary
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   ├── layout/
│   │   │   ├── ui/                    # shadcn/ui primitives
│   │   │   ├── require-auth.tsx       # route guard, redirects to /login if unauthenticated
│   │   │   └── logout-button.tsx
│   │   ├── hooks/
│   │   │   └── use-logout.ts
│   │   ├── lib/
│   │   │   ├── api-client.ts          # unauthenticated fetch wrapper (register/login/verify)
│   │   │   ├── auth-fetch.ts          # authenticated fetch wrapper w/ auto token refresh on 401
│   │   │   ├── api-error.ts
│   │   │   └── validations/           # Zod schemas mirroring backend validation
│   │   └── store/
│   │       └── auth-store.ts          # Zustand store, persists session to localStorage
│   ├── .env.local                     # NEXT_PUBLIC_API_URL=http://localhost:5000
│   └── package.json
│
│
├── backend/                           # Express + Prisma API
│   ├── src/
│   │   ├── server.ts                  # entry point (listens on :5000)
│   │   ├── app.ts                     # Express app, CORS (locked to http://localhost:3000), route mounting
│   │   ├── modules/
│   │   │   ├── auth/                  # AuthService + AuthController (register, verify, login, resend, refresh, logout)
│   │   │   └── routes/
│   │   │       └── auth.routes.ts     # mounted at /api/auth
│   │   ├── routes/
│   │   │   └── dataset.routes.ts      # mounted at /api/datasets
│   │   ├── controllers/
│   │   │   └── dataset.controller.ts
│   │   ├── services/
│   │   │   ├── dataset.service.ts     # upload, mapping, KPIs, forecast, recommendations, report summary
│   │   │   ├── kpiEngine.service.ts
│   │   │   ├── forecastEngine.service.ts
│   │   │   ├── recommendationEngine.service.ts
│   │   │   ├── reportExport.service.ts  # PDF/Excel export
│   │   │   ├── csvParser.service.ts
│   │   │   └── fileStorage.service.ts
│   │   ├── validationSchemas/         # one Zod schema per endpoint (login, register, resendVerification, etc.)
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts     # requireAuth — verifies JWT, attaches req.user
│   │   │   ├── error.middleware.ts    # central error handler
│   │   │   ├── validate.middleware.ts # applies a Zod schema to req.body
│   │   │   └── upload.middleware.ts   # multer config for CSV uploads
│   │   ├── utils/
│   │   │   ├── jwtHelper.ts
│   │   │   ├── pwdHelper.ts           # bcrypt hash/compare
│   │   │   ├── otpHelper.ts           # OTP generation + hashing
│   │   │   ├── emailHelper.ts         # sendEmail() — currently a console.log stub
│   │   │   └── refreshTokenHelper.ts
│   │   ├── integrations/              # email / google-oauth / openai / python — scaffolded for future use
│   │   ├── lib/
│   │   │   └── prisma.ts              # shared Prisma client instance
│   │   └── tests/                     # vitest integration + unit tests
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── .env                           # DATABASE_URL, JWT secrets, token expiry (never committed)
│   ├── package.json
│   ├── tsconfig.json
│   └── prisma.config.ts
│
│
├── analytics-service/                 # (future microservice, not yet wired up)
│   └── src/
│
├── .gitignore
├── LICENSE
└── README.md
```

---

# 🗄️ Database Design (Prisma)

## Entities

- **User** — belongs to one `Company`; `isVerified` gates login until email verification completes
- **Company** — created automatically on self-serve registration, or joined by passing an existing `companyId`
- **RefreshToken**, **EmailVerification**, **PasswordReset** — one-to-one with `User`, cascade-deleted with the user
- **Dataset** — belongs to a `Company`
- **DataRecord** — the raw uploaded rows behind a `Dataset` (date, product, revenue)
- **KPI**, **Forecast**, **Recommendation** — generated from a `Dataset`'s `DataRecord`s and persisted per dataset

## Relationships

- A **Company** has multiple **Users** and multiple **Datasets**
- A **Dataset** contains multiple **DataRecords**
- Each Dataset can generate and persist:
  - **KPIs**
  - **Forecasts**
  - **Recommendations**
- The **executive summary** report is computed on demand from a dataset's KPIs, trend, and recommendations — it is not persisted as its own table, only exported as PDF/Excel on request

> Note: the Prisma Client accessor for the `KPI` model is `prisma.kPI` (not `prisma.kpi`) — Prisma only lowercases the first letter of an all-caps model name, which is easy to miss.

---

# 🔑 Authentication Flow

1. `POST /api/auth/register` — email + password (+ optional `companyId` to join an existing company, or `companyName` for self-serve creation of a new one)
2. Backend emails (currently: prints to the server console) a 6-digit OTP
3. `POST /api/auth/verify-email` — email + OTP → returns `accessToken` + `refreshToken` and marks the user verified
4. `POST /api/auth/resend-verification` — reissues a fresh OTP if the code expired or wasn't received (rate-limited to once per 60 seconds per account)
5. `POST /api/auth/login` — email + password → returns tokens (blocked until `isVerified` is `true`)
6. Access tokens expire after 15 minutes; the frontend automatically calls `POST /api/auth/refresh` in the background on a 401 and retries the original request, so users stay signed in without re-entering credentials
7. `POST /api/auth/logout` — revokes the refresh token

---

# ⚙️ Backend Setup

## Install dependencies
```bash
cd backend
npm install
```

## Configure environment
Create `backend/.env` (never commit this file):
```bash
DATABASE_URL="postgresql://<user>:<password>@<neon-pooler-host>/<db>?sslmode=require&pgbouncer=true"
JWT_ACCESS_SECRET="<random string>"
JWT_REFRESH_SECRET="<random string>"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
```
> The `pgbouncer=true` flag is required on Neon's pooled connection string — without it, schema changes made via `db push`/migrations can cause `cached plan must not change result type` errors on the next query.

## Sync the database schema
For a fresh database:
```bash
npx prisma migrate dev
```
For an existing database that's drifted from migration history (safe for dev — does not delete data unless the schema change is destructive):
```bash
npx prisma db push
```

## Generate the Prisma Client
```bash
npx prisma generate
```

## Run the dev server
```bash
npm run dev
```
Runs at `http://localhost:5000`. CORS is locked to `http://localhost:3000`, so the frontend must run on that exact port.

## Inspect the database
```bash
npx prisma studio
```
Opens at `http://localhost:5555`.

---

# 🌐 Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run the dev server:
```bash
npm run dev
```
Runs at `http://localhost:3000` (must match the backend's CORS allowlist).

---

# 🧪 Tests

```bash
cd backend
npm run test
```
Covers auth (integration), dataset upload/mapping (integration), and the KPI/forecast/recommendation engines (unit).

---

# 📄 Custom Proprietary License
```bash
Copyright (c) 2026 AGORYS

This software is proprietary and confidential.

You are NOT allowed to:
- Copy, modify, or redistribute this software
- Sell or sublicense the software
- Use it to build a competing product
- Reverse engineer or extract core logic

You may only:
- View the source code for evaluation purposes (if granted access)

Any unauthorized use, reproduction, or distribution is strictly prohibited.
```