import { Router } from "express";

import {
  deleteDatasetHandler,
  getDatasetHandler,
  listDatasetsHandler,
  previewDatasetHandler,
  uploadDatasetHandler,
} from "../controllers/dataset.controller";

import { uploadCsv } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", listDatasetsHandler);

router.post(
  "/upload",
  uploadCsv.single("file"),
  uploadDatasetHandler
);

router.get("/:datasetId", getDatasetHandler);
router.get("/:datasetId/preview", previewDatasetHandler);
router.delete("/:datasetId", deleteDatasetHandler);

export default router;