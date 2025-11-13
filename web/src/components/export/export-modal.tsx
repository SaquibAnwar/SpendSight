"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportExcel: () => void;
  onExportPdf: (chartElement?: HTMLElement | null) => void;
  isExporting: boolean;
  status: string | null;
}

export function ExportModal({
  open,
  onOpenChange,
  onExportExcel,
  onExportPdf,
  isExporting,
  status,
}: ExportModalProps) {
  const handlePdf = () => {
    const chartElement = document.getElementById("visualization-dashboard");
    onExportPdf(chartElement ?? undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export report</DialogTitle>
          <DialogDescription>
            Generate an offline copy of your transactions, insights, and charts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
            <h3 className="text-sm font-semibold">Excel workbook (.xlsx)</h3>
            <p className="text-xs text-muted-foreground">
              Includes raw transactions, categorised view, recurring insights,
              new merchants, summaries, and saved rules.
            </p>
            <Button
              className="mt-3"
              disabled={isExporting}
              onClick={onExportExcel}
            >
              {isExporting ? "Preparing..." : "Export Excel"}
            </Button>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
            <h3 className="text-sm font-semibold">PDF report (.pdf)</h3>
            <p className="text-xs text-muted-foreground">
              Summary of totals, recurring expenses, new merchants, rules, and
              chart snapshots when available.
            </p>
            <Button className="mt-3" disabled={isExporting} onClick={handlePdf}>
              {isExporting ? "Rendering..." : "Export PDF"}
            </Button>
          </div>
          {status && (
            <p className="text-xs text-muted-foreground">
              Status: {status}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


