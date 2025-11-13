import type { StatementFormat } from "./types";

const EXCEL_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

const PDF_MIME_TYPES = new Set(["application/pdf"]);

const CSV_MIME_TYPES = new Set([
  "text/csv",
  "application/csv",
  "text/plain",
]);

export function detectStatementFormat(file: File): StatementFormat {
  const name = file.name.toLowerCase();
  const mime = file.type;

  if (PDF_MIME_TYPES.has(mime) || name.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    EXCEL_MIME_TYPES.has(mime) ||
    name.endsWith(".xlsx") ||
    name.endsWith(".xls")
  ) {
    return "excel";
  }

  if (CSV_MIME_TYPES.has(mime) || name.endsWith(".csv")) {
    return "csv";
  }

  return "unknown";
}


