import { ApiClientError } from "./api-error";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  accessToken?: string | null;
}
export const apiFetch = async <T>(path: string, options: ApiFetchOptions = {}): Promise<T> => {
  const { body, accessToken, headers, ...rest } = options;
  const isFormData = body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
  // 204 No Content (logout) has no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }
  const data = await response.json();
  if (!response.ok) {
    throw new ApiClientError(
      data.code ?? "UNKNOWN_ERROR",
      data.message ?? "Something went wrong",
      response.status,
    );
  }
  return data as T;
};


// import { ApiClientError } from "@/lib/api-error";

// type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// interface ApiFetchOptions {
//   method?: HttpMethod;
//   body?: any;
//   headers?: Record<string, string>;
// }

// export async function apiFetch<T>(
//   url: string,
//   options: ApiFetchOptions = {}
// ): Promise<T> {
//   const { method = "GET", body, headers = {} } = options;

//   try {
//     const response = await fetch(url, {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//         ...headers,
//       },
//       body: body ? JSON.stringify(body) : undefined,
//     });

//     const data = await response.json().catch(() => null);

//     if (!response.ok) {
//       throw new ApiClientError(
//         data?.message || "Request failed",
//         response.status,
//         data
//       );
//     }

//     return data as T;
//   } catch (error) {
//     if (error instanceof ApiClientError) {
//       throw error;
//     }

//     throw new ApiClientError(
//       "Network error or server unreachable",
//       0,
//       error
//     );
//   }
// }