import { RecommendationRequest } from "../types/ai.types";

// AGORYS already has a deterministic recommendation engine that flags
// risks as plain strings. This prompt's job is NOT to invent new
// recommendations from scratch — it's to take those raw flags and turn
// them into clear, prioritized, natural-language advice.
export function buildRecommendationPrompt(data: RecommendationRequest): string {
  const { kpis, trend, rawRecommendations } = data;

  const kpiList = kpis.map((k) => `- ${k.metricName}: ${k.metricValue}`).join("\n");
  const trendList = trend.map((t) => `${t.month}: $${t.revenue.toLocaleString()}`).join(", ");
  const rawList = rawRecommendations.length
    ? rawRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "No system-flagged risks.";

  return `You are a business advisor. Below are system-generated risk flags based on the business's actual data, along with supporting KPIs and trend context.
Rewrite these into 3-5 clear, prioritized, actionable recommendations. Each one must stay grounded in the flag it came from — do not invent new risks or generic advice unrelated to the data below.

Key metrics:
${kpiList || "None reported."}

Monthly revenue trend: ${trendList || "None reported."}

System-flagged risks/recommendations:
${rawList}

Format your response as a numbered list. Each item: one sentence of recommendation, followed by one sentence explaining which data point motivates it.`;
}
