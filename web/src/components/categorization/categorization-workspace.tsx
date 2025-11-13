"use client";

import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RuleManager } from "@/components/categorization/rule-manager";
import {
  TransactionReviewTable,
  type FilterOption,
} from "@/components/categorization/transaction-review-table";
import type { CreateRuleInput } from "@/hooks/use-category-rules";
import type { CategoryRule, Transaction } from "@/types/models";
import { applyRulesToTransactions } from "@/lib/categorization/rule-engine";
import {
  classifyWithLLM,
  type LLMClassification,
} from "@/lib/categorization/llm-classifier";

interface CategorizationWorkspaceProps {
  transactions: Transaction[];
  setTransactions: (
    updater: Transaction[] | ((current: Transaction[]) => Transaction[])
  ) => void;
  rules: CategoryRule[];
  onAddRule: (input: CreateRuleInput) => Promise<CategoryRule>;
  onRemoveRule: (id: string) => Promise<void>;
  onClearRules: () => Promise<void>;
  llmEnabled: boolean;
  llmConfigured: boolean;
  llmApiKey?: string;
  llmEndpoint?: string;
}

export function CategorizationWorkspace({
  transactions,
  setTransactions,
  rules,
  onAddRule,
  onRemoveRule,
  onClearRules,
  llmEnabled,
  llmConfigured,
  llmApiKey,
  llmEndpoint,
}: CategorizationWorkspaceProps) {
  const [filter, setFilter] = useState<FilterOption>("uncategorized");
  const [llmState, setLlmState] = useState<{
    isRunning: boolean;
    error: string | null;
  }>({ isRunning: false, error: null });
  const [suggestedRule, setSuggestedRule] = useState<CreateRuleInput | null>(
    null
  );

  // Apply rules whenever transactions or rule set changes.
  useEffect(() => {
    if (transactions.length === 0) return;
    if (rules.length === 0) return;

    const results = applyRulesToTransactions(transactions, rules);
    const nextTransactions = results.map((result) => result.transaction);

    const needsUpdate = transactions.some((transaction, index) => {
      const updated = nextTransactions[index];
      return (
        transaction.category !== updated.category ||
        transaction.subcategory !== updated.subcategory ||
        transaction.classificationSource !== updated.classificationSource ||
        transaction.classificationConfidence !== updated.classificationConfidence
      );
    });

    if (needsUpdate) {
      setTransactions(nextTransactions);
    }
  }, [rules, setTransactions, transactions]);

  const uncategorizedCount = useMemo(
    () => transactions.filter((transaction) => !transaction.category).length,
    [transactions]
  );

  const handleManualUpdate = (
    id: string,
    updates: Pick<
      Transaction,
      "category" | "subcategory" | "classificationSource" | "classificationConfidence"
    >
  ) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              ...updates,
            }
          : transaction
      )
    );
  };

  const handleCreateRule = (transaction: Transaction) => {
    setSuggestedRule({
      keyword: transaction.description.split(" ").slice(0, 2).join(" "),
      category: transaction.category ?? "",
      subcategory: transaction.subcategory ?? "",
      matchType: "contains",
    });
  };

  const handleLlmClassification = async () => {
    if (!llmConfigured) {
      setLlmState({
        isRunning: false,
        error:
          "No LLM endpoint configured. Provide an endpoint in Settings to enable classifications.",
      });
      return;
    }

    if (!llmEnabled) {
      setLlmState({
        isRunning: false,
        error: "LLM classification is disabled in settings.",
      });
      return;
    }

    const pending = transactions.filter((transaction) => !transaction.category);
    if (pending.length === 0) {
      setLlmState({ isRunning: false, error: "No uncategorised transactions." });
      return;
    }

    setLlmState({ isRunning: true, error: null });
    try {
      const classifications = await classifyWithLLM(
        pending,
        llmApiKey,
        llmEndpoint
      );
      if (classifications.length === 0) {
        setLlmState({
          isRunning: false,
          error: "LLM returned no classifications for these transactions.",
        });
        return;
      }

      setTransactions((prev) =>
        prev.map((transaction) => {
          const result = classifications.find(
            (classification: LLMClassification) =>
              classification.id === transaction.id
          );
          if (!result) return transaction;
          return {
            ...transaction,
            category: result.category,
            subcategory: result.subcategory ?? null,
            classificationConfidence: result.confidence ?? 0.75,
            classificationSource: "llm",
          };
        })
      );
      setLlmState({ isRunning: false, error: null });
    } catch (error) {
      console.error("LLM classification failed", error);
      setLlmState({
        isRunning: false,
        error:
          error instanceof Error ? error.message : "Unexpected LLM error occurred.",
      });
    }
  };

  return (
    <section className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-6">
          <div>
            <h2 className="text-2xl font-semibold">Categorise transactions</h2>
            <p className="text-sm text-muted-foreground">
              Apply saved rules, classify remaining spends, and capture new rules
              for future uploads.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:text-right">
            <span>Uncategorised: {uncategorizedCount}</span>
            {llmEnabled && llmConfigured ? (
              <Button
                variant="secondary"
                disabled={llmState.isRunning}
                onClick={() => void handleLlmClassification()}
              >
                {llmState.isRunning ? "Requesting LLM..." : "Classify with LLM"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {llmEnabled && llmConfigured && llmState.error && (
        <Alert className="border-destructive/60 bg-destructive/10 text-destructive">
          <AlertTitle>LLM classification</AlertTitle>
          <AlertDescription>{llmState.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex w-full flex-col gap-6">
        <RuleManager
          rules={rules}
          onAddRule={async (input) => {
            await onAddRule(input);
            setSuggestedRule(null);
          }}
          onRemoveRule={(id) => onRemoveRule(id)}
          onClearRules={() => onClearRules()}
          suggestedRule={suggestedRule}
        />
        <TransactionReviewTable
          transactions={transactions}
          filter={filter}
          onFilterChange={setFilter}
          onUpdateTransaction={handleManualUpdate}
          onRequestRule={handleCreateRule}
        />
      </div>
    </section>
  );
}

