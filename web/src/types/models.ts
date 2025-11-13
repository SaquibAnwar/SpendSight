export type AccountType = "bank" | "credit-card";
export type TransactionType = "debit" | "credit";

export interface Transaction {
  id: string;
  date: string;
  rawDate: string;
  description: string;
  amount: number;
  type: TransactionType;
  accountType: AccountType;
  sourceFileName: string;
  category?: string | null;
  subcategory?: string | null;
  isRecurring?: boolean;
  isNewSpend?: boolean;
  classificationConfidence?: number;
  classificationSource?: "rule" | "llm" | "manual" | "none";
}

export interface CategoryRule {
  id: string;
  keyword: string;
  category: string;
  subcategory?: string | null;
  matchType: "contains" | "startsWith" | "regex";
  createdAt: number;
}

export type Frequency = "monthly" | "weekly" | "custom";

export interface RecurringExpense {
  id: string;
  merchant: string;
  frequency: Frequency;
  transactionIds: string[];
  averageAmount: number;
  amountPattern: number[];
}


