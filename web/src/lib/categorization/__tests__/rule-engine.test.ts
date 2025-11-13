import { describe, expect, it } from "vitest";

import type { CategoryRule, Transaction } from "@/types/models";
import { applyRulesToTransaction } from "@/lib/categorization/rule-engine";

const baseTransaction: Transaction = {
  id: "1",
  date: "2024-01-01",
  rawDate: "2024-01-01",
  description: "Uber *Trip 1234",
  amount: 120.5,
  type: "debit",
  accountType: "credit-card",
  sourceFileName: "card.csv",
  category: null,
  subcategory: null,
  isRecurring: false,
  isNewSpend: false,
  classificationConfidence: 0,
  classificationSource: "none",
};

const rules: CategoryRule[] = [
  {
    id: "rule-1",
    keyword: "uber",
    category: "Transport",
    subcategory: "Ride hailing",
    matchType: "contains",
    createdAt: 1,
  },
];

describe("rule engine", () => {
  it("applies keyword rules ignoring case", () => {
    const { transaction, matchedRule } = applyRulesToTransaction(
      baseTransaction,
      rules
    );

    expect(matchedRule?.id).toBe("rule-1");
    expect(transaction.category).toBe("Transport");
    expect(transaction.subcategory).toBe("Ride hailing");
    expect(transaction.classificationSource).toBe("rule");
  });

  it("respects manual classifications", () => {
    const manual: Transaction = {
      ...baseTransaction,
      classificationSource: "manual",
      classificationConfidence: 1,
      category: "Travel",
    };

    const { transaction, matchedRule } = applyRulesToTransaction(
      manual,
      rules
    );

    expect(matchedRule).toBeUndefined();
    expect(transaction.category).toBe("Travel");
    expect(transaction.classificationSource).toBe("manual");
  });
});


