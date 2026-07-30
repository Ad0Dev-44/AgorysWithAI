import { Router } from "express";

import {
  deleteDatasetHandler,
  getDatasetHandler,
  listDatasetsHandler,
  previewDatasetHandler,
  uploadDatasetHandler,
  saveMappingHandler,
  generateForecastHandler,
  generateKpisHandler,
  generateRecommendationsHandler,
  generateReportHandler,
  revenueTrendHandler,
  exportReportHandler,
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
  "/:datasetId/trends/revenue",
  revenueTrendHandler,
);

router.post(
  "/:datasetId/kpis/generate",
  generateKpisHandler,
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

router.post(
  "/:datasetId/report/generate",
  generateReportHandler,
);

router.get(
  "/:datasetId/report/export",
  exportReportHandler,
);

export default router;