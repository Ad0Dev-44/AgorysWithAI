const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Something went wrong",
    }));

    throw new Error(error.message || "API request failed");
  }

  return response.json();
}