# 📊 AGORYS — Smart Decision Support System for Businesses

AGORYS is a full-stack intelligent decision support system designed to help businesses analyze data, generate KPIs, forecasts, and actionable recommendations using structured datasets.

It combines a modern web frontend, a scalable backend API, and a PostgreSQL database (Neon) powered by Prisma ORM.

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

## Planned Services
- analytics-service (future microservice for AI/ML + forecasting)

---

# 🧠 Core Features (Planned)

- User authentication (JWT + refresh tokens)
- Dataset upload & storage
- KPI computation engine
- Forecasting system (time-series analysis)
- Recommendation engine
- Interactive dashboards
- Report generation (summary / KPI / forecast / insights)

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
# 🗄️ Project Overview

This project is a full-stack system built around a structured relational database (Prisma) with a Next.js frontend and a Node.js backend. It focuses on datasets, analytics, forecasting, and reporting.

---

## 🎯 Goal

The goal of this system is to provide a scalable data platform where users can:

- Store and manage datasets
- Generate KPIs from structured data
- Produce forecasts and predictive insights
- Receive automated recommendations
- Generate analytical reports
- Maintain secure authentication via refresh tokens

The architecture is designed to support modular growth, clean data relationships, and future AI-driven analytics.

---

## 🗄️ Database Design (Prisma)

The system is built around a relational structure:

### Main Entities

- User
- Dataset
- DataRecord
- KPI
- Forecast
- Recommendation
- Report
- RefreshToken

### Key Relationships

- A **User** owns multiple **Datasets**
- A **Dataset** contains multiple **DataRecords**
- Each **Dataset** generates:
  - KPIs
  - Forecasts
  - Recommendations
- Users can generate **Reports** based on datasets

---

## ⚙️ Backend Setup

### Install dependencies
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
npm run dev
```
The app runs at:
```bash
http://localhost:3000
```
## 🗃️ Database Setup (Neon + Prisma)

