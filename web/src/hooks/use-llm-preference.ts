import { useEffect, useState } from "react";

const STORAGE_KEY = "spendsight.llmEnabled";

export function useLlmPreference() {
  const [llmEnabled, setLlmEnabled] = useState<boolean>(false);

  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;

    const stored = storage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setLlmEnabled(stored === "true");
    }

    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue !== null) {
        setLlmEnabled(event.newValue === "true");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const update = (enabled: boolean) => {
    setLlmEnabled(enabled);
    const storage = getStorage();
    storage?.setItem(STORAGE_KEY, String(enabled));
  };

  return { llmEnabled, setLlmEnabled: update };
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

