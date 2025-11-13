import { NextResponse } from "next/server";

import type { Transaction } from "@/types/models";

const OPENAI_API_BASE =
  process.env.OPENAI_API_BASE?.replace(/\/$/, "") ?? "https://api.openai.com";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      transactions?: Transaction[];
    };

    if (!body?.transactions || !Array.isArray(body.transactions)) {
      return NextResponse.json(
        { error: "Invalid payload. Expected { transactions: Transaction[] }." },
        { status: 400 }
      );
    }

    if (body.transactions.length === 0) {
      return NextResponse.json({ classifications: [] });
    }

    const authHeader = request.headers.get("authorization") ?? "";
    const apiKey =
      authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length).trim()
        : process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key missing. Supply NEXT_PUBLIC_LLM_API_KEY in Settings or configure OPENAI_API_KEY on the server.",
        },
        { status: 401 }
      );
    }

    const prompt = buildPrompt(body.transactions);

    const completionResponse = await fetch(
      `${OPENAI_API_BASE}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are a financial transaction categorisation assistant. You respond only with valid JSON.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!completionResponse.ok) {
      const errorText = await completionResponse.text();
      return NextResponse.json(
        { error: `OpenAI request failed: ${errorText}` },
        { status: completionResponse.status }
      );
    }

    const completionData = (await completionResponse.json()) as {
      choices?: Array<{
        message?: { content?: string };
      }>;
    };

    const content =
      completionData.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      return NextResponse.json({
        classifications: [],
        warning: "LLM returned an empty response.",
      });
    }

    const classifications = parseClassification(content, body.transactions);

    return NextResponse.json({ classifications });
  } catch (error) {
    console.error("LLM proxy error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected LLM proxy error.",
      },
      { status: 500 }
    );
  }
}

function buildPrompt(transactions: Transaction[]) {
  const lines = transactions.map((transaction) => {
    const amount =
      transaction.type === "debit"
        ? `-${transaction.amount.toFixed(2)}`
        : transaction.amount.toFixed(2);
    return `${transaction.id} | ${transaction.description} | ${amount} | ${transaction.type}`;
  });

  return [
    "Categorise the following transactions. Each line is formatted as:",
    "`id | description | signed_amount | type` (type is debit or credit).",
    "",
    "Return JSON array matching this TypeScript type:",
    `[{ "id": string, "category": string, "subcategory": string | null, "confidence": number }]`,
    "",
    "Categories should be short phrases such as:",
    "  - Food & Dining, Transport, Groceries, Subscriptions, Entertainment, Utilities, Housing, Healthcare, Income, Transfers, Other.",
    "Use null for subcategory when unsure.",
    "",
    "Transactions:",
    ...lines,
  ].join("\n");
}

function parseClassification(
  rawContent: string,
  transactions: Transaction[]
) {
  const jsonText = extractJson(rawContent);
  if (!jsonText) {
    throw new Error(
      `LLM did not return JSON. Received: ${rawContent.slice(0, 120)}`
    );
  }

  let parsed: Array<{
    id: string;
    category?: string;
    subcategory?: string | null;
    confidence?: number;
  }>;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      `Unable to parse LLM JSON response: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  const fallback = new Map(transactions.map((txn) => [txn.id, txn]));

  return parsed
    .filter((item) => item && typeof item.id === "string")
    .map((item) => ({
      id: item.id,
      category: item.category ?? "Uncategorised",
      subcategory: item.subcategory ?? null,
      confidence:
        typeof item.confidence === "number"
          ? clampConfidence(item.confidence)
          : 0.5,
    }))
    .filter((item) => fallback.has(item.id));
}

function extractJson(content: string) {
  const jsonMatch = content.match(/```json([\s\S]*?)```/i);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  const bracketMatch = content.match(/\[[\s\S]*]/);
  if (bracketMatch) {
    return bracketMatch[0];
  }
  return null;
}

function clampConfidence(value: number) {
  if (Number.isNaN(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

