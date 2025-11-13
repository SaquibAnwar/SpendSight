import type { AccountType } from "@/types/models";

import { inferAccountType } from "./account-type";
import { parseCsv } from "./csv-parser";
import { detectStatementFormat } from "./detect-file-type";
import { parseExcel } from "./excel-parser";
import type { ParseResult, StatementFormat } from "./types";

export type { ParseResult, StatementFormat } from "./types";

export async function parseStatementFile(
  file: File,
  options?: { accountType?: AccountType }
): Promise<ParseResult & { format: StatementFormat; fileName: string }> {
  const format = detectStatementFormat(file);
  const accountType = options?.accountType ?? inferAccountType(file.name);

  const result = await resolveParser(format)(file, accountType);

  return {
    ...result,
    format,
    fileName: file.name,
  };
}

export async function parseStatementFiles(
  files: File[],
  options?: { accountType?: AccountType }
): Promise<(ParseResult & { format: StatementFormat; fileName: string })[]> {
  return Promise.all(files.map((file) => parseStatementFile(file, options)));
}

function resolveParser(format: StatementFormat) {
  switch (format) {
    case "csv":
      return (file: File, accountType?: AccountType) =>
        parseCsv({ file, accountType });
    case "excel":
      return (file: File, accountType?: AccountType) =>
        parseExcel({ file, accountType });
    case "pdf":
      return async (file: File, accountType?: AccountType) => {
        const { parsePdf } = await import("./pdf-parser");
        return parsePdf({ file, accountType });
      };
    default:
      return async (_file: File, accountType?: AccountType) => ({
        transactions: [],
        warnings: [
          {
            message: "Unsupported file format.",
          },
        ],
        metadata: {
          accountType: accountType ?? "bank",
          bankName: null,
          accountNumber: null,
        },
      });
  }
}

