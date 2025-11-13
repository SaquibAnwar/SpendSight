"use client";

import { useCallback, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => Promise<void> | void;
  isParsing?: boolean;
  accept?: Accept;
  selectedFiles?: File[];
}

const DEFAULT_ACCEPT: Accept = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/pdf": [".pdf"],
};

export function FileDropzone({
  onFilesSelected,
  isParsing = false,
  accept = DEFAULT_ACCEPT,
  selectedFiles = [],
}: FileDropzoneProps) {
  const [isDragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      await onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      void handleFiles(acceptedFiles);
    },
    [handleFiles]
  );

  const { getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      accept,
      onDragEnter: () => setDragging(true),
      onDragLeave: () => setDragging(false),
      disabled: isParsing,
      multiple: true,
    });

  return (
    <Card
      className={cn(
        "border-dashed transition-colors",
        isDragAccept && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/10"
      )}
    >
      <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <div
          {...getRootProps()}
          className={cn(
            "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/70 bg-muted/30 px-8 py-10 transition-all",
            isDragging && "border-primary/80 bg-primary/10",
            isParsing && "pointer-events-none opacity-60"
          )}
        >
          <input {...getInputProps()} />
          <p className="text-lg font-medium">
            Drag & drop statements here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, CSV, XLS, XLSX. Files stay on your device.
          </p>
          <Button type="button" size="sm" disabled={isParsing}>
            Select files
          </Button>
        </div>
        {selectedFiles.length > 0 && (
          <div className="w-full text-left">
            <p className="text-sm font-medium">Files selected</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {selectedFiles.map((file) => (
                <li key={`${file.name}-${file.size}`} className="truncate">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

