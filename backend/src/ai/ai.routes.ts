import { Router } from "express";
import { explainDashboard, generateReport, getRecommendations, chat } from "./ai.controller";

const router = Router();

// requireAuth is applied once at the mount point in app.ts, not repeated here.
router.post("/dataset/:datasetId/explain", explainDashboard);
router.post("/dataset/:datasetId/report", generateReport);
router.post("/dataset/:datasetId/recommend", getRecommendations);
router.post("/chat", chat); // optionally include datasetId in the request body for grounded answers

export default router;
