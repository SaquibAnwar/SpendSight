import {
  differenceInCalendarDays,
  isValid,
  parseISO,
} from "date-fns";

import type { Frequency, RecurringExpense, Transaction } from "@/types/models";
import { groupTransactionsByMerchant } from "./utils";

const DAY_TOLERANCE = 3;
const AMOUNT_TOLERANCE = 0.1;

export interface RecurringDetectionResult {
  recurringExpenses: RecurringExpense[];
  recurringTransactionIds: Set<string>;
}

export function detectRecurringExpenses(
  transactions: Transaction[]
): RecurringDetectionResult {
  const groups = groupTransactionsByMerchant(transactions);
  const recurringExpenses: RecurringExpense[] = [];
  const recurringTransactionIds = new Set<string>();

  for (const [merchantKey, merchantTransactions] of groups.entries()) {
    if (merchantTransactions.length < 2) continue;

    const sorted = merchantTransactions
      .map((transaction) => ({
        transaction,
        date: parseISO(transaction.date),
      }))
      .filter((entry) => isValid(entry.date))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (sorted.length < 2) continue;

    const intervals = calculateIntervals(sorted);
    if (intervals.length === 0) continue;

    const averageInterval =
      intervals.reduce((sum, value) => sum + value, 0) / intervals.length;

    const frequency = classifyFrequency(averageInterval);
    if (!frequency) continue;

    if (!intervalsWithinTolerance(intervals, averageInterval)) continue;

    const amounts = sorted.map((entry) => entry.transaction.amount);
    const averageAmount = amounts.reduce((s, v) => s + Math.abs(v), 0) / amounts.length;
    if (!amountsWithinTolerance(amounts, averageAmount)) continue;

    // Mark transactions as recurring
    for (const { transaction } of sorted) {
      recurringTransactionIds.add(transaction.id);
    }

    recurringExpenses.push({
      id: `${merchantKey}-${frequency}`,
      merchant: sorted[0].transaction.description,
      frequency,
      transactionIds: sorted.map((entry) => entry.transaction.id),
      averageAmount: Number(averageAmount.toFixed(2)),
      amountPattern: amounts.map((amount) => Number(amount.toFixed(2))),
    });
  }

  return { recurringExpenses, recurringTransactionIds };
}

function calculateIntervals(
  entries: { date: Date; transaction: Transaction }[]
) {
  const intervals: number[] = [];
  for (let index = 1; index < entries.length; index += 1) {
    const current = entries[index];
    const previous = entries[index - 1];
    const days = Math.abs(
      differenceInCalendarDays(current.date, previous.date)
    );
    if (days > 0) {
      intervals.push(days);
    }
  }
  return intervals;
}

function classifyFrequency(interval: number): Frequency | null {
  if (interval >= 27 && interval <= 33) {
    return "monthly";
  }
  if (interval >= 6 && interval <= 8) {
    return "weekly";
  }
  if (interval >= 13 && interval <= 16) {
    return "custom";
  }
  return null;
}

function intervalsWithinTolerance(intervals: number[], average: number) {
  return intervals.every(
    (interval) => Math.abs(interval - average) <= DAY_TOLERANCE
  );
}

function amountsWithinTolerance(amounts: number[], average: number) {
  if (average === 0) return false;
  return amounts.every(
    (amount) =>
      Math.abs(Math.abs(amount) - average) <= average * AMOUNT_TOLERANCE
  );
}

