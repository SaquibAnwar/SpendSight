import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/lib/db";
import type { CategoryRule } from "@/types/models";

export interface CreateRuleInput {
  keyword: string;
  category: string;
  subcategory?: string | null;
  matchType: CategoryRule["matchType"];
}

export function useCategoryRules() {
  const rules = useLiveQuery(
    () =>
      db.categoryRules.orderBy("createdAt").reverse().toArray(),
    [],
    []
  );

  const addRule = useCallback(async (input: CreateRuleInput) => {
    const rule: CategoryRule = {
      id: crypto.randomUUID(),
      keyword: input.keyword.trim(),
      category: input.category.trim(),
      subcategory: input.subcategory?.trim() || null,
      matchType: input.matchType,
      createdAt: Date.now(),
    };

    await db.categoryRules.add(rule);
    return rule;
  }, []);

  const removeRule = useCallback(async (id: string) => {
    await db.categoryRules.delete(id);
  }, []);

  const clearRules = useCallback(async () => {
    await db.categoryRules.clear();
  }, []);

  return {
    rules: rules ?? [],
    isLoading: !rules,
    addRule,
    removeRule,
    clearRules,
  };
}


