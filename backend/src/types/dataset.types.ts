export interface UploadResult {
  datasetId: string;
  filename: string;
  columns: string[];
}


export interface MappingResult {
  recordsCreated: number;
  rowErrors: {
    rowIndex: number;
    reason: string;
  }[];
}


export interface DatasetSummary {
  id: string;
  filename: string;
  uploadDate: Date;
  recordCount: number;
  kpiCount: number;
  forecastCount: number;
  recommendationCount: number;
}