import { API_BASE_URL } from "./config";
import { ExternalBatch, PageResponse } from "./models/types";
import { setTimeout } from "timers/promises";

export async function fetchPageData(
  batchId: string,
  page: number
): Promise<PageResponse> {
  const url = `${API_BASE_URL}/batches/${batchId}?page=${page}`;
  const response = await fetchWithRetry(
    url,
    {},
    { retries: 10, baseDelayMs: 1000 }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to fetch page data (status ${response.status}): ${text}`
    );
  }
  return response.json();
}

export async function fetchAllBatches(): Promise<ExternalBatch[]> {
  const url = `${API_BASE_URL}/batches`;
  const response = await fetchWithRetry(
    url,
    {},
    { retries: 5, baseDelayMs: 1000 }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to fetch all batches (status ${response.status}): ${text}`
    );
  }
  return response.json();
}

interface FetchWithRetryOptions {
  retries?: number;
  backoffFactor?: number;
  baseDelayMs?: number;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: FetchWithRetryOptions = {}
): Promise<Response> {
  const { retries = 3, backoffFactor = 2, baseDelayMs = 500 } = retryOptions;

  let attempt = 0;
  let delay = baseDelayMs;

  while (true) {
    attempt++;
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (attempt <= retries && response.status >= 500) {
          await setTimeout(delay);
          delay *= backoffFactor;
          continue;
        } else {
          return response;
        }
      }
      return response;
    } catch (err) {
      if (attempt <= retries) {
        await setTimeout(delay);
        delay *= backoffFactor;
      } else {
        throw err;
      }
    }
  }
}
