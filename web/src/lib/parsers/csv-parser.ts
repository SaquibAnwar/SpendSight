import Papa from "papaparse";

import { inferAccountType } from "./account-type";
import { normalizeRecord } from "./normalize";
import type { ParseContext, ParseResult, ParseWarning } from "./types";

export async function parseCsv(context: ParseContext): Promise<ParseResult> {
  const accountType =
    context.accountType ?? inferAccountType(context.file.name);

  const { data, errors } = await new Promise<{
    data: string[][];
    errors: Papa.ParseError[];
  }>((resolve, reject) => {
    Papa.parse<string[]>(context.file, {
      header: false,
      skipEmptyLines: true,
      complete(results) {
        resolve({
          data: results.data.map((row) =>
            normalizeRow(row)
          ),
          errors: results.errors,
        });
      },
      error(err) {
        reject(err);
      },
    });
  });

  const warnings: ParseWarning[] = errors.map((error) => ({
    message: `Row ${error.row}: ${error.message}`,
    context: { code: error.code },
  }));

  if (data.length === 0) {
    return {
      transactions: [],
      warnings: [
        ...warnings,
        { message: "The CSV file appears to be empty." },
      ],
    };
  }

  const headerIndex = data.findIndex(isHeaderRow);
  if (headerIndex === -1) {
    return {
      transactions: [],
      warnings: [
        ...warnings,
        {
          message:
            "Unable to locate the transaction header row. Please ensure the sheet contains columns such as Date, Narration, and Withdrawal/Deposit amounts.",
        },
      ],
    };
  }

  const headerRow = buildHeaders(data[headerIndex]);
  const records = [] as Record<string, unknown>[];

  for (let i = headerIndex + 1; i < data.length; i += 1) {
    const row = data[i];
    const record = mapRowToRecord(headerRow, row);
    if (isRepeatedHeaderRow(record) || isNoiseRow(record)) {
      continue;
    }
    records.push(record);
  }

  const transactions = [];
  for (const row of records) {
    const { transaction, warnings: rowWarnings } = normalizeRecord(row, {
      fileName: context.file.name,
      accountType,
    });
    warnings.push(...rowWarnings);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return { transactions, warnings };
}

function normalizeRow(row: unknown): string[] {
  if (Array.isArray(row)) {
    return row.map((cell) => String(cell ?? "").trim());
  }
  if (row && typeof row === "object") {
    return Object.values(row).map((cell) => String(cell ?? "").trim());
  }
  if (row === null || row === undefined) {
    return [];
  }
  return [String(row).trim()];
}

function isHeaderRow(row: string[]) {
  if (!row || row.length === 0) return false;
  const normalized = row.map((cell) => cell.toLowerCase().trim());

  const hasDate = normalized.some((cell) => cell === "date" || cell.includes("date"));
  const hasNarration = normalized.some((cell) =>
    cell.startsWith("narration") || cell.includes("description") || cell.includes("details")
  );
  const hasWithdrawal = normalized.some(
    (cell) => cell.includes("withdrawal") || cell.includes("debit") || cell === "dr"
  );
  const hasDeposit = normalized.some(
    (cell) => cell.includes("deposit") || cell.includes("credit") || cell === "cr"
  );
  const hasAmount = normalized.some((cell) => cell.includes("amount") || cell.includes("amt"));

  return hasDate && hasNarration && (hasWithdrawal || hasDeposit || hasAmount);
}

function buildHeaders(row: string[]) {
  const seen = new Map<string, number>();
  return row.map((cell, index) => {
    const trimmed = cell.trim();
    const base = trimmed !== "" ? trimmed : `column_${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    if (count === 0) {
      return base;
    }
    return `${base}_${count + 1}`;
  });
}

function mapRowToRecord(headers: string[], row: string[]) {
  const record: Record<string, unknown> = {};
  headers.forEach((header, index) => {
    record[header] = row[index] ?? "";
  });
  return record;
}

function isRepeatedHeaderRow(row: Record<string, unknown>) {
  const values = Object.values(row)
    .map((value) => String(value ?? "").toLowerCase().trim())
    .filter(Boolean);
  if (values.length === 0) return true;
  return values.some((value) => value === "date" || value === "narration");
}

function isNoiseRow(row: Record<string, unknown>) {
  const values = Object.values(row).map((value) => String(value ?? "").trim());
  if (values.every((value) => value === "")) {
    return true;
  }
  if (
    values.every((value) => value === "" || /^[-*]+$/.test(value)) ||
    values[0]?.toLowerCase().includes("page no") ||
    values[0]?.toLowerCase().includes("statement of accounts")
  ) {
    return true;
  }
  return false;
}

