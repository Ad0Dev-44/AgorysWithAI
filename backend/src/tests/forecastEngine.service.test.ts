import { describe, expect, it } from "vitest";

import { generateForecast } from "../services/forecastEngine.service";
import type { TrendPoint } from "../services/kpiEngine.service";

const toMonthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

describe("forecastEngine.service", () => {
  describe("generateForecast", () => {
    it("returns an empty array when the trend is empty", () => {
      expect(generateForecast([])).toEqual([]);
    });

    it("uses a flat forecast when only one month exists", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 250,
        },
      ];

      const result = generateForecast(trend, 3);

      expect(result.map((point) => ({
        month: toMonthKey(point.forecastDate),
        predictedValue: point.predictedValue,
      }))).toEqual([
        {
          month: "2025-02",
          predictedValue: 250,
        },
        {
          month: "2025-03",
          predictedValue: 250,
        },
        {
          month: "2025-04",
          predictedValue: 250,
        },
      ]);
    });

    it("generates an increasing linear forecast", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 100,
        },
        {
          month: "2025-02",
          revenue: 200,
        },
        {
          month: "2025-03",
          revenue: 300,
        },
      ];

      const result = generateForecast(trend, 3);

      expect(result.map((point) => ({
        month: toMonthKey(point.forecastDate),
        predictedValue: point.predictedValue,
      }))).toEqual([
        {
          month: "2025-04",
          predictedValue: 400,
        },
        {
          month: "2025-05",
          predictedValue: 500,
        },
        {
          month: "2025-06",
          predictedValue: 600,
        },
      ]);
    });

    it("generates a decreasing forecast without negative values", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 300,
        },
        {
          month: "2025-02",
          revenue: 200,
        },
        {
          month: "2025-03",
          revenue: 100,
        },
      ];

      const result = generateForecast(trend, 3);

      expect(result.map((point) => point.predictedValue)).toEqual([
        0,
        0,
        0,
      ]);
    });

    it("rounds forecast values to two decimal places", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 100,
        },
        {
          month: "2025-02",
          revenue: 133.33,
        },
      ];

      const result = generateForecast(trend, 2);

      expect(result.map((point) => point.predictedValue)).toEqual([
        166.66,
        199.99,
      ]);
    });

    it("uses six months as the default forecast horizon", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 100,
        },
      ];

      const result = generateForecast(trend);

      expect(result).toHaveLength(6);
      expect(toMonthKey(result[0].forecastDate)).toBe("2025-02");
      expect(toMonthKey(result[5].forecastDate)).toBe("2025-07");
    });

    it("returns no forecast points when the horizon is zero", () => {
      const trend: TrendPoint[] = [
        {
          month: "2025-01",
          revenue: 100,
        },
      ];

      expect(generateForecast(trend, 0)).toEqual([]);
    });
  });
});