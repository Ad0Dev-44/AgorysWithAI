import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export type AIInsightSourceType = "DASHBOARD_EXPLAIN" | "REPORT" | "RECOMMENDATION";

// The `embedding` column is a pgvector type, which Prisma's schema DSL
export async function insertEmbedding(params: {
  companyId: string;
  datasetId: string;
  sourceType: AIInsightSourceType;
  content: string;
  embedding: number[];
}) {
  const id = randomUUID();
  const vectorLiteral = `[${params.embedding.join(",")}]`;

  await prisma.$executeRaw`
    INSERT INTO "AIInsightEmbedding" (id, "companyId", "datasetId", "sourceType", content, embedding, "createdAt")
    VALUES (
      ${id},
      ${params.companyId},
      ${params.datasetId},
      ${params.sourceType}::"AIInsightSourceType",
      ${params.content},
      ${Prisma.raw(`'${vectorLiteral}'::vector(384)`)},
      now()
    )
  `;
}
