import { Router } from "express";

import {
  deleteDatasetHandler,
  getDatasetHandler,
  listDatasetsHandler,
  previewDatasetHandler,
  uploadDatasetHandler,
  saveMappingHandler,
  generateForecastHandler,
  generateRecommendationsHandler,
  revenueTrendHandler,
} from "../controllers/dataset.controller";

import { uploadCsv } from "../middlewares/upload.middleware";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Protect all dataset routes
router.use(requireAuth);

router.get("/", listDatasetsHandler);

router.post(
  "/upload",
  uploadCsv.single("file"),
  uploadDatasetHandler,
);

router.post(
  "/:datasetId/mapping",
  saveMappingHandler,
);

router.get(
  "/:datasetId/preview",
  previewDatasetHandler,
);

router.get(
  "/:datasetId/trend",
  revenueTrendHandler,
);

router.post(
  "/:datasetId/recommendations/generate",
  generateRecommendationsHandler,
);

router.post(
  "/:datasetId/forecast/generate",
  generateForecastHandler,
);

router.get(
  "/:datasetId",
  getDatasetHandler,
);

router.delete(
  "/:datasetId",
  deleteDatasetHandler,
);

export default router;