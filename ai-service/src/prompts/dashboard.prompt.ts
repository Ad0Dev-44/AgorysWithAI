import { DashboardExplainRequest } from "../types/ai.types";

export function buildDashboardExplainPrompt(data: DashboardExplainRequest): string {
  const { kpis, trend, insights, forecast } = data;

  const kpiList = kpis.map((k) => `- ${k.metricName}: ${k.metricValue}`).join("\n");
  const trendList = trend.map((t) => `${t.month}: $${t.revenue.toLocaleString()}`).join(", ");
  const forecastList = forecast
    .map((f) => `${f.forecastDate}: $${f.predictedValue.toLocaleString()}`)
    .join(", ");
  const insightsList = insights.length ? insights.join(" ") : "No notable month-over-month patterns detected.";

  return `You are a business analyst assistant for a small/medium enterprise.
Explain the following business performance data in clear, concise, plain-English language.
Do not invent numbers that are not given below. If data is missing, say so rather than guessing.

KEY METRICS:
${kpiList || "No metrics available."}

MONTHLY REVENUE TREND:
${trendList || "No trend data available."}

DETECTED PATTERNS:
${insightsList}

6-MONTH FORECAST:
${forecastList || "No forecast available."}

Write a short executive summary (3-5 sentences) explaining what this data means for the business owner, in plain language, with no jargon.`;
}
