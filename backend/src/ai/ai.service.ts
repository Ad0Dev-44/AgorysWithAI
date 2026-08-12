import axios, { AxiosError } from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";

// This file's only job: forward already-computed analytics data to ai-service
// and return whatever comes back. It does NOT build prompts and does NOT
// touch the database directly — that's handled by ai.controller.ts, which
// gathers data via the existing dataset.service.ts functions.

function unwrapAiServiceError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ error?: string }>;
    const upstreamMessage = axiosErr.response?.data?.error;
    if (upstreamMessage) {
      return new Error(`ai-service error: ${upstreamMessage}`);
    }
    if (axiosErr.code === "ECONNREFUSED") {
      return new Error(`Could not reach ai-service — is it running on ${AI_SERVICE_URL}?`);
    }
  }
  return err instanceof Error ? err : new Error("Unknown error calling ai-service");
}

export async function requestDashboardExplanation(payload: unknown) {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/dashboard/explain`, payload, {
      timeout: 30_000,
    });
    return data;
  } catch (err) {
    throw unwrapAiServiceError(err);
  }
}

export async function requestReport(payload: unknown) {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/report`, payload, {
      timeout: 30_000,
    });
    return data;
  } catch (err) {
    throw unwrapAiServiceError(err);
  }
}

export async function requestRecommendations(payload: unknown) {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/recommendations`, payload, {
      timeout: 30_000,
    });
    return data;
  } catch (err) {
    throw unwrapAiServiceError(err);
  }
}

export async function requestChat(payload: unknown) {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/chat`, payload, {
      timeout: 30_000,
    });
    return data;
  } catch (err) {
    throw unwrapAiServiceError(err);
  }
}
