import type { Transaction } from "@/types/models";

interface DefaultRule {
  category: string;
  subcategory?: string | null;
  confidence?: number;
  test: (transaction: Transaction) => boolean;
}

const DEFAULT_RULES: DefaultRule[] = [
  {
    category: "Salary/Transfer",
    confidence: 0.9,
    test: (transaction) =>
      match(transaction, /(salary|bank credit|neft\s?cr|coforge)/i),
  },
  {
    category: "Entertainment",
    confidence: 0.85,
    test: (transaction) =>
      match(transaction, /(netflix|spotify|hotstar|prime video|apple media)/i),
  },
  {
    category: "Forex",
    confidence: 0.8,
    test: (transaction) => match(transaction, /(rfx|forex)/i),
  },
  {
    category: "Shopping",
    confidence: 0.75,
    test: (transaction) => match(transaction, /(amazon|flipkart)/i),
  },
  {
    category: "Auto Debit",
    confidence: 0.8,
    test: (transaction) => match(transaction, /(ach|ecs|auto debit)/i),
  },
  {
    category: "GST/Tax",
    confidence: 0.7,
    test: (transaction) => match(transaction, /(gst|tax)/i),
  },
  {
    category: "IMPS Transfer",
    confidence: 0.7,
    test: (transaction) => match(transaction, /(imps|rtgs)/i),
  },
  {
    category: "UPI Transfer",
    confidence: 0.65,
    test: (transaction) => match(transaction, /upi/i),
  },
];

export function applyDefaultCategories(transactions: Transaction[]) {
  return transactions.map((transaction) => {
    if (transaction.category) return transaction;
    const rule = DEFAULT_RULES.find((candidate) =>
      candidate.test(transaction)
    );
    if (!rule) return transaction;
    return {
      ...transaction,
      category: rule.category,
      subcategory: rule.subcategory ?? null,
      classificationSource: "rule",
      classificationConfidence: rule.confidence ?? 0.75,
    } as Transaction;
  });
}

function match(transaction: Transaction, pattern: RegExp) {
  return pattern.test(transaction.description);
}

