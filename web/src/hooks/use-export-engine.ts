import { useCallback, useState } from "react";

import type { CategoryRule, RecurringExpense, Transaction } from "@/types/models";
import type { NewSpendInsight } from "@/hooks/use-insights-engine";
import { exportWorkbook } from "@/lib/export/excel-exporter";
import { exportPdfReport } from "@/lib/export/pdf-exporter";

interface UseExportEngineOptions {
  transactions: Transaction[];
  rules: CategoryRule[];
  recurringExpenses: RecurringExpense[];
  newSpendInsights: NewSpendInsight[];
}

export function useExportEngine({
  transactions,
  rules,
  recurringExpenses,
  newSpendInsights,
}: UseExportEngineOptions) {
  const [status, setStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportExcel = useCallback(async () => {
    if (transactions.length === 0) {
      setStatus("No transactions available to export.");
      return;
    }

    setIsExporting(true);
    setStatus("Preparing Excel workbook...");
    try {
      await exportWorkbook({
        transactions,
        rules,
        recurringExpenses,
        newSpendInsights,
      });
      setStatus("Excel report generated successfully.");
    } catch (error) {
      console.error("Excel export failed", error);
      setStatus(
        error instanceof Error
          ? error.message
          : "Failed to generate Excel report."
      );
    } finally {
      setIsExporting(false);
    }
  }, [newSpendInsights, recurringExpenses, rules, transactions]);

  const exportPdf = useCallback(
    async (chartElement?: HTMLElement | null) => {
      if (transactions.length === 0) {
        setStatus("No transactions available to export.");
        return;
      }

      setIsExporting(true);
      setStatus("Creating PDF report...");
      try {
        await exportPdfReport({
          transactions,
          recurringExpenses,
          newSpendInsights,
          rules,
          chartElement,
        });
        setStatus("PDF report generated successfully.");
      } catch (error) {
        console.error("PDF export failed", error);
        setStatus(
          error instanceof Error ? error.message : "Failed to create PDF."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [newSpendInsights, recurringExpenses, rules, transactions]
  );

  return {
    exportExcel,
    exportPdf,
    isExporting,
    status,
    clearStatus: () => setStatus(null),
  };
}


