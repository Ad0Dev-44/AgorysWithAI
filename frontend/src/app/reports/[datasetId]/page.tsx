"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CardSkeleton } from "@/components/common/CardSkeleton";
import { Sparkles, Trash2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Metric {
  metricName: string;
  metricValue: number;
}

interface TrendPoint {
  month: string;
  revenue: number;
}

interface ForecastPoint {
  forecastDate: string;
  predictedValue: number;
}

export default function ReportsPage() {
  const params = useParams<{ datasetId: string }>();
  const datasetId = params?.datasetId ?? "";

  const router = useRouter();

  const [trend, setTrend] = useState<TrendPoint[] | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isTrendLoading, setIsTrendLoading] = useState(true);

  const [kpis, setKpis] = useState<Metric[] | null>(null);
  const [isGeneratingKpis, setIsGeneratingKpis] = useState(false);

  const [forecast, setForecast] = useState<ForecastPoint[] | null>(null);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);

  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);

  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const [reportFormat, setReportFormat] = useState<"pdf" | "xlsx">("pdf");
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadTrend = async () => {
      try {
        const result = await authFetch<{ trend: TrendPoint[]; insights: string[] }>(
          `/api/datasets/${datasetId}/trends/revenue`,
        );
        setTrend(result.trend);
        setInsights(result.insights);
      } catch (error) {
        toast.error(error instanceof ApiClientError ? error.message : "Failed to load trend");
      } finally {
        setIsTrendLoading(false);
      }
    };
    loadTrend();
  }, [datasetId]);

  const handleGenerateKpis = async () => {
    setIsGeneratingKpis(true);
    try {
      const result = await authFetch<Metric[]>(
        `/api/datasets/${datasetId}/kpis/generate`,
        { method: "POST" },
      );
      setKpis(result);
      toast.success("KPIs generated");
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to generate KPIs");
    } finally {
      setIsGeneratingKpis(false);
    }
  };

  const handleGenerateForecast = async () => {
    setIsGeneratingForecast(true);
    try {
      const result = await authFetch<ForecastPoint[]>(
        `/api/datasets/${datasetId}/forecast/generate`,
        { method: "POST" },
      );
      setForecast(result);
      toast.success("Forecast generated");
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to generate forecast");
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    try {
      const result = await authFetch<string[]>(
        `/api/datasets/${datasetId}/recommendations/generate`,
        { method: "POST" },
      );
      setRecommendations(result);
      toast.success(
        result.length > 0 ? `${result.length} recommendation(s) generated` : "No concerns flagged",
      );
    } catch (error) {
      toast.error(
        error instanceof ApiClientError ? error.message : "Failed to generate recommendations",
      );
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const result = await authFetch<{ summary: string; trend: TrendPoint[] }>(
        `/api/datasets/${datasetId}/report/generate`,
        { method: "POST" },
      );
      setSummary(result.summary);
      toast.success("Executive summary generated");
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const combinedChartData = (() => {
    if (!trend) return [];
    const actualPoints = trend.map((point) => ({
      month: point.month,
      revenue: point.revenue,
    }));
    if (!forecast || forecast.length === 0) return actualPoints;
    const lastIndex = actualPoints.length - 1;
    const mergedLastPoint = {
      ...actualPoints[lastIndex],
      predictedValue: actualPoints[lastIndex].revenue,
    };
    const pointsBeforeLast = actualPoints.slice(0, lastIndex);
    const forecastPoints = forecast.map((point) => ({
      month: point.forecastDate.slice(0, 7),
      predictedValue: point.predictedValue,
    }));
    return [...pointsBeforeLast, mergedLastPoint, ...forecastPoints];
  })();


  const handleConfirmDelete = async () => {
  setDeletingId(datasetId);

    try {
      await authFetch(`/api/datasets/${datasetId}`, {
        method: "DELETE",
      });

      toast.success("Dataset deleted");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete dataset",
      );

      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const handleDownloadReport = async () => {
  setIsDownloadingReport(true);
  try {
    const accessToken = useAuthStore.getState().accessToken;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

    const response = await fetch(
      `${apiUrl}/api/datasets/${datasetId}/report/export?format=${reportFormat}`,
      {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: "Download failed" }));
      throw new Error(body.message || "Download failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agorys-report.${reportFormat === "xlsx" ? "xlsx" : "pdf"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Report downloaded");
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to download report");
  } finally {
    setIsDownloadingReport(false);
  }
};

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to dashboard
        </Link>

        <Button
          variant="destructive"
          className="lg:ml-auto"
          onClick={() => setPendingDeleteId(datasetId)}
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true"/>
          Delete Dataset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {kpis ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {kpis.map((metric) => (
                <div key={metric.metricName} className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">{metric.metricName}</p>
                  <p className="font-mono text-lg font-semibold tabular-figures text-foreground">
                    {metric.metricName.includes("%")
                      ? `${metric.metricValue}%`
                      : metric.metricName.includes("Transactions")
                        ? metric.metricValue
                        : `$${metric.metricValue.toLocaleString()}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No KPIs generated yet.</p>
          )}
          <Button onClick={handleGenerateKpis} disabled={isGeneratingKpis}>
            {isGeneratingKpis ? "Generating..." : kpis ? "Regenerate KPIs" : "Generate KPIs"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTrendLoading ? (
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
            <CardSkeleton />
          </div>
        ) : trend && trend.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="predictedValue" stroke="hsl(var(--insight))" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {insights.length > 0 && (
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-primary">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No data yet. Upload and map a CSV to see trends.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateForecast} disabled={isGeneratingForecast}>
            {isGeneratingForecast
              ? "Generating..."
              : forecast
                ? "Regenerate forecast"
                : "Generate 6-month forecast"}
          </Button>
          {isGeneratingForecast && (
          <div className="mt-4">
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
          </div>
        )}

        {forecast && (
          <p className="mt-2 text-sm text-muted-foreground">
            Forecast added to the chart above — dashed line shows projected revenue.
          </p>
        )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGeneratingRecommendations ? (
          <CardSkeleton />
        ) : recommendations ? (
            recommendations.length > 0 ? (
              <ul className="space-y-2">
                {recommendations.map((message, index) => (
                  <li key={index} className="flex gap-3 rounded-lg bg-insight/10 p-3 text-sm text-foreground">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-insight" aria-hidden="true"/>
                    {message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No concerns flagged — this dataset looks healthy.
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">No recommendations generated yet.</p>
          )}
          <Button onClick={handleGenerateRecommendations} disabled={isGeneratingRecommendations}>
            {isGeneratingRecommendations
              ? "Analyzing..."
              : recommendations
                ? "Re-analyze"
                : "Generate recommendations"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGeneratingSummary ? (
          <CardSkeleton />
        ) : summary ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm font-sans text-foreground">
              {summary}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No summary generated yet.</p>
          )}
          <Button onClick={handleGenerateSummary} disabled={isGeneratingSummary}>
            {isGeneratingSummary ? "Generating..." : summary ? "Regenerate summary" : "Generate executive summary"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Download Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export the executive summary and KPIs as a PDF or Excel file.
          </p>
          <div className="flex items-center gap-3">
            <Select
              value={reportFormat}
              onValueChange={(value) => setReportFormat(value as "pdf" | "xlsx")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadReport} disabled={isDownloadingReport}>
              {isDownloadingReport ? "Preparing..." : "Download Report"}
            </Button>
          </div>
        </CardContent>
      </Card>


      <Dialog
      open={!!pendingDeleteId}
      onOpenChange={(open) => {
        if (deletingId) return;

        if (!open) {
          setPendingDeleteId(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete this dataset?
          </DialogTitle>

          <DialogDescription>
            This permanently deletes the dataset and every KPI,
            forecast, and recommendation generated from it.
            This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setPendingDeleteId(null)}
            disabled={!!deletingId}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={!!deletingId}
          >
            {deletingId ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </main>


  );
}