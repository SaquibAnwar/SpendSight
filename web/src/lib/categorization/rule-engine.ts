import type { CategoryRule, Transaction } from "@/types/models";

const REGEX_CACHE = new Map<string, RegExp>();

export interface RuleApplicationResult {
  transaction: Transaction;
  matchedRule?: CategoryRule;
}

export function applyRulesToTransactions(
  transactions: Transaction[],
  rules: CategoryRule[]
): RuleApplicationResult[] {
  return transactions.map((transaction) =>
    applyRulesToTransaction(transaction, rules)
  );
}

export function applyRulesToTransaction(
  transaction: Transaction,
  rules: CategoryRule[]
): RuleApplicationResult {
  if (transaction.classificationSource === "manual") {
    return { transaction };
  }

  const normalizedDescription = transaction.description.toLowerCase();
  for (const rule of rules) {
    if (matchesRule(normalizedDescription, rule)) {
      return {
        transaction: {
          ...transaction,
          category: rule.category,
          subcategory: rule.subcategory ?? null,
          classificationSource: "rule",
          classificationConfidence: 0.95,
        },
        matchedRule: rule,
      };
    }
  }

  return {
    transaction: {
      ...transaction,
      classificationSource: transaction.classificationSource ?? "none",
      classificationConfidence: transaction.classificationConfidence ?? 0,
    },
  };
}

function matchesRule(description: string, rule: CategoryRule): boolean {
  const keyword = rule.keyword.toLowerCase();
  switch (rule.matchType) {
    case "contains":
      return description.includes(keyword);
    case "startsWith":
      return description.startsWith(keyword);
    case "regex":
      return getRegex(rule.keyword).test(description);
    default:
      return false;
  }
}

function getRegex(pattern: string): RegExp {
  if (!REGEX_CACHE.has(pattern)) {
    try {
      REGEX_CACHE.set(pattern, new RegExp(pattern, "i"));
    } catch {
      REGEX_CACHE.set(pattern, new RegExp(escapeRegex(pattern), "i"));
    }
  }
  return REGEX_CACHE.get(pattern)!;
}

function escapeRegex(pattern: string) {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


