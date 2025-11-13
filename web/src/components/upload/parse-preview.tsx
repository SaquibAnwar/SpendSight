"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatementParseSummary } from "@/hooks/use-statement-parser";
import type { Transaction } from "@/types/models";
import type { ParseWarning } from "@/lib/parsers/types";

interface ParsePreviewProps {
  summaries: StatementParseSummary[];
  transactions: Transaction[];
  warnings: ParseWarning[];
  onReset: () => void;
  hasWarnings?: boolean;
}

export function ParsePreview({
  summaries,
  transactions,
  warnings,
  onReset,
  hasWarnings = false,
}: ParsePreviewProps) {
  useEffect(() => {
    if (!hasWarnings || warnings.length === 0) return;
    for (const warning of warnings) {
      console.warn("Parsing warning:", warning.message, warning.context);
    }
  }, [hasWarnings, warnings]);

  return (
    <section className="w-full space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Parsing preview</h2>
          <p className="text-sm text-muted-foreground">
            Review extracted transactions before categorisation.
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>
          Upload different files
        </Button>
      </div>

      <div className="flex w-full flex-col gap-4">
        {summaries.map((summary) => (
          <Card key={summary.fileName} className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                {summary.fileName}
                <span className="text-xs uppercase text-muted-foreground">
                  {summary.format.toUpperCase()}
                </span>
              </CardTitle>
              <CardDescription>
                {summary.transactionCount} transactions detected
              </CardDescription>
            </CardHeader>
            {summary.warnings.length > 0 && (
              <CardContent>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {summary.warnings.slice(0, 3).map((warning, index) => (
                    <li key={`${summary.fileName}-warning-${index}`}>
                      • {warning.message}
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {transactions.length} transactions normalised across all files.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="w-full">
            <TableCaption>Parsed transactions ready for categorisation.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    No transactions detected. Try another statement.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell className="max-w-[240px] truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.type === "debit" ? "-" : "+"}
                      {transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {transaction.type}
                    </TableCell>
                    <TableCell className="capitalize">
                      {transaction.accountType.replace("-", " ")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

