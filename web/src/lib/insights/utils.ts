import { parseISO } from "date-fns";

import type { Transaction } from "@/types/models";

export function normalizeDescription(description: string) {
  return description
    .toLowerCase()
    .replace(/\d+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function groupTransactionsByMerchant(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const transaction of transactions) {
    const key = normalizeDescription(transaction.description);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(transaction);
  }
  return groups;
}

export function parseTransactionDate(transaction: Transaction) {
  const parsed = parseISO(transaction.date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}


