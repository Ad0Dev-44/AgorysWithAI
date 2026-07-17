-- Adds Company table and links User -> Company (invite-into-existing-company model).
-- Additive only: existing users keep companyId = NULL until assigned.

CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ADD COLUMN "companyId" TEXT;

CREATE INDEX "User_companyId_idx" ON "User"("companyId");

ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
