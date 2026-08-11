import { generateCompletion } from "./llm.service";
import { buildRecommendationPrompt } from "../prompts/recommendation.prompt";
import { RecommendationRequest } from "../types/ai.types";

export async function generateRecommendations(data: RecommendationRequest): Promise<string> {
  const prompt = buildRecommendationPrompt(data);
  return generateCompletion(prompt);
}
