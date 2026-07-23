"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton } from "@/components/common/CardSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { FileText, Upload, TrendingUp, Sparkles, Database } from "lucide-react";

interface DatasetSummary {
  id: string;
  filename: string;
  uploadDate: string;
  recordCount: number;
  kpiCount: number;
  forecastCount: number;
  recommendationCount: number;
}

export default function DashboardPage() {
  const email = useAuthStore((state) => state.email);
  const [datasets, setDatasets] = useState<DatasetSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const loadDatasets = async () => {

    try {

      const result = await authFetch<DatasetSummary[]>("/api/datasets");
      setDatasets(result);

    } catch (error) {

      setError(
        error instanceof ApiClientError
          ? error.message
          : "Failed to load datasets"
      );

    } finally {

      setIsLoading(false);

    }

  };

  loadDatasets();

}, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {email ? `Signed in as ${email}` : "Your datasets and reports"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/upload">
            <Button>
              <Upload className="size-4" />
              Upload dataset
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {isLoading ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {
      Array.from({length:3}).map((_,i)=>(
        <CardSkeleton key={i}/>
      ))
      }
      </div>
      ) : error ? (

      <ErrorState
        message={error}
        onRetry={() => window.location.reload()}
      />

      ) : datasets && datasets.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((dataset) => (
            <Link key={dataset.id} href={`/reports/${dataset.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-md bg-secondary">
                        <FileText className="size-4 text-primary" />
                      </span>
                      <CardTitle className="text-sm">{dataset.filename}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(dataset.uploadDate).toLocaleDateString()} ·{" "}
                    <span className="font-mono tabular-figures">
                      {dataset.recordCount.toLocaleString()}
                    </span>{" "}
                    records
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Database className="mr-1 size-3" />
                      {dataset.kpiCount} KPIs
                    </Badge>
                    <Badge variant="secondary">
                      <TrendingUp className="mr-1 size-3" />
                      {dataset.forecastCount} forecasts
                    </Badge>
                    <Badge variant="secondary">
                      <Sparkles className="mr-1 size-3 text-insight" />
                      {dataset.recommendationCount} tips
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <Database className="size-5 text-primary" />
            </span>
            <div>
              <p className="font-display text-base font-semibold text-foreground">
                No datasets yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload a CSV to get your first KPIs, forecast, and recommendations.
              </p>
            </div>
            <Link href="/upload">
              <Button className="mt-2">
                <Upload className="size-4" />
                Upload your first dataset
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
