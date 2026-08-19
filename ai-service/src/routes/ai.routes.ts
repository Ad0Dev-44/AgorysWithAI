import { Router } from "express";
import {
  chatHandler,
  explainDashboardHandler,
  reportHandler,
  recommendationsHandler,
} from "../controllers/ai.controller";
import { embedHandler } from "../controllers/embedding.controller";

const router = Router();

router.post("/chat", chatHandler);
router.post("/dashboard/explain", explainDashboardHandler);
router.post("/report", reportHandler);
router.post("/recommendations", recommendationsHandler);
router.post("/embed", embedHandler);

export default router;
