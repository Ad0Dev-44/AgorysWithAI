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
} from "./ai.service";

// Every AI feature is scoped to a specific dataset — datasetId comes from
// the route param, companyId from the auth token.

function getAuthContext(
  req: AuthenticatedRequest,
  res: Response
): { companyId: string; datasetId: string } | null {
  const companyId = req.user?.companyId;

  // req.params values can come back as string | string[] | undefined
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
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate recommendations" });
  }
}

// Chat is not dataset-scoped in the route — a user might ask a general
// question. If a datasetId is included in the body, KPI/trend context is
// attached for a grounded answer.
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

    const result = await requestChat({ companyId, message, history, kpis, trend });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chat failed" });
  }
}
