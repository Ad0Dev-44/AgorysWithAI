"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";

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

  useEffect(() => {
    const loadDatasets = async () => {
      try {
        const result = await authFetch<DatasetSummary[]>("/api/datasets");
        setDatasets(result);
      } catch (error) {
        toast.error(error instanceof ApiClientError ? error.message : "Failed to load datasets");
      } finally {
        setIsLoading(false);
      }
    };

    loadDatasets();
  }, []);

  // rest of the component goes here
}
