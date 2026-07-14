"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-muted-foreground underline">
          ← Back to dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {kpis ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {kpis.map((metric) => (
                <div key={metric.metricName}>
                  <p className="text-xs text-muted-foreground">{metric.metricName}</p>
                  <p className="text-lg font-semibold">
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
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTrendLoading ? (
            <p className="text-sm text-muted-foreground">Loading trend...</p>
          ) : trend && trend.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="predictedValue" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {insights.length > 0 && (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {insights.map((insight, index) => (
                    <li key={index}>• {insight}</li>
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
          <CardTitle>Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateForecast} disabled={isGeneratingForecast}>
            {isGeneratingForecast
              ? "Generating..."
              : forecast
                ? "Regenerate forecast"
                : "Generate 6-month forecast"}
          </Button>
          {forecast && (
            <p className="mt-2 text-sm text-muted-foreground">
              Forecast added to the chart above — dashed line shows projected revenue.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations ? (
            recommendations.length > 0 ? (
              <ul className="space-y-2">
                {recommendations.map((message, index) => (
                  <li key={index} className="rounded-md bg-muted p-3 text-sm">
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
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary ? (
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm font-sans">
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
    </div>
  );
}