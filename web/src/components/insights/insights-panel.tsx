"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RecurringExpense } from "@/types/models";
import type { NewSpendInsight } from "@/hooks/use-insights-engine";

interface InsightsPanelProps {
  recurringExpenses: RecurringExpense[];
  newSpendInsights: NewSpendInsight[];
}

export function InsightsPanel({
  recurringExpenses,
  newSpendInsights,
}: InsightsPanelProps) {
  return (
    <section className="w-full space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Spend insights</h2>
        <p className="text-sm text-muted-foreground">
          Identify subscriptions, repeat patterns, and brand new merchants in the
          current statement batch.
        </p>
      </header>

      <div className="flex w-full flex-col gap-6">
        <Card className="h-full w-full">
          <CardHeader>
            <CardTitle>Recurring expenses</CardTitle>
            <CardDescription>
              Subscriptions and frequent spends detected through cadence and
              amount similarity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recurringExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recurring patterns found yet.
              </p>
            ) : (
              <div className="space-y-4">
                {recurringExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-lg border border-border/70 bg-muted/20 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold">
                          {expense.merchant}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {expense.transactionIds.length} occurrences ·{" "}
                          average {expense.averageAmount.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {expense.frequency}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {expense.amountPattern.map((amount, index) => (
                        <span
                          className="rounded-full bg-background px-2 py-1 shadow-sm"
                          key={`${expense.id}-pattern-${index}`}
                        >
                          {amount.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full w-full">
          <CardHeader>
            <CardTitle>New merchants</CardTitle>
            <CardDescription>
              One-off spends or first-time merchants that are not part of existing
              rules or recurring patterns.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[320px] overflow-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newSpendInsights.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No new merchants detected.
                    </TableCell>
                  </TableRow>
                ) : (
                  newSpendInsights.map(({ transaction }) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">{transaction.date}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-sm">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {transaction.type === "debit" ? "-" : "+"}
                        {transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.category ?? "Uncategorised"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


