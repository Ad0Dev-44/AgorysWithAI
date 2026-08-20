# 📊 AGORYS — Smart Decision Support System for Businesses

AGORYS is a full-stack intelligent decision support platform designed to help businesses transform raw data into actionable insights.

It enables users to manage datasets, compute KPIs, generate forecasts, and receive automated recommendations through a scalable modern architecture — now extended with **AGORYS AI**, an LLM-powered assistant that explains, reports, and answers questions grounded in that data.

---

# 🎯 Goal

The goal of AGORYS is to provide a unified data intelligence system where users can:

- Register and manage a company account (with teammates under the same company)
- Store and manage structured datasets
- Compute real-time KPIs
- Generate predictive forecasts
- Receive automated recommendations
- Build executive-summary reports from business data (viewable in-app and exportable as PDF/Excel)
- **Ask an AI assistant to explain their dashboard, generate natural-language recommendations and reports, and answer open-ended business questions — with the assistant able to recall relevant past insights across a company's own history**

The system is designed with modular scalability and clean separation of concerns (frontend, backend, AI service, and future analytics layer).

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
- Axios (server-to-server calls to `ai-service`)

## AI Service (`ai-service/`)
- Node.js + Express.js, TypeScript (`ts-node-dev` in dev)
- **Hugging Face Inference Providers** — OpenAI-compatible chat-completions router, for text generation
- **`@huggingface/inference`** — dedicated feature-extraction client, for embeddings (a separate pipeline from chat completions)
- Isolated as its own service on its own port; never accesses the database directly — the backend gathers analytics data and forwards it

