"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface ReportResponse {
  content: string;
  model: string;
  generatedAt: string;
}

interface AIReportProps {
  datasetId: string;
  reportTitle?: string;
}

export function AIReport({ datasetId, reportTitle }: AIReportProps) {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await authFetch<ReportResponse>(
        `/api/ai/dataset/${datasetId}/report`,
        { method: "POST", body: reportTitle ? { reportTitle } : {} },
      );
      setReport(result.content);
      toast.success("AI report generated");
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Executive Report
        </CardTitle>
        <Button size="sm" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : report ? "Regenerate" : "Generate"}
        </Button>
      </CardHeader>
      {report && (
        <CardContent>
          <div className="text-sm text-foreground whitespace-pre-wrap">{report}</div>
        </CardContent>
      )}
    </Card>
  );
}
