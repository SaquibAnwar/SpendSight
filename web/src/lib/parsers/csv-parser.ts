import Papa from "papaparse";

import { inferAccountType } from "./account-type";
import { normalizeRecord } from "./normalize";
import type { ParseContext, ParseResult, ParseWarning } from "./types";

export async function parseCsv(context: ParseContext): Promise<ParseResult> {
  const accountType =
    context.accountType ?? inferAccountType(context.file.name);

  const { data, errors } = await new Promise<{
    data: Record<string, unknown>[];
    errors: Papa.ParseError[];
  }>((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(context.file, {
      header: true,
      skipEmptyLines: true,
      transformHeader(header) {
        return header.trim();
      },
      complete(results) {
        resolve({ data: results.data, errors: results.errors });
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

  const transactions = [];
  for (const row of data) {
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

