import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import type { Metric } from "./kpiEngine.service.js";

export const exportReportAsPdf = (
  summary: string,
  kpis: Metric[],
): PDFKit.PDFDocument => {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(18).text("Agorys Executive Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text("Executive Summary");
  doc.fontSize(10).text(summary, { align: "left" });
  doc.moveDown();
  doc.fontSize(14).text("Key Performance Indicators");

  kpis.forEach((kpi) => {
    doc.fontSize(10).text(`${kpi.metricName}: ${kpi.metricValue}`);
  });

  doc.end();

  return doc;
};

export const exportReportAsExcel = async (
  summary: string,
  kpis: Metric[],
): Promise<ExcelJS.Buffer> => {
  const workbook = new ExcelJS.Workbook();

  const summarySheet = workbook.addWorksheet("Executive Summary");
  summarySheet.columns = [{ header: "Executive Summary", key: "line", width: 100 }];
  summary.split("\n").forEach((line) => summarySheet.addRow({ line }));

  const kpiSheet = workbook.addWorksheet("KPIs");
  kpiSheet.columns = [
    { header: "Metric", key: "metricName", width: 30 },
    { header: "Value", key: "metricValue", width: 20 },
  ];
  kpis.forEach((kpi) => kpiSheet.addRow(kpi));

  return workbook.xlsx.writeBuffer();
};