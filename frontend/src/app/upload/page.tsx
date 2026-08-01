"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

type Step = "select-file" | "map-columns";

interface UploadResult {
  datasetId: string;
  filename: string;
  columns: string[];
}

interface MappingResult {
  recordsCreated: number;
  rowErrors: {
    rowIndex: number;
    reason: string;
  }[];
}

function ColumnPicker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a column" />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


export default function UploadPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("select-file");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [uploadResult, setUploadResult] =
    useState<UploadResult | null>(null);

  const [dateColumn, setDateColumn] = useState("");
  const [productColumn, setProductColumn] = useState("");
  const [revenueColumn, setRevenueColumn] = useState("");

  const [isMapping, setIsMapping] = useState(false);

    const handleUpload = async () => {
    if (!file) {
        toast.error("Please select a CSV file first");
        return;
    }

    if (!file.name.endsWith(".csv")) {
        toast.error("Only CSV files are allowed");
        return;
    }

    setIsUploading(true);

    try {
        const formData = new FormData();
        formData.append("file", file);

        const result = await authFetch<UploadResult>("/api/datasets/upload", {
        method: "POST",
        body: formData,
        });

        setUploadResult(result);
        setStep("map-columns");

        toast.success(
        `Uploaded ${result.filename} — found ${result.columns.length} columns`
        );
    } catch (error) {
        toast.error(
        error instanceof ApiClientError
            ? error.message
            : "Upload failed"
        );
    } finally {
        setIsUploading(false);
    }
    };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile) {
      return;
    }

    if (!droppedFile.name.endsWith(".csv")) {
      toast.error("Only CSV files are allowed");
      return;
    }

    setFile(droppedFile);
  };

  const handleSaveMapping = async () => {
    if (!uploadResult) return;
    if (!dateColumn || !productColumn || !revenueColumn) {
      toast.error("Please select all 3 columns");
      return;
    }
    if (
    new Set([dateColumn, productColumn, revenueColumn]).size !== 3
    ) {
    toast.error("Please select different columns");
    return;
    }
    setIsMapping(true);
    try {
      const result = await authFetch<MappingResult>(
        `/api/datasets/${uploadResult.datasetId}/mapping`,
        {
          method: "POST",
          body: { dateColumn, productColumn, revenueColumn },
        },
      );
      if (result.rowErrors.length > 0) {
        toast.warning(
          `${result.recordsCreated} rows imported, ${result.rowErrors.length} row(s) skipped`,
        );
      } else {
        toast.success(`${result.recordsCreated} rows imported successfully`);
      }
      router.push(`/reports/${uploadResult.datasetId}`);
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Mapping failed");
    } finally {
      setIsMapping(false);
    }
  };


  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-signal-grid p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="font-display text-xl">Upload a dataset</CardTitle>
          {step === "select-file" && (
            <p className="text-sm text-muted-foreground">
              CSV files only — we&apos;ll detect the columns for you.
            </p>
          )}
        </CardHeader>

        <CardContent>
        {step === "select-file" ? (
            <div className="space-y-4">
            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-secondary/40 px-4 py-10 text-center transition-colors hover:border-primary/50 hover:bg-secondary",
                  isDragging && "border-primary bg-secondary",
                )}
            >
                <span className="text-sm font-medium text-foreground">
                  {file ? file.name : "Choose a CSV file"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file ? "Click to choose a different file" : "or drag and drop"}
                </span>
                <input
                    type="file"
                    accept=".csv"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="hidden"
                />
            </label>

            <Button
                onClick={handleUpload}
                disabled={isUploading || !file}
                className="w-full"
            >
                {isUploading ? "Uploading..." : "Upload CSV"}
            </Button>
            </div>
        ) : (
            <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Found {uploadResult?.columns.length ?? 0} columns in{" "}
                <strong className="text-foreground">{uploadResult?.filename ?? "dataset"}</strong>. Tell us which one is which:
            </p>

            <div className="space-y-3">
                <ColumnPicker
                label="Date column"
                value={dateColumn}
                onChange={setDateColumn}
                options={uploadResult?.columns ?? []}
                />

                <ColumnPicker
                label="Product column"
                value={productColumn}
                onChange={setProductColumn}
                options={uploadResult?.columns ?? []}
                />

                <ColumnPicker
                label="Revenue column"
                value={revenueColumn}
                onChange={setRevenueColumn}
                options={uploadResult?.columns ?? []}
                />
            </div>

            <Button
                onClick={handleSaveMapping}
                disabled={
                isMapping ||
                !dateColumn ||
                !productColumn ||
                !revenueColumn
                }
                className="w-full"
            >
                {isMapping ? "Saving..." : "Save mapping & continue"}
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    setStep("select-file");
                    setFile(null);
                    setUploadResult(null);
                    setDateColumn("");
                    setProductColumn("");
                    setRevenueColumn("");
                }}
                className="w-full"
                >
                Choose another file
                </Button>
            </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}

