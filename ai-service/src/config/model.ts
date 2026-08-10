import "dotenv/config";

// Uses Hugging Face's ROUTER endpoint (router.huggingface.co) — an
// OpenAI-compatible Chat Completions API that proxies to whichever
// inference provider currently hosts the model. This is the correct
// endpoint from day one this time (the first build wasted a day on the
// older, now-deprecated raw api-inference.huggingface.co/models/{model}
// format before migrating to this one).
export const modelConfig = {
  provider: "huggingface" as const,
  modelName: process.env.AI_MODEL_NAME || "openai/gpt-oss-20b",
  apiUrl: process.env.AI_API_URL || "https://router.huggingface.co/v1/chat/completions",
  apiKey: process.env.HF_API_KEY || "",
  generation: {
    // 1500, not 512 — reasoning models (like gpt-oss) spend tokens on
    // internal chain-of-thought before writing the final answer. 512 was
    // too tight last time and caused truncated, unusable responses.
    maxTokens: 1500,
    temperature: 0.4, // lower = more grounded, less "creative" for business data
    topP: 0.9,
  },
};

if (!modelConfig.apiKey) {
  console.warn(
    "[ai-service] WARNING: HF_API_KEY is not set. Set it in ai-service/.env before starting the server."
  );
}
