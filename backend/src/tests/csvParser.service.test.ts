import { describe, expect, it } from "vitest";

import {
  extractHeaders,
  parseRows,
  validateCsvBuffer,
  validateMapping,
  type ColumnMapping,
} from "../services/csvParser.service";

const mapping: ColumnMapping = {
  dateColumn: "date",
  productColumn: "product",
  revenueColumn: "revenue",
};

describe("csvParser.service", () => {
  describe("validateCsvBuffer", () => {
    it("accepts a valid CSV file", () => {
      const buffer = Buffer.from(
        "date,product,revenue\n2025-01-01,Laptop,100",
      );

      expect(() => validateCsvBuffer(buffer)).not.toThrow();
    });

    it("throws when the uploaded file is empty", () => {
      expect(() => validateCsvBuffer(Buffer.alloc(0))).toThrow(
        "Uploaded file is empty",
      );
    });

    it("throws when the CSV contains no rows", () => {
      const buffer = Buffer.from("\n\n");

      expect(() => validateCsvBuffer(buffer)).toThrow(
        "CSV file contains no rows",
      );
    });

    it("throws when the CSV cannot be parsed", () => {
      const buffer = Buffer.from(
        'date,product,revenue\n"2025-01-01,Laptop,100',
      );

      expect(() => validateCsvBuffer(buffer)).toThrow(
        "File could not be parsed as CSV",
      );
    });
  });

  describe("extractHeaders", () => {
    it("extracts and trims CSV headers", () => {
      const buffer = Buffer.from(
        " date , product , revenue \n2025-01-01,Laptop,100",
      );

      expect(extractHeaders(buffer)).toEqual([
        "date",
        "product",
        "revenue",
      ]);
    });

    it("throws when there is no header row", () => {
      expect(() => extractHeaders(Buffer.from(""))).toThrow(
        "CSV file has no header row",
      );
    });
  });

  describe("validateMapping", () => {
    it("accepts mapping when all columns exist", () => {
      expect(() =>
        validateMapping(
          ["date", "product", "revenue"],
          mapping,
        ),
      ).not.toThrow();
    });

    it("throws when mapped columns do not exist", () => {
      const invalidMapping: ColumnMapping = {
        dateColumn: "orderDate",
        productColumn: "product",
        revenueColumn: "amount",
      };

      expect(() =>
        validateMapping(
          ["date", "product", "revenue"],
          invalidMapping,
        ),
      ).toThrow(
        "Mapped column(s) not found in CSV: orderDate, amount",
      );
    });
  });

  describe("parseRows", () => {
    it("parses valid CSV rows", () => {
      const buffer = Buffer.from(
        [
          "date,product,revenue",
          "2025-01-01,Laptop,100",
          '2025-02-01,Phone,"$1,200.50"',
        ].join("\n"),
      );

      const result = parseRows(buffer, mapping);

      expect(result.errors).toEqual([]);
      expect(result.records).toHaveLength(2);

      expect(result.records[0]).toMatchObject({
        product: "Laptop",
        revenue: 100,
      });

      expect(result.records[0].date).toBeInstanceOf(Date);

      expect(result.records[1]).toMatchObject({
        product: "Phone",
        revenue: 1200.5,
      });
    });

    it("reports rows with missing required fields", () => {
      const buffer = Buffer.from(
        [
          "date,product,revenue",
          "2025-01-01,,100",
        ].join("\n"),
      );

      const result = parseRows(buffer, mapping);

      expect(result.records).toEqual([]);
      expect(result.errors).toEqual([
        {
          rowIndex: 2,
          reason: "Missing required field",
        },
      ]);
    });

    it("reports invalid dates", () => {
      const buffer = Buffer.from(
        [
          "date,product,revenue",
          "invalid-date,Laptop,100",
        ].join("\n"),
      );

      const result = parseRows(buffer, mapping);

      expect(result.records).toEqual([]);
      expect(result.errors).toEqual([
        {
          rowIndex: 2,
          reason: 'Invalid date: "invalid-date"',
        },
      ]);
    });

    it("reports non-numeric revenue", () => {
      const buffer = Buffer.from(
        [
          "date,product,revenue",
          "2025-01-01,Laptop,abc",
        ].join("\n"),
      );

      const result = parseRows(buffer, mapping);

      expect(result.records).toEqual([]);
      expect(result.errors).toEqual([
        {
          rowIndex: 2,
          reason: 'Revenue not numeric: "abc"',
        },
      ]);
    });

    it("reports negative revenue", () => {
      const buffer = Buffer.from(
        [
          "date,product,revenue",
          "2025-01-01,Laptop,-100",
        ].join("\n"),
      );

      const result = parseRows(buffer, mapping);

      expect(result.records).toEqual([]);
      expect(result.errors).toEqual([
        {
          rowIndex: 2,
          reason: "Revenue cannot be negative",
        },
      ]);
    });

    it("keeps valid rows and reports invalid rows together", () => {
      const buffer = Buffer.from(
        [
          "date,product,revenue",
          "2025-01-01,Laptop,100",
          "invalid-date,Phone,200",
          "2025-03-01,Tablet,-50",
        ].join("\n"),
      );

      const result = parseRows(buffer, mapping);

      expect(result.records).toHaveLength(1);
      expect(result.records[0].product).toBe("Laptop");

      expect(result.errors).toEqual([
        {
          rowIndex: 3,
          reason: 'Invalid date: "invalid-date"',
        },
        {
          rowIndex: 4,
          reason: "Revenue cannot be negative",
        },
      ]);
    });
  });
});