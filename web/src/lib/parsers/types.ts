import type { AccountType, Transaction } from "@/types/models";

export type StatementFormat = "csv" | "excel" | "pdf" | "unknown";

export interface ParseWarning {
  message: string;
  context?: Record<string, unknown>;
}

export interface ParseError {
  message: string;
  cause?: unknown;
}

export interface ParseSummary {
  fileName: string;
  format: StatementFormat;
  transactionCount: number;
  warnings: ParseWarning[];
}

export interface ParseResult {
  transactions: Transaction[];
  warnings: ParseWarning[];
}

export interface ParseContext {
  file: File;
  accountType?: AccountType;
}

export interface StatementParser {
  supports: (file: File, format: StatementFormat) => boolean;
  parse: (context: ParseContext) => Promise<ParseResult>;
}

export interface NormalizedRow {
  raw: Record<string, unknown>;
  transaction: Transaction | null;
  warnings: ParseWarning[];
}

