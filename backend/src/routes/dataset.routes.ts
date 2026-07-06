import { Router } from "express";

import {
  deleteDatasetHandler,
  getDatasetHandler,
  listDatasetsHandler,
  previewDatasetHandler,
} from "../controllers/dataset.controller";

const router = Router();

router.get("/", listDatasetsHandler);
router.get("/:datasetId", getDatasetHandler);
router.get("/:datasetId/preview", previewDatasetHandler);
router.delete("/:datasetId", deleteDatasetHandler);

export default router;
