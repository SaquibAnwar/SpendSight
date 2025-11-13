"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "spendsight.llmApiKey";

export function useLlmApiKey() {
  const [apiKey, setApiKeyState] = useState("");

  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;
    const stored = storage.getItem(STORAGE_KEY);
    if (stored) {
      setApiKeyState(stored);
    }
  }, []);

  const setApiKey = useCallback((value: string) => {
    setApiKeyState(value);
    const storage = getStorage();
    if (storage) {
      if (value) {
        storage.setItem(STORAGE_KEY, value);
      } else {
        storage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKey("");
  }, [setApiKey]);

  return { apiKey, setApiKey, clearApiKey };
}

function getStorage() {
  if (typeof window === "undefined") return null;
  const storage = window.localStorage;
  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function"
  ) {
    return null;
  }
  return storage;
}

