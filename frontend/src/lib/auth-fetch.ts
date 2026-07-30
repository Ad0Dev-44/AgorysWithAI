import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type AuthFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const buildRequestInit = (
  options: AuthFetchOptions,
  accessToken: string | null
): RequestInit => {
  const { body, headers, ...rest } = options;
  const isFormData = body instanceof FormData || body instanceof URLSearchParams;
  const bodyToSend =
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    typeof body === "string"
      ? (body as BodyInit)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined;

  return {
    ...rest,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(headers || {}),
    },
    body: bodyToSend,
  };
};

// Ensures concurrent 401s only trigger a single /refresh call, not one per request.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();

  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return null;

        const data = (await response.json()) as {
          accessToken: string;
          refreshToken: string;
        };

        const { email } = useAuthStore.getState();
        useAuthStore.getState().setSession(
          { accessToken: data.accessToken, refreshToken: data.refreshToken },
          email ?? "",
        );

        return data.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function authFetch<T>(
  endpoint: string,
  options: AuthFetchOptions = {}
): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;

  const response = await fetch(
    `${API_URL}${endpoint}`,
    buildRequestInit(options, accessToken),
  );

  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      const retryResponse = await fetch(
        `${API_URL}${endpoint}`,
        buildRequestInit(options, newAccessToken),
      );

      if (retryResponse.ok) {
        if (retryResponse.status === 204) return undefined as T;
        return retryResponse.json();
      }

      // Retry also failed — fall through to session-expired handling below.
    }

    // Refresh failed (or retry still failed): the session is truly gone.
    useAuthStore.getState().clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Something went wrong",
    }));

    throw new Error(error.message || "API request failed");
  }

  return response.json();
}