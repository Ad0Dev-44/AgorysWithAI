"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface ExplainResponse {
  content: string;
  model: string;
  generatedAt: string;
}

interface AIInsightCardProps {
  datasetId: string;
}

export function AIInsightCard({ datasetId }: AIInsightCardProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExplain = async () => {
    setIsGenerating(true);
    try {
      const result = await authFetch<ExplainResponse>(
        `/api/ai/dataset/${datasetId}/explain`,
        { method: "POST" },
      );
      setExplanation(result.content);
      toast.success("Dashboard explanation generated");
    } catch (error) {
      toast.error(
        error instanceof ApiClientError ? error.message : "Failed to generate explanation",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Explain Dashboard
        </CardTitle>
        <Button size="sm" onClick={handleExplain} disabled={isGenerating}>
          {isGenerating ? "Generating..." : explanation ? "Regenerate" : "Explain"}
        </Button>
      </CardHeader>
      {explanation && (
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-wrap">{explanation}</p>
        </CardContent>
      )}
    </Card>
  );
}
