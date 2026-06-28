# 📊 AGORYS — Smart Decision Support System for Businesses

AGORYS is a full-stack intelligent decision support platform designed to help businesses transform raw data into actionable insights.

It enables users to manage datasets, compute KPIs, generate forecasts, and receive automated recommendations through a scalable modern architecture.

---

# 🎯 Goal

The goal of AGORYS is to provide a unified data intelligence system where users can:

- Store and manage structured datasets
- Compute real-time KPIs
- Generate predictive forecasts
- Receive automated recommendations
- Build analytical reports from business data
- Support future AI-driven analytics and decision systems

The system is designed with modular scalability and clean separation of concerns (frontend, backend, and analytics layer).

---

# 🚀 Tech Stack

## Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Lucide Icons
- Sonner (notifications)

## Backend
- Node.js
- Express.js
- TypeScript (tsx runtime)
- Prisma ORM

## Database
- PostgreSQL (Neon Cloud)

## Future Extensions
- analytics-service (AI/ML forecasting microservice)

---

# 🧠 Core Features

- User authentication (JWT + refresh tokens)
- Dataset upload & management
- KPI computation engine
- Time-series forecasting system
- Recommendation engine
- Interactive dashboards
- Report generation (KPIs, forecasts, insights)

---

# 🏗️ Project Architecture

```bash
techtalks-agorys/
│
├── frontend/                      # Next.js (UI layer)
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   ├── components/           # UI components
│   │   │   ├── landing/
│   │   │   │   ├── cta.tsx
│   │   │   │   └── ...
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       └── ...
│   │   ├── lib/
│   │   └── styles/
│   │
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── next.config.js
│
│
├── backend/                       # Express + Prisma API
│   ├── src/
│   │   ├── server.ts             # Express entry point
│   │   ├── lib/
│   │   │   └── prisma.ts         # Prisma client instance
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── services/
│   │
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── migrations/           # Prisma migrations
│   │
│   ├── .env                      # DATABASE_URL (Neon)
│   ├── package.json
│   ├── tsconfig.json
│   └── prisma.config.ts
│
│
├── analytics-service/            # (future microservice)
│   ├── src/
│   ├── package.json
│   └── ...
│
│
├── shared/                       # (optional shared types/utils)
│   ├── types/
│   └── constants/
│
│
├── package-lock.json            # ⚠️ root lockfile (avoid if possible)
└── README.md
```

# 🗄️ Database Design (Prisma)

## Main Entities

- User
- Dataset
- DataRecord
- KPI
- Forecast
- Recommendation
- Report
- RefreshToken

## Relationships

- A **User** owns multiple **Datasets**
- A **Dataset** contains multiple **DataRecords**
- Each Dataset generates:
  - KPIs
  - Forecasts
  - Recommendations
- Users can generate **Reports** from datasets

---

# ⚙️ Backend Setup

## Install dependencies
```bash
cd backend
npm install
```
### Run development server
```bash
npm run dev
```
### Prisma commands
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
```
## 🌐 Frontend Setup

```bash
cd frontend
npm install
```
### Run development server
```bash
npm run dev
```
Frontend runs at:
```bash
http://localhost:3000
```
## 🗃️ Database Setup (Neon + Prisma)

- Create a Neon project  
- Copy `DATABASE_URL` into `.env`

### Run migrations

```bash
npx prisma migrate dev
npx prisma generate
```

## 📊 Prisma Studio (Database Viewer)

To visually inspect the database:
```bash
npx prisma studio
```
Then open:
```bash
http://localhost:5555
```

## 📄 Custom Proprietary License
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
