import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  verifyAccessToken: vi.fn(),

  uploadDataset: vi.fn(),
  listDatasets: vi.fn(),
  getDataset: vi.fn(),
  previewDataset: vi.fn(),
  getRevenueTrend: vi.fn(),
  saveMapping: vi.fn(),
  deleteDataset: vi.fn(),
  generateForecastForDataset: vi.fn(),
  generateRecommendationsForDataset: vi.fn(),
}));

vi.mock("../utils/jwtHelper", () => ({
  verifyAccessToken: mocks.verifyAccessToken,
}));

vi.mock("../services/dataset.service", () => ({
  uploadDataset: mocks.uploadDataset,
  listDatasets: mocks.listDatasets,
  getDataset: mocks.getDataset,
  previewDataset: mocks.previewDataset,
  getRevenueTrend: mocks.getRevenueTrend,
  saveMapping: mocks.saveMapping,
  deleteDataset: mocks.deleteDataset,
  generateForecastForDataset: mocks.generateForecastForDataset,
  generateRecommendationsForDataset:
    mocks.generateRecommendationsForDataset,
}));

import datasetRoutes from "../routes/dataset.routes";
import { errorMiddleware } from "../middlewares/error.middleware";
import { ApiError } from "../utils/ApiError";

const app = express();

app.use(express.json());
app.use("/api/datasets", datasetRoutes);
app.use(errorMiddleware);

const DATASET_ID = "dataset-1";
const COMPANY_ID = "11111111-1111-4111-8111-111111111111";

describe("Dataset API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.verifyAccessToken.mockReturnValue({
      userId: "user-1",
      companyId: COMPANY_ID,
    });
  });

  describe("authentication", () => {
    it("rejects requests without an access token", async () => {
      const response = await request(app).get("/api/datasets");

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "UNAUTHORIZED",
        message: "Missing or invalid authorization header",
      });

      expect(mocks.listDatasets).not.toHaveBeenCalled();
    });

    it("rejects requests with an invalid access token", async () => {
      mocks.verifyAccessToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await request(app)
        .get("/api/datasets")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "UNAUTHORIZED",
        message: "Invalid or expired access token",
      });
    });
  });

  describe("POST /api/datasets/upload", () => {
    it("uploads a valid CSV file", async () => {
      mocks.uploadDataset.mockResolvedValue({
        datasetId: DATASET_ID,
        filename: "sales.csv",
        columns: ["date", "product", "revenue"],
      });

      const response = await request(app)
        .post("/api/datasets/upload")
        .set("Authorization", "Bearer valid-token")
        .attach(
          "file",
          Buffer.from(
            "date,product,revenue\n2025-01-01,Laptop,100",
          ),
          {
            filename: "sales.csv",
            contentType: "text/csv",
          },
        );

      expect(response.status).toBe(201);

      expect(response.body).toEqual({
        datasetId: DATASET_ID,
        filename: "sales.csv",
        columns: ["date", "product", "revenue"],
      });

      expect(mocks.uploadDataset).toHaveBeenCalledWith(
        expect.objectContaining({
          originalname: "sales.csv",
          buffer: expect.any(Buffer),
        }),
        COMPANY_ID,
      );
    });

    it("returns 422 when no CSV file is provided", async () => {
      const response = await request(app)
        .post("/api/datasets/upload")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(422);

      expect(response.body).toEqual({
        message: "CSV file is required",
      });

      expect(mocks.uploadDataset).not.toHaveBeenCalled();
    });

    it("rejects unsupported file types", async () => {
      const response = await request(app)
        .post("/api/datasets/upload")
        .set("Authorization", "Bearer valid-token")
        .attach("file", Buffer.from("not a CSV"), {
          filename: "document.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).toBe(422);

      expect(response.body).toEqual({
        success: false,
        code: "INVALID_FILE_TYPE",
        message: "Only CSV files are accepted",
      });

      expect(mocks.uploadDataset).not.toHaveBeenCalled();
    });

    it("returns 422 when the CSV content is invalid", async () => {
      mocks.uploadDataset.mockRejectedValue(
        new ApiError(
          "INVALID_CSV",
          "File could not be parsed as CSV",
          422,
        ),
      );

      const response = await request(app)
        .post("/api/datasets/upload")
        .set("Authorization", "Bearer valid-token")
        .attach("file", Buffer.from('"invalid,csv'), {
          filename: "invalid.csv",
          contentType: "text/csv",
        });

      expect(response.status).toBe(422);

      expect(response.body).toEqual({
        success: false,
        code: "INVALID_CSV",
        message: "File could not be parsed as CSV",
      });
    });
  });

  describe("GET /api/datasets", () => {
    it("returns datasets owned by the authenticated company", async () => {
      mocks.listDatasets.mockResolvedValue([
        {
          id: DATASET_ID,
          companyId: COMPANY_ID,
          filename: "sales.csv",
        },
      ]);

      const response = await request(app)
        .get("/api/datasets")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);

      expect(response.body).toEqual([
        {
          id: DATASET_ID,
          companyId: COMPANY_ID,
          filename: "sales.csv",
        },
      ]);

      expect(mocks.listDatasets).toHaveBeenCalledWith(COMPANY_ID);
    });
  });

  describe("GET /api/datasets/:datasetId/preview", () => {
    it("returns a dataset preview", async () => {
      mocks.previewDataset.mockResolvedValue([
        {
          date: "2025-01-01T00:00:00.000Z",
          product: "Laptop",
          revenue: "100",
        },
      ]);

      const response = await request(app)
        .get(`/api/datasets/${DATASET_ID}/preview`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);

      expect(mocks.previewDataset).toHaveBeenCalledWith(
        DATASET_ID,
        COMPANY_ID,
      );
    });
  });

  describe("GET /api/datasets/:datasetId/trends/revenue", () => {
    it("returns revenue trend analytics", async () => {
      mocks.getRevenueTrend.mockResolvedValue({
        trend: [
          {
            month: "2025-01",
            revenue: 100,
          },
          {
            month: "2025-02",
            revenue: 150,
          },
        ],
        insights: [
          "Revenue increased 50% from 2025-01 to 2025-02.",
        ],
      });

      const response = await request(app)
        .get(`/api/datasets/${DATASET_ID}/trends/revenue`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);

      expect(response.body.trend).toHaveLength(2);
      expect(response.body.insights).toHaveLength(1);

      expect(mocks.getRevenueTrend).toHaveBeenCalledWith(
        DATASET_ID,
        COMPANY_ID,
      );
    });
  });
});