import Dexie, { type EntityTable } from "dexie";

import type {
  CategoryRule,
  RecurringExpense,
  Transaction,
} from "@/types/models";

export class SpendSightDatabase extends Dexie {
  transactions!: EntityTable<Transaction, "id">;
  categoryRules!: EntityTable<CategoryRule, "id">;
  recurringExpenses!: EntityTable<RecurringExpense, "id">;

  constructor() {
    super("spendsight");

    this.version(1).stores({
      transactions:
        "id, date, description, amount, type, accountType, category, isRecurring, isNewSpend",
      categoryRules: "id, keyword, category, subcategory, matchType, createdAt",
      recurringExpenses: "id, merchant, frequency",
    });
  }
}

export const db = new SpendSightDatabase();


