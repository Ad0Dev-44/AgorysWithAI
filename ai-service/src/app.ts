import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "ai-service" }));

// Routes for /chat, /dashboard/explain, /report, /recommendations
// get added here on Day 2, once prompts and controllers exist.

export default app;
