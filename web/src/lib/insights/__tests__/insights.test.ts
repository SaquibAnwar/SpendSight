import { describe, expect, it } from "vitest";

import type { Transaction } from "@/types/models";
import { detectRecurringExpenses } from "@/lib/insights/recurring-detector";
import { detectNewSpends } from "@/lib/insights/new-spend-detector";

const baseTransaction = {
  rawDate: "",
  type: "debit",
  accountType: "bank",
  sourceFileName: "test.csv",
  category: null,
  subcategory: null,
  isRecurring: false,
  isNewSpend: false,
  classificationConfidence: 0,
  classificationSource: "none",
} as const;

function createTransaction(
  id: string,
  date: string,
  description: string,
  amount: number
): Transaction {
  return {
    ...baseTransaction,
    id,
    date,
    rawDate: date,
    description,
    amount,
  };
}

describe("insights detectors", () => {
  it("detects recurring monthly expenses within tolerance", () => {
    const transactions = [
      createTransaction("1", "2024-01-01", "Netflix Subscription", 499),
      createTransaction("2", "2024-01-31", "Netflix Subscription", 499),
      createTransaction("3", "2024-03-03", "Netflix Subscription", 499),
    ];

    const result = detectRecurringExpenses(transactions);
    expect(result.recurringExpenses).toHaveLength(1);
    expect(result.recurringExpenses[0]).toMatchObject({
      merchant: "Netflix Subscription",
      frequency: "monthly",
    });
    expect(result.recurringTransactionIds.size).toBe(3);
  });

  it("flags unique merchants as new spends when not recurring", () => {
    const transactions = [
      createTransaction("1", "2024-01-05", "Local Coffee", 250),
      createTransaction("2", "2024-01-12", "Uber Ride", 300),
    ];

    const newSpends = detectNewSpends(transactions, new Set());
    expect(newSpends.newSpendTransactionIds.size).toBe(2);
  });
});


