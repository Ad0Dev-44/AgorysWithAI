import { unlink, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { parse } from "csv-parse/sync";

import { prisma } from "../lib/prisma";

const CSV_UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "datasets",
);


// =============================
// CSV Helpers
// =============================

function validateCsvBuffer(buffer: Buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error("EMPTY_FILE");
  }

  const content = buffer.toString("utf8").trim();

  if (!content) {
    throw new Error("EMPTY_FILE");
  }
}


function extractHeaders(buffer: Buffer): string[] {
  const records = parse(
    buffer.toString("utf8"),
    {
      columns: true,
      skip_empty_lines: true,
    }
  ) as Record<string, string>[];


  if (!records.length) {
    throw new Error("EMPTY_FILE");
  }


  return Object.keys(records[0]);
}


async function saveCsvFile(
  buffer: Buffer,
  filename: string,
) {
  await mkdir(CSV_UPLOAD_DIR, {
    recursive: true,
  });


  const filePath = path.join(
    CSV_UPLOAD_DIR,
    filename,
  );


  await writeFile(
    filePath,
    buffer,
  );


  return filePath;
}


// =============================
// Upload Dataset
// =============================

export async function uploadDataset(
  file: Express.Multer.File,
  companyId: string,
) {
  validateCsvBuffer(file.buffer);


  const columns = extractHeaders(
    file.buffer,
  );


  const storedFilename =
    `${crypto.randomUUID()}-${file.originalname}`;


  await saveCsvFile(
    file.buffer,
    storedFilename,
  );


  const dataset = await prisma.dataset.create({
    data: {
      companyId,

      // Prisma Dataset only has filename
      filename: storedFilename,
    },
  });


  return {
    datasetId: dataset.id,
    filename: file.originalname,
    columns,
  };
}


// =============================
// Existing Dataset Functions
// =============================

export async function getOwnedDataset(
  datasetId: string,
  companyId: string,
) {
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


export async function getDataset(
  datasetId: string,
  companyId: string,
) {
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


export async function deleteDataset(
  datasetId: string,
  companyId: string,
) {
  const dataset = await getOwnedDataset(
    datasetId,
    companyId,
  );


  const csvPath = path.join(
    CSV_UPLOAD_DIR,
    dataset.filename,
  );


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