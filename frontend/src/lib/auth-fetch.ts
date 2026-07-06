import { apiFetch } from "./api-client";
import type { ApiFetchOptions } from "./api-client";
import { ApiClientError } from "./api-error";
import { useAuthStore } from "@/store/auth-store";

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let refreshPromise: Promise<RefreshResponse> | null = null;

const refreshSession = (): Promise<RefreshResponse> => {
  const { refreshToken, email, setSession, clearSession } =
    useAuthStore.getState();

  if (!refreshToken) {
    clearSession();
    return Promise.reject(new Error("No refresh token available"));
  }

  // If a refresh is already in progress, reuse that same promise instead
  // of starting a second one.
  if (!refreshPromise) {
    refreshPromise = apiFetch<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    })
      .then((tokens) => {
        setSession(tokens, email ?? "");
        return tokens;
      })
      .catch((error) => {
        clearSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const authFetch = async <T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  const accessToken = useAuthStore.getState().accessToken;

  try {
    return await apiFetch<T>(path, { ...options, accessToken });
  } catch (error) {
    const isExpiredAccessToken =
      error instanceof ApiClientError &&
      error.status === 401 &&
      error.code !== "SESSION_REVOKED";

    if (!isExpiredAccessToken) {
      throw error;
    }

    const { accessToken: newAccessToken } = await refreshSession();

    return apiFetch<T>(path, {
      ...options,
      accessToken: newAccessToken,
    });
  }
};