## Database
- PostgreSQL (Neon Cloud, accessed via Neon's pooled connection string with `pgbouncer=true`)
- **`pgvector` extension** — enables semantic similarity search over AI-generated content for retrieval-augmented chat

## Future Extensions
- `analytics-service` — a separate AI/ML forecasting microservice (scaffolded, not yet wired to the main app; distinct from the now-functional `ai-service` described above)

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
- **AGORYS AI — Dashboard Explanations:** converts a dataset's KPIs, trend, and forecast into a natural-language executive summary, generated on demand
- **AGORYS AI — Recommendations:** rewrites the rule-based recommendation engine's flagged risks into clear, prioritized, natural-language advice — grounded in the platform's own existing analysis rather than free-form generation
- **AGORYS AI — Report Generation:** produces a structured, natural-language executive report (Overview / Key Metrics / Trend & Patterns / Forecast Outlook / Recommended Next Steps) from a dataset's full analytics
- **AGORYS AI — Chat ("Ask AGORYS"):** a conversational assistant answering open-ended business questions, grounded in the selected dataset's KPIs and trend, and enhanced with retrieval over the company's own AI-generated history (see AI Architecture below)

### Scaffolded, not yet functional
- **Forgot / reset password:** routes and validation schemas exist; the actual reset-token + email flow is not implemented yet
- **Email delivery:** `sendEmail()` currently only `console.log`s the message (OTPs and future notifications appear in the backend terminal, not in a real inbox) — swap in Resend/SendGrid/Nodemailer when ready
- **Company invites:** there's no UI yet for inviting a teammate to an existing company by anything other than manually sharing a `companyId`
- **`analytics-service`:** placeholder microservice for future AI/ML-driven forecasting, not yet connected to the backend — separate from `ai-service`, which is already built and wired up
- **RAG relevance tuning:** retrieval currently returns a fixed top-k with no minimum-similarity threshold, so weakly related history can still be surfaced; a relevance cutoff and source-attribution UI are natural next steps
- **Automated AI evaluation harness:** current AI output has been verified through structured manual testing against contrasting sample datasets, not yet through a repeatable, scripted evaluation suite

---

# 🏗️ Project Architecture

```bash
techtalks-agorys/
│
├── frontend/                          # Next.js (UI layer)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/                # /login, /register, /verify-email
│   │   │   ├── dashboard/             # includes the "AGORYS AI" nav entry point
│   │   │   ├── upload/
│   │   │   ├── reports/[datasetId]/   # KPIs, trend chart, forecast, recommendations, executive summary
│   │   │   └── ai/                    # "Ask AGORYS" — dataset selector, chat, and AI insight cards
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   ├── layout/
│   │   │   ├── ui/                    # shadcn/ui primitives
│   │   │   ├── ai/                    # AIChat, AIMessage, AIInsightCard, AIRecommendation, AIReport
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
│   │   ├── ai/                        # AI orchestration layer, mounted at /api/ai
│   │   │   ├── ai.controller.ts       # gathers real KPI/trend/forecast data, forwards to ai-service
│   │   │   ├── ai.routes.ts           # /dataset/:id/explain, /report, /recommend, /chat
│   │   │   ├── ai.service.ts          # HTTP client for ai-service (chat, report, recommend, embed)
│   │   │   ├── embeddingStore.service.ts  # writes AI-generated content + embeddings via raw SQL
│   │   │   └── retrieval.service.ts   # embeds a query, runs pgvector similarity search for RAG
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
│   │   └── migrations/                # includes the hand-written AIInsightEmbedding / pgvector migration
│   │
│   ├── .env                           # DATABASE_URL, JWT secrets, token expiry, AI_SERVICE_URL (never committed)
│   ├── package.json
│   ├── tsconfig.json
│   └── prisma.config.ts
│
│
├── ai-service/                        # Isolated AI microservice — never touches the database directly
│   ├── src/
│   │   ├── server.ts                  # entry point (listens on :5001)
│   │   ├── app.ts                     # Express app, mounts ai.routes
│   │   ├── config/
│   │   │   └── model.ts               # Hugging Face router endpoint, model name, generation params
│   │   ├── controllers/
│   │   │   ├── ai.controller.ts       # chat / explain / report / recommend handlers
│   │   │   └── embedding.controller.ts
│   │   ├── routes/
│   │   │   └── ai.routes.ts           # /chat, /dashboard/explain, /report, /recommendations, /embed
│   │   ├── services/
│   │   │   ├── llm.service.ts         # the ONLY file that calls the chat-completions router
│   │   │   ├── embedding.service.ts   # the ONLY file that calls the feature-extraction client
│   │   │   ├── prompt.service.ts      # dashboard explanation + chat prompt orchestration
│   │   │   ├── report.service.ts
│   │   │   └── recommendation.service.ts
│   │   ├── prompts/
│   │   │   ├── dashboard.prompt.ts
│   │   │   ├── report.prompt.ts
│   │   │   └── recommendation.prompt.ts
│   │   └── types/
│   │       └── ai.types.ts            # Metric, TrendPoint, ForecastPoint — mirrors the backend's real data shapes
│   ├── .env                           # HF_API_KEY, AI_MODEL_NAME, AI_SERVICE_PORT (never committed)
│   ├── package.json
│   └── tsconfig.json
│
│
├── analytics-service/                 # (future microservice, not yet wired up — separate from ai-service)
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
- **AIInsightEmbedding** — stores every AI-generated dashboard explanation, report, and recommendation set as a semantic embedding, scoped by `companyId` and `datasetId`, tagged with a `sourceType` (`DASHBOARD_EXPLAIN` | `REPORT` | `RECOMMENDATION`). Powers retrieval for the chat assistant.

## Relationships

- A **Company** has multiple **Users** and multiple **Datasets**
- A **Dataset** contains multiple **DataRecords**
- Each Dataset can generate and persist:
  - **KPIs**
  - **Forecasts**
  - **Recommendations**
  - **AIInsightEmbeddings** (one per AI generation, captured automatically)
- The **executive summary** report is computed on demand from a dataset's KPIs, trend, and recommendations — it is not persisted as its own table, only exported as PDF/Excel on request

> Note: the Prisma Client accessor for the `KPI` model is `prisma.kPI` (not `prisma.kpi`) — Prisma only lowercases the first letter of an all-caps model name, which is easy to miss.

> **Note on `AIInsightEmbedding.embedding`:** this column is a `vector(384)` type via the `pgvector` extension. Prisma's schema DSL cannot express this natively — it's declared as `Unsupported("vector(384)")` in `schema.prisma`, meaning it cannot be read or written through normal `prisma.aiInsightEmbedding.create(...)` calls. All reads and writes to this column go through raw SQL (`$executeRaw` / `$queryRaw`) in `backend/src/ai/embeddingStore.service.ts` and `retrieval.service.ts`. The table and vector column were also added via a **hand-written migration**, not `prisma migrate dev` — this project's migration history has a gap from an earlier manually-resolved migration, which breaks `migrate dev`'s shadow-database diffing; `prisma migrate deploy` (which applies SQL directly, no shadow database) was used instead.

---

# 🤖 AI Architecture & Methodology

AGORYS AI intentionally uses **two different techniques**, applied only where each is actually appropriate — rather than labeling the whole feature "RAG" for its own sake.

## Structured data-grounded prompting (dashboard explanations, reports, recommendations)

These three features do **not** use retrieval. `dataset.service.ts`'s existing `kpiEngine`, `forecastEngine`, and `recommendationEngine` already produce exact, deterministic KPIs, trend points, forecasts, and risk-flag strings. The backend (`backend/src/ai/ai.controller.ts`) gathers this real data and forwards it to `ai-service`, where purpose-built prompt templates (`ai-service/src/prompts/`) inject it directly into the prompt — the model is asked to **interpret and explain**, never to compute. For recommendations specifically, the model rewrites the recommendation engine's own flagged risks into prioritized, natural-language advice, rather than inventing new ones. With a small, precise, already-correct dataset, there is nothing to semantically retrieve — introducing embeddings here would add complexity without benefit.

## Retrieval-Augmented Generation (chat only)

The "Ask AGORYS" chat assistant uses standard dense-retrieval RAG:

1. Every dashboard explanation, report, and recommendation set generated by the system is automatically embedded (`sentence-transformers/all-MiniLM-L6-v2`, 384 dimensions, via Hugging Face's dedicated feature-extraction inference client) and stored in `AIInsightEmbedding`, fired off asynchronously so it never blocks or slows down the user-facing response (`backend/src/ai/ai.controller.ts`'s `captureInsightEmbedding`).
2. When a user sends a chat message, `backend/src/ai/retrieval.service.ts` embeds the query and runs a `pgvector` cosine-similarity search (`<=>` operator) scoped to the company — across **every dataset the company has ever uploaded**, not just the currently selected one.
3. The top-k most relevant past insights are attached to the chat request as `retrievedContext`, and `ai-service`'s chat prompt (`prompt.service.ts`) includes them under a "Relevant past insights" section before generating a response.

Retrieval logic deliberately lives in the **backend**, not `ai-service` — preserving the rule that `ai-service` never accesses the database directly. This is what gives the assistant continuity ("how does this compare to last quarter?") that the other three AI features intentionally don't need.

## Language model

Text generation uses `openai/gpt-oss-20b`, accessed through Hugging Face's OpenAI-compatible **Inference Providers router** (`router.huggingface.co`, backed by Fireworks AI) rather than a self-hosted model. Generation parameters: `temperature: 0.4` (favors grounded, consistent output), `max_tokens: 1500`, and `reasoning_effort: "low"` — the latter two specifically because `gpt-oss-20b` spends part of its token budget on internal reasoning before answering, and a tighter limit was found to silently truncate responses mid-thought.

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
AI_SERVICE_URL="http://localhost:5001"
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
> If `migrate dev` fails with a shadow-database error (`P3006`), the migration history has a gap — apply pending migrations directly instead with `npx prisma migrate deploy`, which doesn't require a shadow database.

## Generate the Prisma Client
```bash
npx prisma generate
```

## Run the dev server
```bash
npm run dev
```
Runs at `http://localhost:5000`. CORS is locked to `http://localhost:3000`, so the frontend must run on that exact port. Requires `ai-service` to be running for any `/api/ai/*` route to work.

## Inspect the database
```bash
npx prisma studio
```
Opens at `http://localhost:5555`. Note: the `AIInsightEmbedding.embedding` column will not render meaningfully here, since it's a Prisma `Unsupported` type — this is expected, not a bug.

---

# 🧠 AI Service Setup

## Enable `pgvector` on your database
Run once, via Neon's SQL Editor or any Postgres client:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Install dependencies
```bash
cd ai-service
npm install
```

## Configure environment
Create `ai-service/.env` (never commit this file):
```bash
HF_API_KEY="<your Hugging Face access token>"
AI_MODEL_NAME="openai/gpt-oss-20b:fireworks-ai"
AI_SERVICE_PORT=5001
```
> Get a token at `huggingface.co/settings/tokens` (Read role). Model/provider availability on the router can change over time — check `huggingface.co/settings/inference-providers` if generation starts failing with a "not supported by any provider" error, and pin an explicitly active provider using the `model:provider` suffix as shown above.

## Run the dev server
```bash
npm run dev
```
Runs at `http://localhost:5001`. Confirm it's healthy:
```bash
curl http://localhost:5001/health
```

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
Runs at `http://localhost:3000` (must match the backend's CORS allowlist). The AI assistant is available at `/ai`, linked from the dashboard's "AGORYS AI" button.

---

# 🧪 Tests

```bash
cd backend
npm run test
```
Covers auth (integration), dataset upload/mapping (integration), and the KPI/forecast/recommendation engines (unit). AI features are currently verified through structured manual testing rather than an automated test suite — see "Scaffolded, not yet functional" above.

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
