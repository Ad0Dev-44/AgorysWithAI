"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();

  const { accessToken, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.replace("/login");
    }
  }, [hasHydrated, accessToken, router]);

  // Wait until Zustand has restored persisted state
  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  // Hydrated but not authenticated.
  // The redirect has been triggered above.
  if (!accessToken) {
    return null;
  }

  return <>{children}</>;
}