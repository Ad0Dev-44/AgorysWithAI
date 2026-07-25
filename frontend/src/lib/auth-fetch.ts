import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type AuthFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function authFetch<T>(
  endpoint: string,
  options: AuthFetchOptions = {}
): Promise<T> {

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

  const accessToken = useAuthStore.getState().accessToken;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(headers || {}),
    },
    body: bodyToSend,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Something went wrong",
    }));

    throw new Error(error.message || "API request failed");
  }

  return response.json();
}