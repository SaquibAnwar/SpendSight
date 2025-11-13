import { parse, isValid, format, parseISO } from "date-fns";

import {
  type AccountType,
  type Transaction,
  type TransactionType,
} from "@/types/models";

import type { ParseWarning } from "./types";

const DATE_FORMATS = [
  "yyyy-MM-dd",
  "dd/MM/yyyy",
  "MM/dd/yyyy",
  "dd-MM-yyyy",
  "MM-dd-yyyy",
  "dd.MM.yyyy",
  "dd/MM/yy",
  "MM/dd/yy",
  "dd-MM-yy",
  "MM-dd-yy",
  "dd.MM.yy",
  "dd MMM yyyy",
  "MMM dd yyyy",
  "dd MMMM yyyy",
  "MMMM dd yyyy",
];

const DATE_CANDIDATES = [
  "date",
  "transaction date",
  "posting date",
  "value date",
  "statement date",
  "txn date",
  "trans date",
  "tran date",
  "value dt",
  "txn dt",
];

const DESCRIPTION_CANDIDATES = [
  "description",
  "details",
  "narration",
  "merchant",
  "particulars",
  "memo",
  "transaction details",
  "trans details",
  "transaction description",
  "remarks",
  "purpose",
  "payee",
];

const AMOUNT_CANDIDATES = [
  "amount",
  "transaction amount",
  "amt",
  "value",
  "trans amount",
];

const CREDIT_CANDIDATES = ["credit", "cr", "cr amount", "credits", "credit amt"];
const DEBIT_CANDIDATES = ["debit", "dr", "dr amount", "debits", "debit amt"];
const WITHDRAWAL_CANDIDATES = [
  "withdrawal amt.",
  "withdrawal amount",
  "withdrawal",
  "withdrawals",
  "withdrawal amt",
];
const DEPOSIT_CANDIDATES = [
  "deposit amt.",
  "deposit amount",
  "deposit",
  "deposits",
  "deposit amt",
];

const TYPE_CANDIDATES = ["type", "transaction type", "debit/credit", "dr/cr"];

const ACCOUNT_NUMBER_CANDIDATES = [
  "account number",
  "account no",
  "account no.",
  "acct no",
  "acct no.",
  "acct #",
  "account #",
  "account id",
];

const BANK_NAME_CANDIDATES = [
  "bank name",
  "issuing bank",
  "financial institution",
  "institution",
  "bank",
  "bank branch",
];

export interface NormalizeOptions {
  fileName: string;
  accountType: AccountType;
}

export interface NormalizationOutcome {
  transaction: Transaction | null;
  warnings: ParseWarning[];
}

export function normalizeRecord(
  raw: Record<string, unknown>,
  options: NormalizeOptions
): NormalizationOutcome {
  const warnings: ParseWarning[] = [];

  const rawValues = Object.values(raw).map((value) =>
    String(value ?? "").trim()
  );
  const isBlankRow = rawValues.every((value) => value === "");
  if (isBlankRow) {
    return { transaction: null, warnings };
  }

  const normalizedKeys = mapKeys(raw);

  const rawDate = normalizedKeys.get("date");
  const rawDescription = normalizedKeys.get("description");
  const rawAccountNumber = normalizedKeys.get("accountNumber");
  const rawBankName = normalizedKeys.get("bankName");

  if (!rawDate || !rawDescription) {
    const availableColumns = Object.keys(raw).join(", ");
    const missing = [];
    if (!rawDate) missing.push("date");
    if (!rawDescription) missing.push("description");
    
    warnings.push({
      message: `Missing required fields: ${missing.join(", ")}. Available columns: ${availableColumns}`,
      context: { raw, availableColumns, missingFields: missing },
    });
    return { transaction: null, warnings };
  }

  const rawDateString = String(rawDate).trim().toLowerCase();
  if (rawDateString === "date" || rawDateString === "value dt") {
    return { transaction: null, warnings };
  }

  const descriptionString = String(rawDescription).trim().toLowerCase();
  if (descriptionString === "narration") {
    return { transaction: null, warnings };
  }

  const parsedDate = parseDate(String(rawDate));
  if (!parsedDate) {
    warnings.push({
      message: "Unable to parse transaction date.",
      context: { rawDate },
    });
  }

  const {
    amount,
    type,
    warnings: amountWarnings,
  } = parseAmount(normalizedKeys);
  warnings.push(...amountWarnings);

  if (amount === null || type === null) {
    warnings.push({
      message: "Unable to resolve transaction amount.",
      context: { raw },
    });
    return { transaction: null, warnings };
  }

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    date: parsedDate ?? String(rawDate),
    rawDate: String(rawDate),
    description: String(rawDescription),
    amount,
    type,
    accountType: options.accountType,
    sourceFileName: options.fileName,
    bankName: rawBankName ? String(rawBankName) : null,
    accountNumber: rawAccountNumber ? String(rawAccountNumber) : null,
    category: null,
    subcategory: null,
    isRecurring: false,
    isNewSpend: false,
    classificationConfidence: 0,
    classificationSource: "none",
  };

  return { transaction, warnings };
}

