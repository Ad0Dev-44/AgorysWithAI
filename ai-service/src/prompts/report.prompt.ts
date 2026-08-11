import { ReportRequest } from "../types/ai.types";

export function buildReportPrompt(data: ReportRequest): string {
  const { kpis, trend, insights, forecast, reportTitle, rawRecommendations } = data;

  const kpiList = kpis.map((k) => `- ${k.metricName}: ${k.metricValue}`).join("\n");
  const trendList = trend.map((t) => `${t.month}: $${t.revenue.toLocaleString()}`).join(", ");
  const forecastList = forecast
    .map((f) => `${f.forecastDate}: $${f.predictedValue.toLocaleString()}`)
    .join(", ");
  const insightsList = insights.length ? insights.join(" ") : "No notable patterns detected.";
  const recommendationsList = rawRecommendations.length
    ? rawRecommendations.map((r) => `- ${r}`).join("\n")
    : "No specific recommendations generated.";

  return `You are writing an executive business report titled "${reportTitle || "Business Performance Report"}" based only on the data below.
Do not invent figures. Structure your output with these exact section headers:

## Overview
## Key Metrics
## Trend & Patterns
## Forecast Outlook
## Recommended Next Steps

DATA:
Key metrics:
${kpiList || "None reported."}

Monthly revenue trend: ${trendList || "None reported."}

Detected patterns: ${insightsList}

6-month forecast: ${forecastList || "None reported."}

Raw system-generated recommendations (rewrite these into clear, prioritized, natural-language advice — do not just copy them verbatim):
${recommendationsList}

Keep each section to 2-4 sentences. This text will be exported directly into a PDF/Excel report, so keep formatting clean and avoid conversational filler like "I hope this helps."`;
}
