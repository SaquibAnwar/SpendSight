import { utils, writeFileXLSX } from "xlsx";

import type {
  CategoryRule,
  RecurringExpense,
  Transaction,
} from "@/types/models";
import type { NewSpendInsight } from "@/hooks/use-insights-engine";
import { createCategoryPieData } from "@/lib/visualizations/builders";

export interface ExcelExportPayload {
  transactions: Transaction[];
  rules: CategoryRule[];
  recurringExpenses: RecurringExpense[];
  newSpendInsights: NewSpendInsight[];
}

export async function exportWorkbook({
  transactions,
  rules,
  recurringExpenses,
  newSpendInsights,
}: ExcelExportPayload) {
  const workbook = utils.book_new();

  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet(transactions.map(toRawTransactionRow)),
    "RawTransactions"
  );

  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet(
      transactions.map((transaction) => ({
        ...toRawTransactionRow(transaction),
        category: transaction.category ?? "",
        subcategory: transaction.subcategory ?? "",
        classificationSource: transaction.classificationSource ?? "",
      }))
    ),
    "CategorisedTransactions"
  );

  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet(
      recurringExpenses.map((expense) => ({
        merchant: expense.merchant,
        frequency: expense.frequency,
        averageAmount: expense.averageAmount,
        transactionIds: expense.transactionIds.join(", "),
      }))
    ),
    "RecurringExpenses"
  );

  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet(
      newSpendInsights.map(({ transaction }) => ({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category ?? "",
      }))
    ),
    "NewSpends"
  );

  const categorySummary = createCategoryPieData(transactions).map(
    ({ name, value }) => ({
      category: name,
      total: value,
    })
  );
  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet(categorySummary),
    "Summary"
  );

  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet(
      rules.map((rule) => ({
        keyword: rule.keyword,
        category: rule.category,
        subcategory: rule.subcategory ?? "",
        matchType: rule.matchType,
        createdAt: new Date(rule.createdAt).toISOString(),
      }))
    ),
    "CategoryRules"
  );

  const fileName = `spendsight-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.xlsx`;
  writeFileXLSX(workbook, fileName);
}

function toRawTransactionRow(transaction: Transaction) {
  return {
    id: transaction.id,
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    accountType: transaction.accountType,
    sourceFile: transaction.sourceFileName,
  };
}


