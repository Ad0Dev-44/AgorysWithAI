import { Request, Response } from "express";
import { generateEmbedding } from "../services/embedding.service";

export async function embedHandler(req: Request, res: Response) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "text is required" });
      return;
    }

    const embedding = await generateEmbedding(text);
    res.json({ embedding, dimensions: embedding.length });
  } catch (err: any) {
    console.error("[embedding.controller] Failed:", err?.response?.data || err.message);
    res.status(500).json({ error: err.message || "Embedding generation failed" });
  }
}
