import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "datasets"
);


const ensureUploadDir = async (): Promise<void> => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};


const filePathFor = (datasetId: string): string => {
  return path.join(
    UPLOAD_DIR,
    `${datasetId}.csv`
  );
};


export const saveDatasetFile = async (
  datasetId: string,
  buffer: Buffer
): Promise<void> => {

  await ensureUploadDir();

  await fs.writeFile(
    filePathFor(datasetId),
    buffer
  );
};


export const readDatasetFile = async (
  datasetId: string
): Promise<Buffer> => {

  return fs.readFile(
    filePathFor(datasetId)
  );
};


export const deleteDatasetFile = async (
  datasetId: string
): Promise<void> => {

  await fs.rm(
    filePathFor(datasetId),
    {
      force: true
    }
  );
};