import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type {
  CategoryRule,
  RecurringExpense,
  Transaction,
} from "@/types/models";
import type { NewSpendInsight } from "@/hooks/use-insights-engine";
import { createCategoryPieData } from "@/lib/visualizations/builders";

export interface PdfExportPayload {
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  newSpendInsights: NewSpendInsight[];
  rules: CategoryRule[];
  chartElement?: HTMLElement | null;
}

export async function exportPdfReport({
  transactions,
  recurringExpenses,
  newSpendInsights,
  rules,
  chartElement,
}: PdfExportPayload) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait.
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();

  let cursorY = height - 40;

  const drawText = (text: string, options?: { size?: number; bold?: boolean }) => {
    const { size = 12, bold = false } = options ?? {};
    const textFont = bold ? headingFont : font;
    page.drawText(text, {
      x: 40,
      y: cursorY,
      size,
      font: textFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    cursorY -= size + 6;
  };

  drawText("SpendSight Report", { size: 20, bold: true });

  const totalSpend = transactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalCredits = transactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  drawText(`Total spend: ${formatCurrency(totalSpend)}`, { size: 12 });
  drawText(`Total credits: ${formatCurrency(totalCredits)}`, { size: 12 });
  drawText(
    `Transactions: ${transactions.length} · Recurring patterns: ${recurringExpenses.length} · New merchants: ${newSpendInsights.length}`,
    { size: 12 }
  );

  cursorY -= 10;
  drawText("Category summary", { size: 14, bold: true });

  const summary = createCategoryPieData(transactions).slice(0, 8);
  for (const item of summary) {
    drawText(`• ${item.name}: ${formatCurrency(item.value)}`, { size: 11 });
  }

  cursorY -= 10;
  drawText("Recent recurring expenses", { size: 14, bold: true });
  if (recurringExpenses.length === 0) {
    drawText("No recurring entries detected.", { size: 11 });
  } else {
    for (const expense of recurringExpenses.slice(0, 5)) {
      drawText(
        `• ${expense.merchant} (${expense.frequency}) · Avg ${formatCurrency(
          expense.averageAmount
        )}`,
        { size: 11 }
      );
    }
  }

  cursorY -= 10;
  drawText("New merchants", { size: 14, bold: true });
  if (newSpendInsights.length === 0) {
    drawText("No new merchants in this batch.", { size: 11 });
  } else {
    for (const insight of newSpendInsights.slice(0, 5)) {
      drawText(
        `• ${insight.transaction.description} on ${insight.transaction.date} · ${formatCurrency(
          insight.transaction.amount
        )}`,
        { size: 11 }
      );
    }
  }

  if (rules.length > 0) {
    cursorY -= 10;
    drawText("Saved rules", { size: 14, bold: true });
    for (const rule of rules.slice(0, 5)) {
      drawText(
        `• ${rule.keyword} → ${rule.category} (${rule.matchType})`,
        { size: 11 }
      );
    }
  }

  // Add chart snapshot if available and space remains.
  if (chartElement && cursorY > 200) {
    try {
      const dataUrl = await toPng(chartElement, {
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const pngImage = await pdfDoc.embedPng(dataUrl);
      const chartWidth = 515;
      const scale = chartWidth / pngImage.width;
      const chartHeight = pngImage.height * scale;
      const yPosition = Math.max(60, cursorY - chartHeight - 10);

      page.drawImage(pngImage, {
        x: 40,
        y: yPosition,
        width: chartWidth,
        height: chartHeight,
      });
    } catch (error) {
      console.warn("Unable to embed chart snapshot", error);
    }
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = pdfBytes.slice().buffer;
  const blob = new Blob([pdfBuffer], { type: "application/pdf" });
  const fileName = `spendsight-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.pdf`;
  saveAs(blob, fileName);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