function mapKeys(raw: Record<string, unknown>) {
  const map = new Map<string, unknown>();

  for (const [key, value] of Object.entries(raw)) {
    const normalizedKey = key.trim().toLowerCase();

    // Try exact match first
    if (DATE_CANDIDATES.includes(normalizedKey) && !map.has("date")) {
      map.set("date", value);
      continue;
    }

    if (
      DESCRIPTION_CANDIDATES.includes(normalizedKey) &&
      !map.has("description")
    ) {
      map.set("description", value);
      continue;
    }

    if (
      AMOUNT_CANDIDATES.includes(normalizedKey) &&
      !map.has("amountColumn")
    ) {
      map.set("amountColumn", value);
      continue;
    }

    if (
      CREDIT_CANDIDATES.includes(normalizedKey) &&
      !map.has("creditColumn")
    ) {
      map.set("creditColumn", value);
      continue;
    }

    if (
      (DEBIT_CANDIDATES.includes(normalizedKey) ||
        WITHDRAWAL_CANDIDATES.includes(normalizedKey)) &&
      !map.has("debitColumn")
    ) {
      map.set("debitColumn", value);
      continue;
    }

    if (
      DEPOSIT_CANDIDATES.includes(normalizedKey) &&
      !map.has("creditColumn")
    ) {
      map.set("creditColumn", value);
      continue;
    }

    if (TYPE_CANDIDATES.includes(normalizedKey) && !map.has("typeColumn")) {
      map.set("typeColumn", value);
      continue;
    }

    if (
      ACCOUNT_NUMBER_CANDIDATES.includes(normalizedKey) &&
      !map.has("accountNumber")
    ) {
      map.set("accountNumber", value);
      continue;
    }

    if (BANK_NAME_CANDIDATES.includes(normalizedKey) && !map.has("bankName")) {
      map.set("bankName", value);
      continue;
    }

    // Fallback: fuzzy matching for common patterns
    if (!map.has("date") && normalizedKey.includes("date")) {
      map.set("date", value);
      continue;
    }

    if (
      !map.has("description") &&
      (normalizedKey.includes("description") ||
        normalizedKey.includes("narration") ||
        normalizedKey.includes("detail") ||
        normalizedKey.includes("particulars") ||
        normalizedKey.includes("remark"))
    ) {
      map.set("description", value);
      continue;
    }

    if (
      !map.has("accountNumber") &&
      (normalizedKey.includes("account number") ||
        normalizedKey.includes("acct no") ||
        normalizedKey.includes("account #"))
    ) {
      map.set("accountNumber", value);
      continue;
    }

    if (
      !map.has("bankName") &&
      (normalizedKey.includes("bank name") ||
        (normalizedKey.includes("bank") &&
          !normalizedKey.includes("bank statement")))
    ) {
      map.set("bankName", value);
      continue;
    }

    if (
      !map.has("creditColumn") &&
      (normalizedKey.includes("credit") ||
        normalizedKey.includes("deposit") ||
        normalizedKey === "cr")
    ) {
      map.set("creditColumn", value);
      continue;
    }

    if (
      !map.has("debitColumn") &&
      (normalizedKey.includes("debit") ||
        normalizedKey.includes("withdrawal") ||
        normalizedKey === "dr")
    ) {
      map.set("debitColumn", value);
      continue;
    }

    if (
      !map.has("amountColumn") &&
      (normalizedKey.includes("amount") || normalizedKey.includes("amt"))
    ) {
      map.set("amountColumn", value);
      continue;
    }
  }

  return map;
}

