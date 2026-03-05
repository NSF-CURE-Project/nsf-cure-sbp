import { getPayloadBaseUrl } from "./payloadUrl";
const API_ROUTE = "/api";
const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const DEFAULT_TIMEOUT_MS =
  process.env.NODE_ENV === "production" ? 8000 : 3000;

const getRequestTimeoutMs = () => {
  const raw = process.env.PAYLOAD_REQUEST_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
};

const isAbortError = (error: unknown) =>
  error instanceof Error && (error.name === "AbortError" || error.message.includes("aborted"));

function appendDraft(path: string, draft?: boolean) {
  const value = draft ? "true" : "false";
  return `${path}${path.includes("?") ? "&" : "?"}draft=${value}`;
}

async function parseJsonOrThrow<T>(res: Response, path: string): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    const snippet = text.slice(0, 220).replace(/\s+/g, " ").trim();
    throw new Error(
      `Payload API returned invalid JSON for ${path}. Response starts with: ${snippet || "<empty>"}`
    );
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const baseUrl = getPayloadBaseUrl();
  const url = `${baseUrl}${API_ROUTE}${path}`;
  const method = (init?.method ?? "GET").toUpperCase();
  const timeoutMs = getRequestTimeoutMs();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        cache: init?.cache,
        next: init?.next,
        ...init,
        signal: init?.signal ?? controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });

      if (!res.ok) {
        if (method === "GET" && attempt === 0 && RETRYABLE_STATUSES.has(res.status)) {
          continue;
        }
        throw new Error(`Payload API error: ${res.status} (${path})`);
      }

      try {
        return await parseJsonOrThrow<T>(res, path);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const canRetry = method === "GET" && attempt === 0 && message.includes("invalid JSON");
        if (canRetry) {
          continue;
        }
        throw error;
      }
    } catch (error) {
      const canRetryTimeout = method === "GET" && attempt === 0 && isAbortError(error);
      if (canRetryTimeout) {
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Payload API request failed after retry: ${path}`);
}

export const payload = {
  get: <T>(path: string, options?: { draft?: boolean; revalidate?: number }) =>
    request<T>(appendDraft(path, options?.draft), {
      cache: options?.draft ? "no-store" : "force-cache",
      next: options?.draft ? undefined : { revalidate: options?.revalidate ?? 60 },
    }),
};
