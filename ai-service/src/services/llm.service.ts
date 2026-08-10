import axios from "axios";
import { modelConfig } from "../config/model";

// The ONLY file in the codebase that calls the LLM directly.
// Every other service builds a prompt and hands it here.

// Some models (notably reasoning-style models like gpt-oss) return content
// in slightly different shapes than a plain string. This handles every
// shape encountered during the first build, from day one this time.
function extractText(message: any): string {
  if (!message) return "";

  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((block: any) => (typeof block === "string" ? block : block?.text ?? ""))
      .join("")
      .trim();
  }

  if (typeof message.reasoning_content === "string") {
    return message.reasoning_content;
  }

  return "";
}

export async function generateCompletion(prompt: string): Promise<string> {
  let response;
  try {
    response = await axios.post(
      modelConfig.apiUrl,
      {
        model: modelConfig.modelName,
        messages: [{ role: "user", content: prompt }],
        max_tokens: modelConfig.generation.maxTokens,
        temperature: modelConfig.generation.temperature,
        top_p: modelConfig.generation.topP,
        // Keeps gpt-oss's internal reasoning scratchpad short, leaving more
        // of the token budget for the actual final answer.
        reasoning_effort: "low",
      },
      {
        headers: {
          Authorization: `Bearer ${modelConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30_000,
      }
    );
  } catch (err: any) {
    console.error("[llm.service] Request failed:", err?.response?.data || err.message);
    throw new Error("AI generation failed. Please try again.");
  }

  const choice = response.data?.choices?.[0];
  const text = extractText(choice?.message);

  if (!text) {
    console.error(
      "[llm.service] Empty text extracted. Full response:",
      JSON.stringify(response.data, null, 2)
    );
    throw new Error(
      `Model returned no usable text (finish_reason: ${choice?.finish_reason ?? "unknown"})`
    );
  }

  return text.trim();
}
