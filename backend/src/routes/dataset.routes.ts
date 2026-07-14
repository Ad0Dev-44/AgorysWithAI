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

const router = Router();

router.get("/", listDatasetsHandler);

router.post("/upload", uploadCsv.single("file"), uploadDatasetHandler);

router.post("/:datasetId/mapping", saveMappingHandler);

router.get("/:datasetId", getDatasetHandler);

router.get("/:datasetId/preview", previewDatasetHandler);
router.get("/:datasetId/trends/revenue", revenueTrendHandler);
router.post(
  "/:datasetId/recommendations/generate",
  generateRecommendationsHandler,
);

router.delete("/:datasetId", deleteDatasetHandler);
router.post("/:datasetId/forecast/generate", generateForecastHandler);
export default router;
