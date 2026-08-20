import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { requestEmbedding } from "./ai.service";

// Retrieval is scoped by companyId only — NOT datasetId. 
export async function retrieveRelevantInsights(
  companyId: string,
  queryText: string,
  k: number = 4
): Promise<string[]> {
  const queryEmbedding = await requestEmbedding(queryText);
  // Same raw-literal approach as the insert in embeddingStore.service.ts
  // Node-postgres doesn't know the vector type for parameter binding, so
  // the vector is injected as a raw SQL literal via Prisma.raw.
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const rows = await prisma.$queryRaw<{ content: string; distance: number }[]>`
    SELECT content, embedding <=> ${Prisma.raw(`'${vectorLiteral}'::vector(384)`)} AS distance
    FROM "AIInsightEmbedding"
    WHERE "companyId" = ${companyId}
    ORDER BY distance ASC
    LIMIT ${k}
  `;

  return rows.map((r) => r.content);
}
