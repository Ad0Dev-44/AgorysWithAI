import { Request, Response, NextFunction } from "express";

import {
  deleteDataset,
  getDataset,
  listDatasets,
  previewDataset,
  uploadDataset,
  saveMapping,
  generateForecastForDataset,
  getRevenueTrend,
  generateRecommendationsForDataset,
} from "../services/dataset.service";

function getCompanyId(req: Request, res: Response): string | null {
  const companyId = req.user?.companyId;

  if (!companyId) {
    res.status(401).json({
      message: "Unauthorized",
    });

    return null;
  }

  return companyId;
}

function getDatasetId(req: Request, res: Response): string | null {
  const rawDatasetId = req.params.datasetId;

  const datasetId = Array.isArray(rawDatasetId)
    ? rawDatasetId[0]
    : rawDatasetId;

  if (!datasetId) {
    res.status(400).json({
      message: "Dataset id is required",
    });

    return null;
  }

  return datasetId;
}

function handleDatasetError(error: unknown, res: Response): void {
  if (error instanceof Error && error.message === "DATASET_NOT_FOUND") {
    res.status(404).json({
      message: "Dataset not found",
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Internal server error",
  });
}

export async function listDatasetsHandler(req: Request, res: Response) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  try {
    const datasets = await listDatasets(companyId);

    res.json(datasets);
  } catch (error) {
    handleDatasetError(error, res);
  }
}

export async function getDatasetHandler(req: Request, res: Response) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  const datasetId = getDatasetId(req, res);

  if (!datasetId) {
    return;
  }

  try {
    const dataset = await getDataset(datasetId, companyId);

    res.json(dataset);
  } catch (error) {
    handleDatasetError(error, res);
  }
}

export async function previewDatasetHandler(req: Request, res: Response) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  const datasetId = getDatasetId(req, res);

  if (!datasetId) {
    return;
  }

  try {
    const preview = await previewDataset(datasetId, companyId);

    res.json(preview);
  } catch (error) {
    handleDatasetError(error, res);
  }
}

export async function deleteDatasetHandler(req: Request, res: Response) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  const datasetId = getDatasetId(req, res);

  if (!datasetId) {
    return;
  }

  try {
    const result = await deleteDataset(datasetId, companyId);

    res.json(result);
  } catch (error) {
    handleDatasetError(error, res);
  }
}

export async function uploadDatasetHandler(req: Request, res: Response) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  if (!req.file) {
    res.status(422).json({
      message: "CSV file is required",
    });

    return;
  }

  try {
    const dataset = await uploadDataset(
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
      },
      companyId,
    );

    res.status(201).json(dataset);
  } catch (error) {
    handleDatasetError(error, res);
  }
}

export async function saveMappingHandler(req: Request, res: Response) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  const datasetId = getDatasetId(req, res);

  if (!datasetId) {
    return;
  }

  try {
    const result = await saveMapping(datasetId, companyId, req.body);

    res.json(result);
  } catch (error) {
    handleDatasetError(error, res);
  }
}

export async function generateForecastHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  const datasetId = getDatasetId(req, res);

  if (!datasetId) {
    return;
  }

  try {
    const result = await generateForecastForDataset(
      datasetId,
      companyId,
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}
export async function revenueTrendHandler(req: Request, res: Response) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  const datasetId = getDatasetId(req, res);

  if (!datasetId) {
    return;
  }

  try {
    const result = await getRevenueTrend(datasetId, companyId);

    res.json(result);
  } catch (error) {
    handleDatasetError(error, res);
  }
}
export async function generateRecommendationsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  const datasetId = getDatasetId(req, res);

  if (!datasetId) {
    return;
  }

  try {
    const result = await generateRecommendationsForDataset(
      datasetId,
      companyId,
      req.user!.userId,
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}
