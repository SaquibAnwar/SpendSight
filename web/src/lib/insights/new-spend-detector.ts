import type { Transaction } from "@/types/models";
import { groupTransactionsByMerchant } from "./utils";

export interface NewSpendDetectionResult {
  newSpendTransactionIds: Set<string>;
}

export function detectNewSpends(
  transactions: Transaction[],
  recurringTransactionIds: Set<string>
): NewSpendDetectionResult {
  const groups = groupTransactionsByMerchant(transactions);
  const newSpendTransactionIds = new Set<string>();

  for (const [, group] of groups.entries()) {
    if (group.length === 1) {
      const transaction = group[0];
      if (!recurringTransactionIds.has(transaction.id)) {
        newSpendTransactionIds.add(transaction.id);
      }
    }
  }

  return { newSpendTransactionIds };
}


