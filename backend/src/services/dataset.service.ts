import { prisma } from "../lib/prisma";
import { generateForecast } from "../services/forecastEngine.service";
import { ApiError } from "../utils/ApiError";
import { generateRecommendations } from "../services/recommendationEngine.service";
import {
  computeKPIs,
  computeRevenueTrend,
  RevenueRecord,
} from "./kpiEngine.service.js";

import {
  validateCsvBuffer,
  extractHeaders,
  validateMapping,
  parseRows,
} from "./csvParser.service";

import {
  saveDatasetFile,
  deleteDatasetFile,
  readDatasetFile,
} from "./fileStorage.service";

import type { ColumnMapping } from "./csvParser.service";

const FORECAST_HORIZON_MONTHS = 6;

// =============================
// Upload Dataset
// =============================

export async function uploadDataset(
  file: {
    buffer: Buffer;
    originalname: string;
  },
  companyId: string,
) {
  validateCsvBuffer(file.buffer);

  const columns = extractHeaders(file.buffer);

  const dataset = await prisma.dataset.create({
    data: {
      companyId,
      filename: file.originalname,
    },
  });

  await saveDatasetFile(dataset.id, file.buffer);

  return {
    datasetId: dataset.id,
    filename: dataset.filename,
    columns,
  };
}

export async function generateForecastForDataset(
  datasetId: string,
  companyId: string,
) {
  await getOwnedDataset(datasetId, companyId);

  const records = await getRevenueRecords(datasetId);

  if (records.length === 0) {
    throw new Error("Dataset has no records yet. Save a column mapping first.");
  }

  const { trend } = computeRevenueTrend(records);
  const forecast = generateForecast(trend, FORECAST_HORIZON_MONTHS);

  await prisma.$transaction([
    prisma.forecast.deleteMany({
      where: {
        datasetId,
      },
    }),

    prisma.forecast.createMany({
      data: forecast.map((point) => ({
        datasetId,
        date: point.forecastDate,
        value: point.predictedValue,
      })),
    }),
  ]);

  return forecast;
}

export async function generateRecommendationsForDataset(
  datasetId: string,
  companyId: string,
  userId: string,
) {
  await getOwnedDataset(datasetId, companyId);

  const records = await getRevenueRecords(datasetId);

  if (records.length === 0) {
    throw new ApiError(
      "NO_DATA",
      "Dataset has no records yet. Save a column mapping first.",
      422,
    );
  }

  const kpis = computeKPIs(records);
  const { trend } = computeRevenueTrend(records);
  const forecast = generateForecast(trend, FORECAST_HORIZON_MONTHS);

  const messages = generateRecommendations(records, kpis, trend, forecast);

  await prisma.$transaction([
    prisma.recommendation.deleteMany({
      where: { datasetId },
    }),

    prisma.recommendation.createMany({
      data: messages.map((text) => ({
        datasetId,
        text,
      })),
    }),

    prisma.report.create({
      data: {
        userId,
        datasetId,
        reportType: "RECOMMENDATION",
      },
    }),
  ]);

  return messages;
}
async function getRevenueRecords(datasetId: string) {
  const records = await prisma.dataRecord.findMany({
    where: { datasetId },
    orderBy: { date: "asc" },
  });

  return records.map((record) => ({
    date: record.date,
    product: record.product,
    revenue: Number(record.revenue),
  }));
}
export async function getRevenueTrend(datasetId: string, companyId: string) {
  await getOwnedDataset(datasetId, companyId);


export async function saveMapping(
 datasetId:string,
 companyId:string,
 mapping:ColumnMapping,
){

 await getOwnedDataset(
   datasetId,
   companyId
 );


 const buffer =
 await readDatasetFile(datasetId);



 const headers =
 extractHeaders(buffer);



 validateMapping(
   headers,
   mapping
 );



 const {
   records,
   errors
 } =
 parseRows(
   buffer,
   mapping
 );



 if(records.length > 0){

  await prisma.$transaction([

    prisma.dataRecord.deleteMany({
      where:{
        datasetId,
      },
    }),

    prisma.dataRecord.createMany({

      data:records.map(record=>({

        datasetId,

        date:record.date,

        product:record.product,

        revenue:record.revenue,

      })),

    }),

  ]);

}



 return {

   recordsCreated:
      records.length,

   rowErrors:
      errors,

 };


  return { trend, insights };
}

export async function saveMapping(
  datasetId: string,
  companyId: string,
  mapping: ColumnMapping,
) {
  await getOwnedDataset(datasetId, companyId);

  const buffer = await readDatasetFile(datasetId);

  const headers = extractHeaders(buffer);

  validateMapping(headers, mapping);

  const { records, errors } = parseRows(buffer, mapping);

  if (records.length > 0) {
    await prisma.dataRecord.createMany({
      data: records.map((record) => ({
        datasetId,

        date: record.date,

        product: record.product,

        revenue: record.revenue,
      })),
    });
  }

  return {
    recordsCreated: records.length,

    rowErrors: errors,
  };
}

// =============================
// Get Owned Dataset
// =============================

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

// =============================
// List Datasets
// =============================

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

// =============================
// Get Dataset
// =============================

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

// =============================
// Preview Dataset
// =============================

export async function previewDataset(
  datasetId: string,
  companyId: string,
  limit = 20,
) {
  await getOwnedDataset(datasetId, companyId);

  const PREVIEW_ROW_LIMIT = 100;
  const FORECAST_HORIZON_MONTHS = 6;
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

// =============================
// Delete Dataset
// =============================

export async function deleteDataset(datasetId: string, companyId: string) {
  const dataset = await getOwnedDataset(datasetId, companyId);

  await deleteDatasetFile(dataset.id);

  await prisma.dataset.delete({
    where: {
      id: dataset.id,
    },
  });

  return {
    message: "Dataset deleted successfully",
  };
}
