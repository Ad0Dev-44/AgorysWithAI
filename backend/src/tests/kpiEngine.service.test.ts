import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeRevenueTrend,
  countTrailingDecliningMonths,
  getTopProductShare,
  type RevenueRecord,
} from "../services/kpiEngine.service";

const createDate = (year: number, month: number, day = 1): Date =>
  new Date(year, month - 1, day);

describe("kpiEngine.service", () => {
  describe("computeKPIs", () => {
    it("returns an empty array when records are empty", () => {
      expect(computeKPIs([])).toEqual([]);
    });

    it("calculates KPI values correctly", () => {
      const records: RevenueRecord[] = [
        {
          date: createDate(2025, 1),
          product: "Laptop",
          revenue: 100,
        },
        {
          date: createDate(2025, 1),
          product: "Laptop",
          revenue: 200,
        },
        {
          date: createDate(2025, 2),
          product: "Phone",
          revenue: 450,
        },
      ];

      expect(computeKPIs(records)).toEqual([
        {
          metricName: "Total Revenue",
          metricValue: 750,
        },
        {
          metricName: "Average Revenue",
          metricValue: 250,
        },
        {
          metricName: "Highest Revenue Product",
          metricValue: 450,
        },
        {
          metricName: "Lowest Revenue Product",
          metricValue: 300,
        },
        {
          metricName: "Total Transactions",
          metricValue: 3,
        },
        {
          metricName: "Revenue Growth %",
          metricValue: 50,
        },
      ]);
    });
  });

  describe("computeRevenueTrend", () => {
    it("groups records by month and sorts them", () => {
      const records: RevenueRecord[] = [
        {
          date: createDate(2025, 2),
          revenue: 200,
        },
        {
          date: createDate(2025, 1),
          revenue: 100,
        },
        {
          date: createDate(2025, 1, 15),
          revenue: 50,
        },
      ];

      const result = computeRevenueTrend(records);

      expect(result.trend).toEqual([
        {
          month: "2025-01",
          revenue: 150,
        },
        {
          month: "2025-02",
          revenue: 200,
        },
      ]);
    });

    it("creates revenue increase and decrease insights", () => {
      const records: RevenueRecord[] = [
        {
          date: createDate(2025, 1),
          revenue: 100,
        },
        {
          date: createDate(2025, 2),
          revenue: 150,
        },
        {
          date: createDate(2025, 3),
          revenue: 120,
        },
      ];

      const result = computeRevenueTrend(records);

      expect(result.insights).toContain(
        "Revenue increased 50% from 2025-01 to 2025-02.",
      );

      expect(result.insights).toContain(
        "Revenue decreased 20% from 2025-02 to 2025-03.",
      );
    });
  });

  describe("countTrailingDecliningMonths", () => {
    it("counts consecutive declining months from the end", () => {
      const result = countTrailingDecliningMonths([
        {
          month: "2025-01",
          revenue: 400,
        },
        {
          month: "2025-02",
          revenue: 300,
        },
        {
          month: "2025-03",
          revenue: 200,
        },
        {
          month: "2025-04",
          revenue: 100,
        },
      ]);

      expect(result).toBe(3);
    });

    it("returns zero when revenue is increasing", () => {
      const result = countTrailingDecliningMonths([
        {
          month: "2025-01",
          revenue: 100,
        },
        {
          month: "2025-02",
          revenue: 200,
        },
      ]);

      expect(result).toBe(0);
    });
  });

  describe("getTopProductShare", () => {
    it("returns the product with the highest revenue share", () => {
      const records: RevenueRecord[] = [
        {
          date: createDate(2025, 1),
          product: "Laptop",
          revenue: 600,
        },
        {
          date: createDate(2025, 1),
          product: "Phone",
          revenue: 400,
        },
      ];

      expect(getTopProductShare(records)).toEqual({
        product: "Laptop",
        share: 60,
      });
    });

    it("returns null when records are empty", () => {
      expect(getTopProductShare([])).toBeNull();
    });

    it("returns null when total revenue is zero", () => {
      const records: RevenueRecord[] = [
        {
          date: createDate(2025, 1),
          product: "Laptop",
          revenue: 0,
        },
      ];

      expect(getTopProductShare(records)).toBeNull();
    });
  });
});