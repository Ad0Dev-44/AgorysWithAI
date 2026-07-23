import { describe, expect, it } from "vitest";

import { generateRecommendations } from "../services/recommendationEngine.service";
import type {
  Metric,
  RevenueRecord,
  TrendPoint,
} from "../services/kpiEngine.service";
import type { ForecastPoint } from "../services/forecastEngine.service";

const noKpis: Metric[] = [];

describe("recommendationEngine.service", () => {
  describe("generateRecommendations", () => {
    it("returns an empty array when there is no data", () => {
      expect(generateRecommendations([], noKpis, [], [])).toEqual([]);
    });

    it("recommends reviewing pricing after three declining months", () => {
      const trend: TrendPoint[] = [
        { month: "2025-01", revenue: 400 },
        { month: "2025-02", revenue: 300 },
        { month: "2025-03", revenue: 200 },
        { month: "2025-04", revenue: 100 },
      ];

      const result = generateRecommendations([], noKpis, trend, []);

      expect(result).toContain(
        "Review pricing strategy and marketing efforts.",
      );
    });

    it("does not recommend pricing review for fewer than three declines", () => {
      const trend: TrendPoint[] = [
        { month: "2025-01", revenue: 300 },
        { month: "2025-02", revenue: 200 },
        { month: "2025-03", revenue: 100 },
      ];

      const result = generateRecommendations([], noKpis, trend, []);

      expect(result).not.toContain(
        "Review pricing strategy and marketing efforts.",
      );
    });

    it("recommends reducing dependency when one product exceeds 60 percent", () => {
      const records: RevenueRecord[] = [
        {
          date: new Date(2025, 0, 1),
          product: "Laptop",
          revenue: 700,
        },
        {
          date: new Date(2025, 0, 1),
          product: "Phone",
          revenue: 300,
        },
      ];

      const result = generateRecommendations(records, noKpis, [], []);

      expect(result).toEqual([
        "Reduce dependency on a single product line.",
      ]);
    });

    it("does not trigger concentration recommendation at exactly 60 percent", () => {
      const records: RevenueRecord[] = [
        {
          date: new Date(2025, 0, 1),
          product: "Laptop",
          revenue: 600,
        },
        {
          date: new Date(2025, 0, 1),
          product: "Phone",
          revenue: 400,
        },
      ];

      const result = generateRecommendations(records, noKpis, [], []);

      expect(result).not.toContain(
        "Reduce dependency on a single product line.",
      );
    });

    it("recommends preparing resources when forecast growth exceeds 20 percent", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 100,
        },
      ];

      const forecast: ForecastPoint[] = [
        {
          forecastDate: new Date(2025, 1, 1),
          predictedValue: 121,
        },
      ];

      const result = generateRecommendations(
        [],
        noKpis,
        trend,
        forecast,
      );

      expect(result).toContain(
        "Prepare inventory and staffing for increased demand.",
      );
    });

    it("does not trigger demand recommendation at exactly 20 percent growth", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 100,
        },
      ];

      const forecast: ForecastPoint[] = [
        {
          forecastDate: new Date(2025, 1, 1),
          predictedValue: 120,
        },
      ];

      const result = generateRecommendations(
        [],
        noKpis,
        trend,
        forecast,
      );

      expect(result).not.toContain(
        "Prepare inventory and staffing for increased demand.",
      );
    });

    it("recommends investigating acquisition when recent average declines", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 300,
        },
        {
          month: "2025-02",
          revenue: 300,
        },
        {
          month: "2025-03",
          revenue: 100,
        },
        {
          month: "2025-04",
          revenue: 100,
        },
      ];

      const result = generateRecommendations([], noKpis, trend, []);

      expect(result).toContain(
        "Investigate customer acquisition and retention.",
      );
    });

    it("does not investigate acquisition when recent average improves", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 100,
        },
        {
          month: "2025-02",
          revenue: 100,
        },
        {
          month: "2025-03",
          revenue: 300,
        },
        {
          month: "2025-04",
          revenue: 300,
        },
      ];

      const result = generateRecommendations([], noKpis, trend, []);

      expect(result).not.toContain(
        "Investigate customer acquisition and retention.",
      );
    });
  });
});