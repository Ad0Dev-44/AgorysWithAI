import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" })); // KPI/report payloads can get sizable with product lists

app.get("/health", (_req, res) => res.json({ status: "ok", service: "ai-service" }));

app.use("/", aiRoutes);

export default app;
