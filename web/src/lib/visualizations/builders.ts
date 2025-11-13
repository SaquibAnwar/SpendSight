import { parseISO, format } from "date-fns";

import type { Transaction } from "@/types/models";
import { normalizeDescription } from "@/lib/insights/utils";

export interface ChartDatum {
  name: string;
  value: number;
}

export function createCategoryPieData(transactions: Transaction[]) {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    const key = transaction.category ?? "Uncategorised";
    const amount = transaction.type === "debit" ? transaction.amount : -transaction.amount;
    totals.set(key, (totals.get(key) ?? 0) + Math.abs(amount));
  }

  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
}

export function createDebitCreditBreakdown(transactions: Transaction[]) {
  let debit = 0;
  let credit = 0;

  for (const transaction of transactions) {
    if (transaction.type === "debit") {
      debit += transaction.amount;
    } else {
      credit += transaction.amount;
    }
  }

  return [
    { name: "Debits", value: Number(Math.abs(debit).toFixed(2)) },
    { name: "Credits", value: Number(Math.abs(credit).toFixed(2)) },
  ];
}

export function createDailySpendSeries(transactions: Transaction[]) {
  const dayTotals = new Map<string, number>();
  for (const transaction of transactions) {
    const date = transaction.date;
    if (!dayTotals.has(date)) {
      dayTotals.set(date, 0);
    }
    const amount = transaction.type === "debit" ? transaction.amount : -transaction.amount;
    dayTotals.set(date, dayTotals.get(date)! + amount);
  }

  return Array.from(dayTotals.entries())
    .map(([date, spend]) => ({
      date,
      spend: Number(spend.toFixed(2)),
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function createRecurringBreakdown(transactions: Transaction[]) {
  let recurring = 0;
  let nonRecurring = 0;

  for (const transaction of transactions) {
    const amount = Math.abs(transaction.amount);
    if (transaction.isRecurring) {
      recurring += amount;
    } else {
      nonRecurring += amount;
    }
  }

  return [
    { name: "Recurring", value: Number(recurring.toFixed(2)) },
    { name: "Non-recurring", value: Number(nonRecurring.toFixed(2)) },
  ];
}

export function createTopMerchants(transactions: Transaction[], limit = 5) {
  const totals = new Map<
    string,
    { description: string; amount: number }
  >();

  for (const transaction of transactions) {
    const key = normalizeDescription(transaction.description);
    const existing = totals.get(key);
    const amount = Math.abs(transaction.amount);
    if (existing) {
      existing.amount += amount;
    } else {
      totals.set(key, {
        description: transaction.description,
        amount,
      });
    }
  }

  return Array.from(totals.values())
    .map((entry) => ({
      name: entry.description,
      value: Number(entry.amount.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function createCategoryTrend(transactions: Transaction[], topCategories = 5) {
  const categoryTotals = new Map<string, number>();
  for (const transaction of transactions) {
    const key = transaction.category ?? "Uncategorised";
    categoryTotals.set(
      key,
      (categoryTotals.get(key) ?? 0) + Math.abs(transaction.amount)
    );
  }

  const sortedCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topCategories)
    .map(([category]) => category);

  const trendMap = new Map<
    string,
    Record<string, number>
  >();

  for (const transaction of transactions) {
    const date = safeFormatDate(transaction.date);
    if (!date) continue;

    if (!trendMap.has(date)) {
      trendMap.set(date, {});
    }

    const bucket = trendMap.get(date)!;
    const category = sortedCategories.includes(transaction.category ?? "Uncategorised")
      ? transaction.category ?? "Uncategorised"
      : "Other";

    bucket[category] = (bucket[category] ?? 0) + Math.abs(transaction.amount);
  }

  const categories = [...sortedCategories];
  if (transactions.some((transaction) => {
    const category = transaction.category ?? "Uncategorised";
    return !sortedCategories.includes(category);
  })) {
    categories.push("Other");
  }

  const dataset = Array.from(trendMap.entries())
    .map(([date, bucket]) => {
      const row: Record<string, number | string> = { date };
      for (const category of categories) {
        row[category] = Number((bucket[category] ?? 0).toFixed(2));
      }
      return row;
    })
    .sort((a, b) => (a.date as string) < (b.date as string) ? -1 : 1);

  return { categories, dataset };
}

function safeFormatDate(value: string) {
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return format(parsed, "yyyy-MM-dd");
}


