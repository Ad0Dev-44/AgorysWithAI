import { Request, Response } from "express";
import { explainDashboard, handleChat } from "../services/prompt.service";
import { generateReport } from "../services/report.service";
import { generateRecommendations } from "../services/recommendation.service";
import { modelConfig } from "../config/model";
import { AIResponse } from "../types/ai.types";

function wrapResponse(content: string): AIResponse {
  return {
    content,
    model: modelConfig.modelName,
    generatedAt: new Date().toISOString(),
  };
}

export async function chatHandler(req: Request, res: Response) {
  try {
    const content = await handleChat(req.body);
    res.json(wrapResponse(content));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chat generation failed" });
  }
}

export async function explainDashboardHandler(req: Request, res: Response) {
  try {
    const content = await explainDashboard(req.body);
    res.json(wrapResponse(content));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Dashboard explanation failed" });
  }
}

export async function reportHandler(req: Request, res: Response) {
  try {
    const content = await generateReport(req.body);
    res.json(wrapResponse(content));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Report generation failed" });
  }
}

export async function recommendationsHandler(req: Request, res: Response) {
  try {
    const content = await generateRecommendations(req.body);
    res.json(wrapResponse(content));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Recommendation generation failed" });
  }
}
