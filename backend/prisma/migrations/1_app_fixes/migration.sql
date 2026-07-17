-- Forward migration: brings the live database in line with the app's
-- actual requirements. Safe / additive except for two unused NOT NULL
-- columns being dropped from "Dataset" (filepath, columns) -- the app
-- never reads or writes them (CSV files are stored on disk, not in
-- Postgres), so dropping them does not affect any working feature.

-- Drop unused columns on Dataset that block prisma.dataset.create()
-- (they were NOT NULL with no default, and the app never supplies them)
ALTER TABLE "Dataset" DROP COLUMN IF EXISTS "filepath";
ALTER TABLE "Dataset" DROP COLUMN IF EXISTS "columns";

-- CreateTable: Forecast (did not exist before)
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Forecast_datasetId_idx" ON "Forecast"("datasetId");

ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_datasetId_fkey"
    FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: KPI (did not exist before)
CREATE TABLE "KPI" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "KPI_datasetId_idx" ON "KPI"("datasetId");

ALTER TABLE "KPI" ADD CONSTRAINT "KPI_datasetId_fkey"
    FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Recommendation (did not exist before)
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Recommendation_datasetId_idx" ON "Recommendation"("datasetId");

ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_datasetId_fkey"
    FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
