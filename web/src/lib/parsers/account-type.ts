import type { AccountType } from "@/types/models";

const BANK_KEYWORDS = ["bank", "savings", "checking", "account", "statement"];
const CREDIT_KEYWORDS = ["credit", "card", "cc", "visa", "mastercard"];

export function inferAccountType(fileName: string): AccountType {
  const normalized = fileName.toLowerCase();

  if (CREDIT_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "credit-card";
  }

  if (BANK_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "bank";
  }

  return "bank";
}


