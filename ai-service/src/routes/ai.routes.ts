import { Router } from "express";
import {
  chatHandler,
  explainDashboardHandler,
  reportHandler,
  recommendationsHandler,
} from "../controllers/ai.controller";

const router = Router();

router.post("/chat", chatHandler);
router.post("/dashboard/explain", explainDashboardHandler);
router.post("/report", reportHandler);
router.post("/recommendations", recommendationsHandler);

export default router;
