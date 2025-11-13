import { read, utils } from "xlsx";

import { inferAccountType } from "./account-type";
import { normalizeRecord } from "./normalize";
import type { ParseContext, ParseResult, StatementMetadata } from "./types";
import type { Transaction } from "@/types/models";

export async function parseExcel(context: ParseContext): Promise<ParseResult> {
  const accountType =
    context.accountType ?? inferAccountType(context.file.name);

  const arrayBuffer = await context.file.arrayBuffer();
  const workbook = read(arrayBuffer, { type: "array" });

  const warnings = [];

  if (workbook.SheetNames.length === 0) {
    return {
      transactions: [],
      warnings: [
        {
          message: "No worksheets found in Excel file.",
        },
      ],
      metadata: createMetadata([], accountType),
    };
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const allRows = utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });

  if (allRows.length === 0) {
    warnings.push({
      message: `Worksheet "${sheetName}" is empty.`,
    });
  }

  const headerIndex = allRows.findIndex(isHeaderRow);
  if (headerIndex === -1) {
    warnings.push({
      message:
        "Unable to locate the transaction header row. Please ensure the sheet contains columns such as Date, Narration, and Withdrawal/Deposit amounts.",
    });
    return {
      transactions: [],
      warnings,
      metadata: createMetadata([], accountType),
    };
  }

  const headerRow = allRows[headerIndex].map((cell) =>
    String(cell ?? "").trim()
  );

  const rangeRef = sheet["!ref"];
  if (!rangeRef) {
    warnings.push({ message: "Worksheet range information missing." });
    return {
      transactions: [],
      warnings,
      metadata: createMetadata([], accountType),
    };
  }

  const range = utils.decode_range(rangeRef);
  range.s.r = headerIndex + 1;

  const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: headerRow,
    range,
    defval: "",
    raw: false,
    blankrows: false,
  });

  const transactions: Transaction[] = [];
  for (const row of rows) {
    if (isRepeatedHeaderRow(row) || isNoiseRow(row)) {
      continue;
    }
    const { transaction, warnings: rowWarnings } = normalizeRecord(row, {
      fileName: context.file.name,
      accountType,
    });
    warnings.push(...rowWarnings);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return { transactions, warnings, metadata: createMetadata(transactions, accountType) };
}

function isHeaderRow(row: (string | number)[]) {
  if (!row || row.length === 0) return false;
  const normalized = row.map((cell) => String(cell ?? "").toLowerCase().trim());

  const hasDate = normalized.some((cell) => cell === "date");
  const hasNarration = normalized.some((cell) =>
    cell.startsWith("narration")
  );
  const hasWithdrawal =
    normalized.some((cell) => cell.includes("withdrawal")) ||
    normalized.some((cell) => cell.includes("debit"));
  const hasDeposit =
    normalized.some((cell) => cell.includes("deposit")) ||
    normalized.some((cell) => cell.includes("credit"));

  return hasDate && hasNarration && (hasWithdrawal || hasDeposit);
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
    values[0]?.toLowerCase().includes("page no")
  ) {
    return true;
  }
  return false;
}

function createMetadata(
  transactions: Transaction[],
  accountType: ParseContext["accountType"]
): StatementMetadata {
  const bankName =
    transactions.find((transaction) => transaction.bankName)?.bankName ?? null;
  const accountNumber =
    transactions.find((transaction) => transaction.accountNumber)
      ?.accountNumber ?? null;

  return {
    accountType: accountType ?? "bank",
    bankName,
    accountNumber,
  };
}


