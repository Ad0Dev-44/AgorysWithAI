import { InferenceClient } from "@huggingface/inference";

// Using Hugging Face's dedicated InferenceClient SDK, which routes feature-extraction (embedding) requests to the correct provider. The chat router does not serve embeddings.
const client = new InferenceClient(process.env.HF_API_KEY);

const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"; // 384 dimensions

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await client.featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text,
  });

  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0] as number[];
  }

  return result as number[];
}
