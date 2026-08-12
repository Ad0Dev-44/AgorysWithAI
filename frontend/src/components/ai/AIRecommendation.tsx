"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface RecommendationResponse {
  content: string;
  model: string;
  generatedAt: string;
}

interface AIRecommendationProps {
  datasetId: string;
}

export function AIRecommendation({ datasetId }: AIRecommendationProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await authFetch<RecommendationResponse>(
        `/api/ai/dataset/${datasetId}/recommend`,
        { method: "POST" },
      );
      setAdvice(result.content);
      toast.success("AI recommendations generated");
    } catch (error) {
      toast.error(
        error instanceof ApiClientError ? error.message : "Failed to generate recommendations",
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
          AI Recommendations
        </CardTitle>
        <Button size="sm" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : advice ? "Regenerate" : "Generate"}
        </Button>
      </CardHeader>
      {advice && (
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-wrap">{advice}</p>
        </CardContent>
      )}
    </Card>
  );
}
