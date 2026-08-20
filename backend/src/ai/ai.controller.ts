import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  generateKpisForDataset,
  generateForecastForDataset,
  getRevenueTrend,
  generateRecommendationsForDataset,
} from "../services/dataset.service";
import {
  requestDashboardExplanation,
  requestReport,
  requestRecommendations,
  requestChat,
  requestEmbedding,
} from "./ai.service";
import { insertEmbedding } from "./embeddingStore.service";
import { retrieveRelevantInsights } from "./retrieval.service";

function getAuthContext(
  req: AuthenticatedRequest,
  res: Response
): { companyId: string; datasetId: string } | null {
  const companyId = req.user?.companyId;
  const rawDatasetId = req.params.datasetId;
  const datasetId = Array.isArray(rawDatasetId) ? rawDatasetId[0] : rawDatasetId;

  if (!companyId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  if (!datasetId) {
    res.status(400).json({ message: "Dataset id is required" });
    return null;
  }

  return { companyId, datasetId };
}

function captureInsightEmbedding(params: {
  companyId: string;
  datasetId: string;
  sourceType: "DASHBOARD_EXPLAIN" | "REPORT" | "RECOMMENDATION";
  content: string;
}) {
  requestEmbedding(params.content)
    .then((embedding) =>
      insertEmbedding({
        companyId: params.companyId,
        datasetId: params.datasetId,
        sourceType: params.sourceType,
        content: params.content,
        embedding,
      })
    )
    .catch((err) => {
      console.error("[ai.controller] Failed to capture insight embedding:", err.message || err);
    });
}

export async function explainDashboard(req: AuthenticatedRequest, res: Response) {
  const ctx = getAuthContext(req, res);
  if (!ctx) return;
  const { companyId, datasetId } = ctx;

  try {
    const [kpis, forecast, trendData] = await Promise.all([
      generateKpisForDataset(datasetId, companyId),
      generateForecastForDataset(datasetId, companyId),
      getRevenueTrend(datasetId, companyId),
    ]);

    const result = await requestDashboardExplanation({
      companyId,
      kpis,
      forecast,
      trend: trendData.trend,
      insights: trendData.insights,
    });

    res.json(result);

    captureInsightEmbedding({
      companyId,
      datasetId,
      sourceType: "DASHBOARD_EXPLAIN",
      content: result.content,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate dashboard explanation" });
  }
}

export async function generateReport(req: AuthenticatedRequest, res: Response) {
  const ctx = getAuthContext(req, res);
  if (!ctx) return;
  const { companyId, datasetId } = ctx;
  const userId = req.user!.userId;
  const { reportTitle } = req.body;

  try {
    const [kpis, forecast, trendData, rawRecommendations] = await Promise.all([
      generateKpisForDataset(datasetId, companyId),
      generateForecastForDataset(datasetId, companyId),
      getRevenueTrend(datasetId, companyId),
      generateRecommendationsForDataset(datasetId, companyId, userId),
    ]);

    const result = await requestReport({
      companyId,
      reportTitle,
      kpis,
      forecast,
      trend: trendData.trend,
      insights: trendData.insights,
      rawRecommendations,
    });

    res.json(result);

    captureInsightEmbedding({
      companyId,
      datasetId,
      sourceType: "REPORT",
      content: result.content,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate report" });
  }
}

export async function getRecommendations(req: AuthenticatedRequest, res: Response) {
  const ctx = getAuthContext(req, res);
  if (!ctx) return;
  const { companyId, datasetId } = ctx;
  const userId = req.user!.userId;

  try {
    const [kpis, trendData, rawRecommendations] = await Promise.all([
      generateKpisForDataset(datasetId, companyId),
      getRevenueTrend(datasetId, companyId),
      generateRecommendationsForDataset(datasetId, companyId, userId),
    ]);

    const result = await requestRecommendations({
      companyId,
      kpis,
      trend: trendData.trend,
      rawRecommendations,
    });

    res.json(result);

    captureInsightEmbedding({
      companyId,
      datasetId,
      sourceType: "RECOMMENDATION",
      content: result.content,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate recommendations" });
  }
}

// Chat is intentionally NOT captured into AIInsightEmbedding — it's
// conversational, not a durable "insight" the way an explanation, report,
// or recommendation set is. It's also the CONSUMER of retrieved context
// starting Day 8, not a producer of it.
export async function chat(req: AuthenticatedRequest, res: Response) {
  const companyId = req.user?.companyId;
  if (!companyId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const { message, history, datasetId } = req.body;
    let kpis, trend;

    if (datasetId) {
      const [kpiData, trendData] = await Promise.all([
        generateKpisForDataset(datasetId, companyId),
        getRevenueTrend(datasetId, companyId),
      ]);
      kpis = kpiData;
      trend = trendData.trend;
    }

    // Retrieve relevant past insights across ALL of this company's datasets,
    // giving the assistant continuity beyond just the current dataset.
   
    let retrievedContext: string[] = [];
    try {
      retrievedContext = await retrieveRelevantInsights(companyId, message, 4);
    } catch (err: any) {
      console.error("[ai.controller] Retrieval failed, continuing without it:", err.message || err);
    }

    const result = await requestChat({
      companyId,
      message,
      history,
      kpis,
      trend,
      retrievedContext,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chat failed" });
  }
}
