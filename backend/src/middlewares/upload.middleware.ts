import multer from "multer";

export const uploadCsv = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (_, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".csv")) {
      cb(new Error("INVALID_FILE_TYPE"));
      return;
    }

    cb(null, true);
  },
});