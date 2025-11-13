import { useEffect, useMemo, useState } from "react";

import type { RecurringExpense, Transaction } from "@/types/models";
import { detectNewSpends } from "@/lib/insights/new-spend-detector";
import { detectRecurringExpenses } from "@/lib/insights/recurring-detector";

export interface NewSpendInsight {
  transaction: Transaction;
}

interface UseInsightsEngineResult {
  recurringExpenses: RecurringExpense[];
  newSpendInsights: NewSpendInsight[];
}

export function useInsightsEngine(
  transactions: Transaction[],
  setTransactions: (
    updater: Transaction[] | ((current: Transaction[]) => Transaction[])
  ) => void
): UseInsightsEngineResult {
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);
  const [newSpendIds, setNewSpendIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (transactions.length === 0) {
      setRecurringExpenses([]);
      setNewSpendIds(new Set());
      return;
    }

    const recurring = detectRecurringExpenses(transactions);
    const newSpends = detectNewSpends(
      transactions,
      recurring.recurringTransactionIds
    );

    setRecurringExpenses(recurring.recurringExpenses);
    setNewSpendIds(newSpends.newSpendTransactionIds);

    setTransactions((prev) => {
      let needsUpdate = false;
      const next = prev.map((transaction) => {
        const nextIsRecurring = recurring.recurringTransactionIds.has(
          transaction.id
        );
        const nextIsNewSpend = newSpends.newSpendTransactionIds.has(
          transaction.id
        );
        if (
          transaction.isRecurring === nextIsRecurring &&
          transaction.isNewSpend === nextIsNewSpend
        ) {
          return transaction;
        }
        needsUpdate = true;
        return {
          ...transaction,
          isRecurring: nextIsRecurring,
          isNewSpend: nextIsNewSpend,
        };
      });
      return needsUpdate ? next : prev;
    });
  }, [setTransactions, transactions]);

  const newSpendInsights = useMemo(() => {
    if (transactions.length === 0 || newSpendIds.size === 0) {
      return [];
    }
    return transactions
      .filter((transaction) => newSpendIds.has(transaction.id))
      .map((transaction) => ({ transaction }));
  }, [newSpendIds, transactions]);

  return {
    recurringExpenses,
    newSpendInsights,
  };
}

