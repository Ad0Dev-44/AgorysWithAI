import { parse } from "csv-parse/sync";
import { ApiError } from "../utils/ApiError.js";

export interface ColumnMapping {
  dateColumn: string;
  productColumn: string;
  revenueColumn: string;
}

export interface ParsedRecord {
  date: Date;
  product: string;
  revenue: number;
}

export interface RowError {
  rowIndex: number;
  reason: string;
}

export interface ParseResult {
  records: ParsedRecord[];
  errors: RowError[];
}

export const validateCsvBuffer = (buffer: Buffer): void => {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(
      "EMPTY_FILE",
      "Uploaded file is empty",
      422
    );
  }

  try {
    const rows = parse(buffer, {
      columns: false,
      skip_empty_lines: true,
    });

    if (!rows || rows.length === 0) {
      throw new ApiError(
        "EMPTY_FILE",
        "CSV file contains no rows",
        422
      );
    }

  } catch {
    throw new ApiError(
      "INVALID_CSV",
      "File could not be parsed as CSV",
      422
    );
  }
};

export const extractHeaders = (buffer: Buffer): string[] => {
  const rows: string[][] = parse(buffer, {
    columns: false,
    skip_empty_lines: true,
    to_line: 1,
  });

  if (rows.length === 0) {
    throw new ApiError(
      "EMPTY_FILE",
      "CSV file has no header row",
      422
    );
  }

  return rows[0].map((header) => header.trim());
};


export const validateMapping = (
  headers: string[],
  mapping: ColumnMapping
): void => {

  const missing = Object.values(mapping)
    .filter((column) => !headers.includes(column));


  if (missing.length > 0) {
    throw new ApiError(
      "INVALID_MAPPING",
      `Mapped column(s) not found in CSV: ${missing.join(", ")}`,
      422
    );
  }
};


export const parseRows = (
  buffer: Buffer,
  mapping: ColumnMapping
): ParseResult => {

  const rows: Record<string, string>[] = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });


  const records: ParsedRecord[] = [];
  const errors: RowError[] = [];


  rows.forEach((row, index) => {

    const rawDate = row[mapping.dateColumn];
    const rawProduct = row[mapping.productColumn];
    const rawRevenue = row[mapping.revenueColumn];


    if (
      !rawDate ||
      !rawProduct ||
      rawRevenue === undefined ||
      rawRevenue === ""
    ) {
      errors.push({
        rowIndex: index,
        reason: "Missing required field",
      });

      return;
    }


    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      errors.push({
        rowIndex: index,
        reason: `Invalid date: "${rawDate}"`,
      });

      return;
    }


    const revenue = Number(
      String(rawRevenue).replace(/[,$]/g, "")
    );


    if (Number.isNaN(revenue)) {
      errors.push({
        rowIndex: index,
        reason: `Revenue not numeric: "${rawRevenue}"`,
      });

      return;
    }


    records.push({
      date,
      product: rawProduct.trim(),
      revenue,
    });

  });


  return {
    records,
    errors,
  };
};