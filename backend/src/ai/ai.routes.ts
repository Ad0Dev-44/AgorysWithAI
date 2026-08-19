import { Router } from "express";
import { explainDashboard, generateReport, getRecommendations, chat } from "./ai.controller";

const router = Router();

router.post("/dataset/:datasetId/explain", explainDashboard);
router.post("/dataset/:datasetId/report", generateReport);
router.post("/dataset/:datasetId/recommend", getRecommendations);
router.post("/chat", chat); 

export default router;
