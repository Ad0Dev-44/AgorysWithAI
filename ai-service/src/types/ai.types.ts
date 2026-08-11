// These shapes mirror AGORYS's real data model, returned by
// backend/src/services/dataset.service.ts and kpiEngine.service.ts.
// Keep these in sync if those files change.

export interface Metric {
  metricName: string;
  metricValue: number;
}

export interface TrendPoint {
  month: string; // "2025-01"
  revenue: number;
}

export interface ForecastPoint {
  forecastDate: string; // ISO date string over JSON
  predictedValue: number;
}

// Payload for POST /dashboard/explain
export interface DashboardExplainRequest {
  companyId: string;
  kpis: Metric[];
  trend: TrendPoint[];
  insights: string[]; // from getRevenueTrend()'s non-AI generated insights
  forecast: ForecastPoint[];
}

// Payload for POST /report
export interface ReportRequest extends DashboardExplainRequest {
  reportTitle?: string;
  rawRecommendations: string[]; // plain-text messages from generateRecommendationsForDataset
}

// Payload for POST /recommendations
// The AI's job is to turn already-generated raw recommendation strings into
// prioritized, natural-language advice — not to invent new ones from nothing.
export interface RecommendationRequest {
  companyId: string;
  kpis: Metric[];
  trend: TrendPoint[];
  rawRecommendations: string[];
}

// Payload for POST /chat
export interface ChatRequest {
  companyId: string;
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
  kpis?: Metric[];
  trend?: TrendPoint[];
  retrievedContext?: string[]; // populated once RAG is added (Day 8)
}

// Standard response shape returned by every AI endpoint
export interface AIResponse {
  content: string;
  model: string;
  generatedAt: string;
}
