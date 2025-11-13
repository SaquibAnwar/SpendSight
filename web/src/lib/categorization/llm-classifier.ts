import type { Transaction } from "@/types/models";

export interface LLMClassification {
  id: string;
  category: string;
  subcategory?: string | null;
  confidence?: number;
}

export interface LLMResponse {
  classifications: LLMClassification[];
}

const ENV_API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY;
const ENV_ENDPOINT = process.env.NEXT_PUBLIC_LLM_ENDPOINT;
const DEFAULT_ENDPOINT = "/api/llm/categorise";

export async function classifyWithLLM(
  transactions: Transaction[],
  apiKeyOverride?: string,
  endpointOverride?: string
) {
  const endpoint = endpointOverride ?? ENV_ENDPOINT ?? DEFAULT_ENDPOINT;
  if (!endpoint) {
    return [] as LLMClassification[];
  }

  const apiKey = apiKeyOverride ?? ENV_API_KEY;

  const payload = {
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
    })),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  type LlmProxyResponse = LLMResponse & {
    error?: string;
    warning?: string;
  };
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }
  const data = parsed as LlmProxyResponse | null;

  if (!response.ok) {
    const llmMessage = data?.error ?? data?.warning;
    const message = llmMessage ?? (text || response.statusText);
    throw new Error(message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.classifications ?? [];
}

