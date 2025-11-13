import { useCallback, useEffect, useMemo, useState } from "react";

import type { AccountType, Transaction } from "@/types/models";
import { applyDefaultCategories } from "@/lib/categorization/default-categories";
import {
  parseStatementFiles,
  type ParseResult,
  type StatementFormat,
} from "@/lib/parsers";
import type { ParseWarning } from "@/lib/parsers/types";

export interface StatementParseSummary {
  fileName: string;
  format: StatementFormat;
  transactionCount: number;
  warnings: ParseWarning[];
  accountType: AccountType;
  bankName: string | null;
  accountNumber: string | null;
}

interface StatementParserState {
  summaries: StatementParseSummary[];
  transactions: Transaction[];
  warnings: ParseWarning[];
}

const STORAGE_KEY = "spendsight.parserState";

function createDefaultState(): StatementParserState {
  return {
    summaries: [],
    transactions: [],
    warnings: [],
  };
}

export function useStatementParser() {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<StatementParserState>(createDefaultState);

  useEffect(() => {
    const storage = getSessionStorage();
    if (!storage) return;
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as {
        state: StatementParserState;
        error: string | null;
      };
      if (parsed?.state) {
        setState(parsed.state);
      }
      if (parsed?.error) {
        setError(parsed.error);
      }
    } catch {
      storage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const storage = getSessionStorage();
    if (!storage) return;
    const isEmpty =
      state.summaries.length === 0 &&
      state.transactions.length === 0 &&
      state.warnings.length === 0 &&
      !error;
    if (isEmpty) {
      storage.removeItem(STORAGE_KEY);
      return;
    }
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state, error })
    );
  }, [state, error]);

  const parseFiles = useCallback(async (files: File[]) => {
    setIsParsing(true);
    setError(null);
    try {
      const results = await parseStatementFiles(files);
      const summaries = results.map(buildSummary);
      const allTransactions = results.flatMap(
        (result) => result.transactions
      );
      const warnings = results.flatMap((result) => result.warnings);
      const seededTransactions = applyDefaultCategories(allTransactions);
      setState({ summaries, transactions: seededTransactions, warnings });
      if (allTransactions.length === 0) {
        // Try to provide helpful error message based on warnings
        const columnWarnings = warnings.filter((w) => 
          w.message.includes("Available columns:")
        );
        
        if (columnWarnings.length > 0 && columnWarnings[0].context?.availableColumns) {
          const cols = columnWarnings[0].context.availableColumns as string;
          setError(
            `No transactions were detected. Found columns: ${cols}. Please ensure your file has columns for Date, Description, and either Amount or Withdrawal/Deposit.`
          );
        } else {
          setError(
            "No transactions were detected. Please confirm the statement includes clear Date, Description, and Withdrawal/Deposit columns."
          );
        }
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Statement parsing failed", err);
      setError("Unable to parse statements. Please verify the file format.");
      setState({
        summaries: [],
        transactions: [],
        warnings: [],
      });
    } finally {
      setIsParsing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setState(createDefaultState());
    setError(null);
    const storage = getSessionStorage();
    storage?.removeItem(STORAGE_KEY);
  }, []);

  const setTransactions = useCallback(
    (
      updater:
        | Transaction[]
        | ((current: Transaction[]) => Transaction[])
    ) => {
      setState((prev) => {
        const nextTransactions =
          typeof updater === "function"
            ? updater(prev.transactions)
            : updater;
        return {
          ...prev,
          transactions: nextTransactions,
        };
      });
    },
    []
  );

  const status = useMemo(
    () => ({
      isParsing,
      error,
      ...state,
      hasWarnings: state.warnings.length > 0,
    }),
    [isParsing, error, state]
  );

  return {
    ...status,
    parseFiles,
    reset,
    setTransactions,
  };
}

function buildSummary(
  result: ParseResult & { format: StatementFormat; fileName: string }
): StatementParseSummary {
  return {
    fileName: result.fileName,
    format: result.format,
    transactionCount: result.transactions.length,
    warnings: result.warnings,
    accountType: result.metadata.accountType,
    bankName: result.metadata.bankName,
    accountNumber: result.metadata.accountNumber,
  };
}

function getSessionStorage() {
  if (typeof window === "undefined") return null;
  const storage = window.sessionStorage;
  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function"
  ) {
    return null;
  }
  return storage;
}

