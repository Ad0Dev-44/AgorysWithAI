import multer from "multer";
import { Request } from "express";
import { ApiError } from "../utils/ApiError.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) => {
  const isCsvMimeType =
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel";

  const isCsvExtension = file.originalname
    .toLowerCase()
    .endsWith(".csv");

  if (!isCsvMimeType && !isCsvExtension) {
    callback(
      new ApiError(
        "INVALID_FILE_TYPE",
        "Only CSV files are accepted",
        422
      )
    );
    return;
  }

  callback(null, true);
};


export const uploadCsv = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },

  fileFilter,
});