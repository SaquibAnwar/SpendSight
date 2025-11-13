"use client";

import { useCallback, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategorizationWorkspace } from "@/components/categorization/categorization-workspace";
import { InsightsPanel } from "@/components/insights/insights-panel";
import { VisualizationDashboard } from "@/components/visualizations/visualization-dashboard";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { ParsePreview } from "@/components/upload/parse-preview";
import { ExportModal } from "@/components/export/export-modal";
import { Progress } from "@/components/ui/progress";
import { useStatementParser } from "@/hooks/use-statement-parser";
import { useInsightsEngine } from "@/hooks/use-insights-engine";
import { useCategoryRules } from "@/hooks/use-category-rules";
import { useExportEngine } from "@/hooks/use-export-engine";
import { useLlmPreference } from "@/hooks/use-llm-preference";
import { useLlmApiKey } from "@/hooks/use-llm-api-key";
import { useLlmEndpoint } from "@/hooks/use-llm-endpoint";

export default function Home() {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [parseProgress, setParseProgress] = useState(0);
  const {
    parseFiles,
    isParsing,
    transactions,
    summaries,
    warnings,
    error,
    reset,
    setTransactions,
  } = useStatementParser();
  const { rules, addRule, removeRule, clearRules } = useCategoryRules();

  const handleFiles = useCallback(
    async (files: File[]) => {
      setPendingFiles(files);
      if (transactions.length > 0 || summaries.length > 0) {
        reset();
      }
    },
    [reset, summaries.length, transactions.length]
  );

  const handleClearSelection = useCallback(() => {
    setPendingFiles([]);
    setParseProgress(0);
  }, []);

  const handleClearDashboard = useCallback(() => {
    setPendingFiles([]);
    setParseProgress(0);
    reset();
  }, [reset]);

  const [isExportModalOpen, setExportModalOpen] = useState(false);

  const hasTransactions = transactions.length > 0;

  const { recurringExpenses, newSpendInsights } = useInsightsEngine(
    transactions,
    setTransactions
  );

  const {
    exportExcel,
    exportPdf,
    isExporting,
    status: exportStatus,
    clearStatus,
  } = useExportEngine({
    transactions,
    rules,
    recurringExpenses,
    newSpendInsights,
  });
  const { llmEnabled } = useLlmPreference();
  const { apiKey: llmApiKey } = useLlmApiKey();
  const { endpoint: llmEndpoint } = useLlmEndpoint();
  const resolvedLlmEndpoint =
    llmEndpoint || process.env.NEXT_PUBLIC_LLM_ENDPOINT;
  const llmConfigured = Boolean(resolvedLlmEndpoint);

  const handleParse = useCallback(async () => {
    if (pendingFiles.length === 0 || isParsing) return;
    setParseProgress(20);
    try {
      await parseFiles(pendingFiles);
      setParseProgress(100);
    } catch {
      setParseProgress(0);
    } finally {
      setTimeout(() => setParseProgress(0), 600);
    }
  }, [isParsing, parseFiles, pendingFiles]);

  return (
    <main className="flex min-h-screen w-full justify-center pb-20 pt-12">
      <div className="flex w-full max-w-5xl flex-col gap-10 px-6">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-primary">
              SpendSight
            </span>
            <h1 className="text-3xl font-semibold md:text-4xl">
              Privacy-first statement analysis
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Upload your bank or credit card statements in PDF, CSV, or Excel
              format. Everything is parsed locally in your browser—no data leaves
              your device.
            </p>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Upload statements</CardTitle>
              <div className="flex items-center gap-2">
                {hasTransactions && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      clearStatus();
                      setExportModalOpen(true);
                    }}
                  >
                    Export report
                  </Button>
                )}
                {hasTransactions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClearDashboard()}
                  >
                    Clear dashboard
                  </Button>
                )}
                {pendingFiles.length > 0 && !hasTransactions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    Clear selection
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileDropzone
                onFilesSelected={handleFiles}
                isParsing={isParsing}
                selectedFiles={pendingFiles}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {pendingFiles.length === 0
                    ? "Select statements to enable parsing."
                    : `${pendingFiles.length} file${
                        pendingFiles.length > 1 ? "s" : ""
                      } ready to parse.`}
                </div>
                <Button
                  onClick={() => void handleParse()}
                  disabled={pendingFiles.length === 0 || isParsing}
                >
                  {isParsing ? "Parsing…" : "Parse statements"}
                </Button>
              </div>
              {(isParsing || parseProgress > 0) && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">
                    {isParsing ? "Parsing statements…" : "Finalising…"}
                  </span>
                  <Progress
                    value={
                      isParsing ? Math.max(parseProgress, 25) : parseProgress
                    }
                    aria-label="Parsing progress"
                  />
                </div>
              )}
              {error && (
                <Alert className="border-destructive/60 bg-destructive/5 text-destructive">
                  <AlertTitle>Parsing failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </section>

        {hasTransactions && (
          <ParsePreview
            summaries={summaries}
            transactions={transactions}
            warnings={warnings}
            hasWarnings={warnings.length > 0}
            onReset={handleClearDashboard}
          />
        )}

        {hasTransactions && (
          <CategorizationWorkspace
            transactions={transactions}
            setTransactions={setTransactions}
            rules={rules}
            onAddRule={addRule}
            onRemoveRule={removeRule}
            onClearRules={clearRules}
            llmEnabled={llmEnabled}
            llmConfigured={llmConfigured}
            llmApiKey={llmApiKey}
            llmEndpoint={resolvedLlmEndpoint}
          />
        )}

        {hasTransactions && (
          <InsightsPanel
            recurringExpenses={recurringExpenses}
            newSpendInsights={newSpendInsights}
          />
        )}

        {hasTransactions && (
          <VisualizationDashboard transactions={transactions} />
        )}

        <ExportModal
          open={isExportModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              clearStatus();
            }
            setExportModalOpen(open);
          }}
          onExportExcel={exportExcel}
          onExportPdf={exportPdf}
          isExporting={isExporting}
          status={exportStatus}
        />
      </div>
    </main>
  );
}
