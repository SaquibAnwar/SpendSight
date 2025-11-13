"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/types/models";

export type FilterOption = "all" | "uncategorized" | "debit" | "credit";

type ColumnKey =
  | "date"
  | "description"
  | "amount"
  | "type"
  | "account"
  | "category"
  | "subcategory"
  | "status"
  | "actions";

const INITIAL_WIDTHS: Record<ColumnKey, number> = {
  date: 120,
  description: 260,
  amount: 120,
  type: 110,
  account: 240,
  category: 150,
  subcategory: 150,
  status: 110,
  actions: 150,
};

const MIN_COLUMN_WIDTH = 96;

interface TransactionReviewTableProps {
  transactions: Transaction[];
  filter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  onUpdateTransaction: (
    id: string,
    updates: Pick<Transaction, "category" | "subcategory" | "classificationSource" | "classificationConfidence">
  ) => void;
  onRequestRule: (transaction: Transaction) => void;
}

export function TransactionReviewTable({
  transactions,
  filter,
  onFilterChange,
  onUpdateTransaction,
  onRequestRule,
}: TransactionReviewTableProps) {
  const [columnWidths, setColumnWidths] =
    useState<Record<ColumnKey, number>>(INITIAL_WIDTHS);
  const totalWidth = useMemo(
    () => Object.values(columnWidths).reduce((sum, width) => sum + width, 0),
    [columnWidths]
  );
  const resizeState = useRef<{
    column: ColumnKey;
    startX: number;
    startWidth: number;
  } | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const state = resizeState.current;
      if (!state) return;
      const delta = event.clientX - state.startX;
      setColumnWidths((prev) => {
        const nextWidth = Math.max(
          MIN_COLUMN_WIDTH,
          state.startWidth + delta
        );
        return { ...prev, [state.column]: nextWidth };
      });
    };

    const handleMouseUp = () => {
      resizeState.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResize = (column: ColumnKey) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    resizeState.current = {
      column,
      startX: event.clientX,
      startWidth: columnWidths[column],
    };
  };

  const filteredTransactions = useMemo(() => {
    if (filter === "uncategorized") {
      return transactions.filter((transaction) => !transaction.category);
    }
    if (filter === "debit") {
      return transactions.filter((transaction) => transaction.type === "debit");
    }
    if (filter === "credit") {
      return transactions.filter((transaction) => transaction.type === "credit");
    }
    return transactions;
  }, [filter, transactions]);
  const debitCount = useMemo(
    () => transactions.filter((transaction) => transaction.type === "debit").length,
    [transactions]
  );
  const creditCount = useMemo(
    () => transactions.filter((transaction) => transaction.type === "credit").length,
    [transactions]
  );

  return (
    <Card className="h-full w-full">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Categorisation review</CardTitle>
            <CardDescription>
              Update categories and confirm new rules before continuing.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange("all")}
            >
              All ({transactions.length})
            </Button>
            <Button
              variant={filter === "uncategorized" ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange("uncategorized")}
            >
              Uncategorized (
              {transactions.filter((transaction) => !transaction.category).length})
            </Button>
            <Button
              variant={filter === "debit" ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange("debit")}
            >
              Debits ({debitCount})
            </Button>
            <Button
              variant={filter === "credit" ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange("credit")}
            >
              Credits ({creditCount})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-h-[640px] overflow-auto">
        <Table
          className="w-full table-fixed"
          style={{ minWidth: Math.max(960, totalWidth) }}
        >
          <TableHeader>
            <TableRow>
              <ResizableHead
                width={columnWidths.date}
                onMouseDown={startResize("date")}
              >
                Date
              </ResizableHead>
              <ResizableHead
                width={columnWidths.description}
                onMouseDown={startResize("description")}
              >
                Description
              </ResizableHead>
              <ResizableHead
                width={columnWidths.amount}
                onMouseDown={startResize("amount")}
                align="right"
              >
                Amount
              </ResizableHead>
              <ResizableHead
                width={columnWidths.type}
                onMouseDown={startResize("type")}
              >
                Type
              </ResizableHead>
              <ResizableHead
                width={columnWidths.account}
                onMouseDown={startResize("account")}
              >
                Account
              </ResizableHead>
              <ResizableHead
                width={columnWidths.category}
                onMouseDown={startResize("category")}
              >
                Category
              </ResizableHead>
              <ResizableHead
                width={columnWidths.subcategory}
                onMouseDown={startResize("subcategory")}
              >
                Subcategory
              </ResizableHead>
              <ResizableHead
                width={columnWidths.status}
                onMouseDown={startResize("status")}
              >
                Status
              </ResizableHead>
              <ResizableHead
                width={columnWidths.actions}
                onMouseDown={startResize("actions")}
              >
                Actions
              </ResizableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No transactions to review.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <EditableRow
                  key={transaction.id}
                  transaction={transaction}
                  onUpdate={onUpdateTransaction}
                  onRequestRule={onRequestRule}
                  columnWidths={columnWidths}
                />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface EditableRowProps {
  transaction: Transaction;
  onUpdate: TransactionReviewTableProps["onUpdateTransaction"];
  onRequestRule: (transaction: Transaction) => void;
  columnWidths: Record<ColumnKey, number>;
}

