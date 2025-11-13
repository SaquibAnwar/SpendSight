"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "spendsight.llmEndpoint";

export function useLlmEndpoint() {
  const [endpoint, setEndpointState] = useState("");

  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;
    const stored = storage.getItem(STORAGE_KEY);
    if (stored) {
      setEndpointState(stored);
    }
  }, []);

  const setEndpoint = useCallback((value: string) => {
    setEndpointState(value);
    const storage = getStorage();
    if (!storage) return;
    if (value) {
      storage.setItem(STORAGE_KEY, value);
    } else {
      storage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearEndpoint = useCallback(() => {
    setEndpoint("");
  }, [setEndpoint]);

  return { endpoint, setEndpoint, clearEndpoint };
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

