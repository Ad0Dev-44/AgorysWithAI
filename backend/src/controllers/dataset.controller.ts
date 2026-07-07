import { Request, Response } from "express";

import {
  deleteDataset,
  getDataset,
  listDatasets,
  previewDataset,
} from "../services/dataset.service";

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    companyId?: string | null;
  };
};

function getCompanyId(req: AuthenticatedRequest, res: Response) {
  const companyId = req.user?.companyId;

  if (!companyId) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return null;
  }

  return companyId;
}

function getDatasetId(req: AuthenticatedRequest, res: Response) {
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

function handleDatasetError(error: unknown, res: Response) {
  if (error instanceof Error && error.message === "DATASET_NOT_FOUND") {
    return res.status(404).json({
      message: "Dataset not found",
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error",
  });
}

export async function listDatasetsHandler(
  req: AuthenticatedRequest,
  res: Response,
) {
  const companyId = getCompanyId(req, res);

  if (!companyId) {
    return;
  }

  try {
    const datasets = await listDatasets(companyId);

    return res.json(datasets);
  } catch (error) {
    return handleDatasetError(error, res);
  }
}

export async function getDatasetHandler(
  req: AuthenticatedRequest,
  res: Response,
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
    const dataset = await getDataset(datasetId, companyId);

    return res.json(dataset);
  } catch (error) {
    return handleDatasetError(error, res);
  }
}

export async function previewDatasetHandler(
  req: AuthenticatedRequest,
  res: Response,
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
    const preview = await previewDataset(datasetId, companyId);

    return res.json(preview);
  } catch (error) {
    return handleDatasetError(error, res);
  }
}

export async function deleteDatasetHandler(
  req: AuthenticatedRequest,
  res: Response,
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
    const result = await deleteDataset(datasetId, companyId);

    return res.json(result);
  } catch (error) {
    return handleDatasetError(error, res);
  }
}
