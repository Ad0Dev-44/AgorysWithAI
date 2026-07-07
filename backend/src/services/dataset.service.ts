import { unlink } from "node:fs/promises";
import path from "node:path";

import { prisma } from "../lib/prisma";

const CSV_UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

export async function getOwnedDataset(datasetId: string, companyId: string) {
  const dataset = await prisma.dataset.findFirst({
    where: {
      id: datasetId,
      companyId,
    },
  });

  if (!dataset) {
    throw new Error("DATASET_NOT_FOUND");
  }

  return dataset;
}

export async function listDatasets(companyId: string) {
  return prisma.dataset.findMany({
    where: {
      companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          dataRecords: true,
          kpis: true,
          forecasts: true,
          recommendations: true,
        },
      },
    },
  });
}

export async function getDataset(datasetId: string, companyId: string) {
  const dataset = await prisma.dataset.findFirst({
    where: {
      id: datasetId,
      companyId,
    },
    include: {
      _count: {
        select: {
          dataRecords: true,
          kpis: true,
          forecasts: true,
          recommendations: true,
        },
      },
    },
  });

  if (!dataset) {
    throw new Error("DATASET_NOT_FOUND");
  }

  return dataset;
}

export async function previewDataset(
  datasetId: string,
  companyId: string,
  limit = 20,
) {
  await getOwnedDataset(datasetId, companyId);

  const records = await prisma.dataRecord.findMany({
    where: {
      datasetId,
    },
    orderBy: {
      date: "asc",
    },
    take: limit,
  });

  return records.map((record) => ({
    ...record,
    revenue: record.revenue.toString(),
  }));
}

export async function deleteDataset(datasetId: string, companyId: string) {
  const dataset = await getOwnedDataset(datasetId, companyId);

  const csvPath = path.join(CSV_UPLOAD_DIR, dataset.filename);

  try {
    await unlink(csvPath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code !== "ENOENT") {
      throw error;
    }
  }

  await prisma.dataset.delete({
    where: {
      id: dataset.id,
    },
  });

  return {
    message: "Dataset deleted successfully",
  };
}
