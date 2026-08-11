import { generateCompletion } from "./llm.service";
import { buildReportPrompt } from "../prompts/report.prompt";
import { ReportRequest } from "../types/ai.types";

export async function generateReport(data: ReportRequest): Promise<string> {
  const prompt = buildReportPrompt(data);
  return generateCompletion(prompt);
}