function EditableRow({
  transaction,
  onUpdate,
  onRequestRule,
  columnWidths,
}: EditableRowProps) {
  const [category, setCategory] = useState(transaction.category ?? "");
  const [subcategory, setSubcategory] = useState(transaction.subcategory ?? "");
  const isDirty =
    category !== (transaction.category ?? "") ||
    subcategory !== (transaction.subcategory ?? "");

  useEffect(() => {
    setCategory(transaction.category ?? "");
    setSubcategory(transaction.subcategory ?? "");
  }, [transaction.category, transaction.subcategory, transaction.id]);

  const handleSave = () => {
    onUpdate(transaction.id, {
      category: category || null,
      subcategory: subcategory || null,
      classificationSource: "manual",
      classificationConfidence: 1,
    });
  };

  return (
    <TableRow>
      <TableCell
        className="text-sm"
        style={{
          width: columnWidths.date,
          minWidth: columnWidths.date,
          maxWidth: columnWidths.date,
        }}
      >
        {transaction.date}
      </TableCell>
      <TableCell
        className="truncate text-sm"
        style={{
          width: columnWidths.description,
          minWidth: columnWidths.description,
          maxWidth: columnWidths.description,
        }}
      >
        {transaction.description}
      </TableCell>
      <TableCell
        className="text-right text-sm font-medium"
        style={{
          width: columnWidths.amount,
          minWidth: columnWidths.amount,
          maxWidth: columnWidths.amount,
        }}
      >
        {transaction.type === "debit" ? "-" : "+"}
        {transaction.amount.toFixed(2)}
      </TableCell>
      <TableCell
        className="capitalize text-sm"
        style={{
          width: columnWidths.type,
          minWidth: columnWidths.type,
          maxWidth: columnWidths.type,
        }}
      >
        {transaction.type}
      </TableCell>
      <TableCell
        className="text-sm"
        style={{
          width: columnWidths.account,
          minWidth: columnWidths.account,
          maxWidth: columnWidths.account,
        }}
      >
        <div className="flex flex-col gap-1 overflow-hidden">
          <span
            className="font-medium truncate"
            title={
              transaction.bankName ??
              transaction.accountType.replace("-", " ")
            }
          >
            {transaction.bankName ??
              transaction.accountType.replace("-", " ")}
          </span>
          <span
            className="text-xs text-muted-foreground truncate"
            title={transaction.accountNumber ?? "No account #"}
          >
            {transaction.accountNumber ?? "No account #"}
          </span>
          <span
            className="text-xs text-muted-foreground truncate"
            title={transaction.sourceFileName}
          >
            {transaction.sourceFileName}
          </span>
        </div>
      </TableCell>
      <TableCell
        style={{
          width: columnWidths.category,
          minWidth: columnWidths.category,
          maxWidth: columnWidths.category,
        }}
      >
        <Input
          value={category}
          placeholder="Enter category"
          onChange={(event) => setCategory(event.target.value)}
        />
      </TableCell>
      <TableCell
        style={{
          width: columnWidths.subcategory,
          minWidth: columnWidths.subcategory,
          maxWidth: columnWidths.subcategory,
        }}
      >
        <Input
          value={subcategory}
          placeholder="Optional subcategory"
          onChange={(event) => setSubcategory(event.target.value)}
        />
      </TableCell>
      <TableCell
        style={{
          width: columnWidths.status,
          minWidth: columnWidths.status,
          maxWidth: columnWidths.status,
        }}
      >
        <Badge variant="secondary" className="capitalize">
          {transaction.classificationSource ?? "none"}
        </Badge>
      </TableCell>
      <TableCell
        className="flex items-center gap-2"
        style={{
          width: columnWidths.actions,
          minWidth: columnWidths.actions,
          maxWidth: columnWidths.actions,
        }}
      >
        <Button
          variant="default"
          size="sm"
          disabled={!isDirty}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRequestRule(transaction)}
        >
          Create rule
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface ResizableHeadProps {
  children: React.ReactNode;
  width: number;
  onMouseDown: (event: React.MouseEvent) => void;
  align?: "left" | "right";
}

function ResizableHead({
  children,
  width,
  onMouseDown,
  align = "left",
}: ResizableHeadProps) {
  const alignmentClass = align === "right" ? "text-right" : "";
  return (
    <TableHead
      className={`relative select-none ${alignmentClass}`}
      style={{ width, minWidth: width, maxWidth: width }}
    >
      <span>{children}</span>
      <span
        role="presentation"
        onMouseDown={onMouseDown}
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent"
      />
    </TableHead>
  );
}


