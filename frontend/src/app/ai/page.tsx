"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardSkeleton } from "@/components/common/CardSkeleton";
import { Sparkles, Upload } from "lucide-react";

import { AIChat } from "@/components/ai/AIChat";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { AIRecommendation } from "@/components/ai/AIRecommendation";
import { AIReport } from "@/components/ai/AIReport";

interface DatasetSummary {
  id: string;
  filename: string;
  uploadDate: string;
  recordCount: number;
  kpiCount: number;
  forecastCount: number;
  recommendationCount: number;
}

export default function AIPage() {
  const [datasets, setDatasets] = useState<DatasetSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  useEffect(() => {
    const loadDatasets = async () => {
      try {
        const result = await authFetch<DatasetSummary[]>("/api/datasets");
        setDatasets(result);
        if (result.length > 0) {
          setSelectedDatasetId(result[0].id);
        }
      } catch (error) {
        toast.error(
          error instanceof ApiClientError ? error.message : "Failed to load datasets",
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadDatasets();
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-foreground">
          <Sparkles className="size-6 text-insight" aria-hidden="true" />
          AGORYS AI
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions about your business data and get AI-generated insights, reports, and
          recommendations.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : !datasets || datasets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              You need to upload a dataset before AGORYS AI can analyze anything.
            </p>
            <Link href="/upload">
              <Button>
                <Upload className="size-4" aria-hidden="true" />
                Upload dataset
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dataset</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedDatasetId ?? undefined}
                onValueChange={(value) => setSelectedDatasetId(value)}
              >
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedDatasetId && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <AIChat datasetId={selectedDatasetId} />
              </div>
              <AIInsightCard datasetId={selectedDatasetId} />
              <AIRecommendation datasetId={selectedDatasetId} />
              <div className="lg:col-span-2">
                <AIReport datasetId={selectedDatasetId} />
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
