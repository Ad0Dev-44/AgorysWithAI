-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "AIInsightSourceType" AS ENUM ('DASHBOARD_EXPLAIN', 'REPORT', 'RECOMMENDATION');

-- CreateTable
CREATE TABLE "AIInsightEmbedding" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "sourceType" "AIInsightSourceType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsightEmbedding_pkey" PRIMARY KEY ("id")
);


ALTER TABLE "AIInsightEmbedding" ADD COLUMN "embedding" vector(384) NOT NULL;

-- CreateIndex
CREATE INDEX "AIInsightEmbedding_companyId_idx" ON "AIInsightEmbedding"("companyId");
CREATE INDEX "AIInsightEmbedding_datasetId_idx" ON "AIInsightEmbedding"("datasetId");
CREATE INDEX "AIInsightEmbedding_embedding_idx" ON "AIInsightEmbedding"
USING hnsw ("embedding" vector_cosine_ops);

-- AddForeignKey
ALTER TABLE "AIInsightEmbedding" ADD CONSTRAINT "AIInsightEmbedding_datasetId_fkey"
FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;