function parseDate(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const delimiterMatch = trimmed.match(
    /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/
  );
  if (delimiterMatch) {
    const [, first, second, year] = delimiterMatch;
    const normalizedYear =
      year.length === 2 ? normalizeTwoDigitYear(year) : year;
    const candidate = `${normalizedYear}-${pad(second)}-${pad(first)}`;
    const parsedCandidate = parseISO(candidate);
    if (isValid(parsedCandidate)) {
      return format(parsedCandidate, "yyyy-MM-dd");
    }
  }

  for (const formatString of DATE_FORMATS) {
    const parsed = parse(trimmed, formatString, new Date());
    if (isValid(parsed)) {
      return format(parsed, "yyyy-MM-dd");
    }
  }

  const isoCandidate = parseIsoString(trimmed);
  if (isValid(isoCandidate)) {
    return format(isoCandidate, "yyyy-MM-dd");
  }

  return null;
}

function parseIsoString(value: string) {
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (digitsOnly.length === 8) {
    const year = normalizeYear(digitsOnly.slice(0, 4));
    const month = digitsOnly.slice(4, 6);
    const day = digitsOnly.slice(6);
    return parseISO(`${year}-${month}-${day}`);
  }
  if (digitsOnly.length === 6) {
    const day = digitsOnly.slice(0, 2);
    const month = digitsOnly.slice(2, 4);
    const year = normalizeTwoDigitYear(digitsOnly.slice(4));
    return parseISO(`${year}-${month}-${day}`);
  }
  return new Date(value);
}

function normalizeYear(yearString: string) {
  let year = Number(yearString);
  if (year < 1900) {
    year += 2000;
  }
  return year;
}

function normalizeTwoDigitYear(yearString: string) {
  const year = Number(yearString);
  return String(year >= 70 ? 1900 + year : 2000 + year);
}

function pad(value: string) {
  return value.padStart(2, "0");
}

function parseAmount(
  mapped: Map<string, unknown>
): {
  amount: number | null;
  type: TransactionType | null;
  warnings: ParseWarning[];
} {
  const warnings: ParseWarning[] = [];

  const singleColumn = mapped.get("amountColumn");
  const creditColumn = mapped.get("creditColumn");
  const debitColumn = mapped.get("debitColumn");
  const typeColumn = mapped.get("typeColumn");

  if (singleColumn !== undefined) {
    const raw = Number.parseFloat(cleanAmount(singleColumn));
    if (!Number.isNaN(raw)) {
      return {
        amount: Math.abs(raw),
        type: raw >= 0 ? "credit" : "debit",
        warnings,
      };
    }
    warnings.push({
      message: "Unable to parse amount column.",
      context: { value: singleColumn },
    });
  }

  const credit = creditColumn !== undefined ? cleanAmount(creditColumn) : null;
  const debit = debitColumn !== undefined ? cleanAmount(debitColumn) : null;

  if (credit) {
    const value = Number.parseFloat(credit);
    if (!Number.isNaN(value) && value !== 0) {
      return { amount: Math.abs(value), type: "credit", warnings };
    }
  }

  if (debit) {
    const value = Number.parseFloat(debit);
    if (!Number.isNaN(value) && value !== 0) {
      return { amount: Math.abs(value), type: "debit", warnings };
    }
  }

  if (typeColumn !== undefined && singleColumn !== undefined) {
    const rawAmount = Number.parseFloat(cleanAmount(singleColumn));
    if (!Number.isNaN(rawAmount)) {
      const resolvedType = resolveTypeFromLabel(typeColumn);
      if (resolvedType) {
        return { amount: Math.abs(rawAmount), type: resolvedType, warnings };
      }
    }
  }

  return { amount: null, type: null, warnings };
}

function cleanAmount(value: unknown): string {
  return String(value).replace(/[^0-9.-]+/g, "");
}

function resolveTypeFromLabel(value: unknown): TransactionType | null {
  const normalized = String(value).toLowerCase();
  if (normalized.includes("debit") || normalized.includes("dr")) {
    return "debit";
  }
  if (normalized.includes("credit") || normalized.includes("cr")) {
    return "credit";
  }
  return null;
}

