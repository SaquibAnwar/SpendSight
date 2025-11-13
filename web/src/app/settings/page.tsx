"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useCategoryRules } from "@/hooks/use-category-rules";
import { useLlmPreference } from "@/hooks/use-llm-preference";
import { useLlmApiKey } from "@/hooks/use-llm-api-key";
import { useLlmEndpoint } from "@/hooks/use-llm-endpoint";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const { llmEnabled, setLlmEnabled } = useLlmPreference();
  const { apiKey, setApiKey, clearApiKey } = useLlmApiKey();
  const { endpoint, setEndpoint, clearEndpoint } = useLlmEndpoint();
  const { clearRules } = useCategoryRules();
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [endpointDraft, setEndpointDraft] = useState("");
  const [endpointMessage, setEndpointMessage] = useState<string | null>(null);

  useEffect(() => {
    setApiKeyDraft(apiKey);
  }, [apiKey]);

  useEffect(() => {
    setEndpointDraft(endpoint);
  }, [endpoint]);

  const handleClearData = async () => {
    if (
      !window.confirm(
        "This will remove saved rules and preferences from this device. Continue?"
      )
    ) {
      return;
    }
    setIsClearing(true);
    setMessage(null);
    try {
      await clearRules();
      window.localStorage.removeItem("spendsight.llmEnabled");
      clearApiKey();
      clearEndpoint();
      setMessage("Local SpendSight data cleared. Reloading…");
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      console.error("Failed to clear local data", error);
      setMessage("Unable to clear local data. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 pb-20 pt-12">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-muted-foreground">
          ← Back to dashboard
        </Link>
        <h1 className="text-3xl font-semibold">Privacy & settings</h1>
        <p className="text-sm text-muted-foreground">
          SpendSight keeps every statement on-device. Use these controls to manage
          optional AI usage and wipe local caches.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">LLM categorisation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Enable LLM assistance</p>
              <p className="text-xs text-muted-foreground">
                When enabled, uncategorised transactions can be sent through your
                configured LLM endpoint. No data is stored by SpendSight.
              </p>
            </div>
            <Switch
              checked={llmEnabled}
              onCheckedChange={(value) => setLlmEnabled(Boolean(value))}
            />
          </div>
          <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-4">
            <div>
              <p className="text-sm font-medium">LLM endpoint</p>
              <p className="text-xs text-muted-foreground">
                Provide the HTTPS endpoint for your LLM proxy. Requests are sent directly from the browser.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Input
                placeholder="https://llm.example.com/categorise"
                value={endpointDraft}
                onChange={(event) => setEndpointDraft(event.target.value)}
                className="sm:max-w-sm"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEndpoint(endpointDraft.trim());
                  setEndpointMessage("Endpoint saved.");
                  setTimeout(() => setEndpointMessage(null), 2000);
                }}
              >
                Save endpoint
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEndpointDraft("");
                  clearEndpoint();
                  setEndpointMessage("Endpoint cleared.");
                  setTimeout(() => setEndpointMessage(null), 2000);
                }}
              >
                Clear
              </Button>
            </div>
            {endpointMessage && (
              <p className="text-xs text-muted-foreground">{endpointMessage}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-4">
            <div>
              <p className="text-sm font-medium">LLM API key</p>
              <p className="text-xs text-muted-foreground">
                Stored locally in this browser only. Provide a key if your LLM proxy
                requires authentication.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKeyDraft}
                onChange={(event) => setApiKeyDraft(event.target.value)}
                className="sm:max-w-sm"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setApiKey(apiKeyDraft.trim());
                  setApiMessage("API key saved locally.");
                  setTimeout(() => setApiMessage(null), 2000);
                }}
              >
                Save key
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setApiKeyDraft("");
                  clearApiKey();
                  setApiMessage("API key cleared.");
                  setTimeout(() => setApiMessage(null), 2000);
                }}
              >
                Clear key
              </Button>
            </div>
            {apiMessage && (
              <p className="text-xs text-muted-foreground">{apiMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Local data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            SpendSight stores parsed rules, cached preferences, and generated reports
            in your browser. Transactions are purged when you close the tab. Use the
            button below to clear saved rules and preferences instantly.
          </p>
          <Button
            variant="destructive"
            onClick={() => void handleClearData()}
            disabled={isClearing}
          >
            {isClearing ? "Clearing…" : "Clear local data"}
          </Button>
          {message && (
            <p className="text-xs text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Offline availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            After the initial load, SpendSight runs fully offline. All parsing,
            categorisation, and export functionality works without network access.
          </p>
          <p>
            To ensure offline readiness, keep this tab open after loading or install
            it as a PWA using your browser&apos;s “Add to Home Screen” option.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}


