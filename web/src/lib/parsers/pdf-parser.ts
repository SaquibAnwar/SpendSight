import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type {
  TextContent,
  TextItem,
} from "pdfjs-dist/types/src/display/api";

import { inferAccountType } from "./account-type";
import { normalizeRecord } from "./normalize";
import type {
  ParseContext,
  ParseResult,
  ParseWarning,
  StatementMetadata,
} from "./types";
import type { Transaction } from "@/types/models";

const WORKER_PATH = "/vendor/pdf.worker.min.mjs";

GlobalWorkerOptions.workerSrc = WORKER_PATH;

export async function parsePdf(context: ParseContext): Promise<ParseResult> {
  const accountType =
    context.accountType ?? inferAccountType(context.file.name);

  const arrayBuffer = await context.file.arrayBuffer();
  const document = await getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: true,
  }).promise;

  const warnings: ParseWarning[] = [];
  const rows: Record<string, unknown>[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const lines = groupLines(textContent);

    for (const line of lines) {
      const record = parseLine(line);
      if (record) {
        rows.push(record);
      } else {
        warnings.push({
          message: "Unable to interpret PDF row.",
          context: { line, pageNumber },
        });
      }
    }
  }

  const transactions: Transaction[] = [];
  for (const row of rows) {
    const { transaction, warnings: rowWarnings } = normalizeRecord(row, {
      fileName: context.file.name,
      accountType,
    });
    warnings.push(...rowWarnings);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return { transactions, warnings, metadata: createMetadata(transactions, accountType) };
}

function groupLines(textContent: TextContent): string[] {
  const lines = new Map<number, { y: number; items: { x: number; str: string }[] }>();

  for (const item of textContent.items) {
    const textItem = item as TextItem;
    const text = textItem.str?.trim();
    if (!text) continue;

    const [, , , , x, y] = textItem.transform;
    const roundedY = Math.round(y);
    if (!lines.has(roundedY)) {
      lines.set(roundedY, { y: roundedY, items: [] });
    }
    lines.get(roundedY)!.items.push({ x, str: textItem.str });
  }

  const sorted = Array.from(lines.values()).sort((a, b) => b.y - a.y);
  return sorted
    .map((line) =>
      line.items
        .sort((a, b) => a.x - b.x)
        .map((item) => item.str)
        .join(" ")
        .replace(/\s{2,}/g, " ")
        .trim()
    )
    .filter(Boolean);
}

function parseLine(line: string): Record<string, unknown> | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const segments = trimmed.split(/\s{2,}|\t+/).filter(Boolean);
  if (segments.length < 2) {
    return null;
  }

  let amountIndex = -1;
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    if (/[-+]?\d[\d,]*(?:\.\d{1,2})?$/.test(segments[i].replace(/[₹$€£]/g, ""))) {
      amountIndex = i;
      break;
    }
  }

  if (amountIndex < 1) {
    return null;
  }

  const date = segments[0];
  const amount = segments[amountIndex];
  const descriptionParts = segments.slice(1, amountIndex);
  const potentialType = segments[amountIndex + 1];

  if (descriptionParts.length === 0) {
    return null;
  }

  return {
    date,
    description: descriptionParts.join(" "),
    amount,
    type: potentialType,
  };
}

function createMetadata(
  transactions: Transaction[],
  accountType: ParseContext["accountType"]
): StatementMetadata {
  const bankName =
    transactions.find((transaction) => transaction.bankName)?.bankName ?? null;
  const accountNumber =
    transactions.find((transaction) => transaction.accountNumber)
      ?.accountNumber ?? null;

  return {
    accountType: accountType ?? "bank",
    bankName,
    accountNumber,
  };
}

