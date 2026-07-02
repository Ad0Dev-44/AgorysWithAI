import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

export const useLogout = () => {
  const router = useRouter();
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      if (refreshToken) {
        await apiFetch("/api/auth/logout", {
          method: "POST",
          body: { refreshToken },
        });
      }
    } catch {
      // Intentionally ignored — see explanation below.
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  return { logout, isLoggingOut };
};
