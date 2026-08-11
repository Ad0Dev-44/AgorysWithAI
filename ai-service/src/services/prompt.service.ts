import { generateCompletion } from "./llm.service";
import { buildDashboardExplainPrompt } from "../prompts/dashboard.prompt";
import { DashboardExplainRequest, ChatRequest } from "../types/ai.types";

export async function explainDashboard(data: DashboardExplainRequest): Promise<string> {
  const prompt = buildDashboardExplainPrompt(data);
  return generateCompletion(prompt);
}

export async function handleChat(data: ChatRequest): Promise<string> {
  const historyText =
    data.history?.map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n") || "";

  // Built directly against the real Metric[] / TrendPoint[] shapes —
  // no placeholder object shape to accidentally leave stale later.
  const contextBlock = data.kpis && data.kpis.length
    ? `\nBusiness context for reference:\nKey metrics:\n${data.kpis
        .map((k) => `- ${k.metricName}: ${k.metricValue}`)
        .join("\n")}${
        data.trend && data.trend.length
          ? `\nRecent revenue trend: ${data.trend
              .map((t) => `${t.month}: $${t.revenue.toLocaleString()}`)
              .join(", ")}`
          : ""
      }\n`
    : "";

  const retrievedBlock = data.retrievedContext && data.retrievedContext.length
    ? `\nRelevant past insights:\n${data.retrievedContext.map((c) => `- ${c}`).join("\n")}\n`
    : "";

  const prompt = `You are AGORYS AI, a business assistant. Answer the user's question clearly and concisely, using only the business context provided. If you don't have enough data to answer, say so honestly rather than guessing.
${contextBlock}${retrievedBlock}
${historyText ? `Conversation so far:\n${historyText}\n` : ""}
User: ${data.message}
Assistant:`;

  return generateCompletion(prompt);
}
