import { getPayloadBaseUrl } from "./payloadUrl";
const API_ROUTE = "/api";

function appendDraft(path: string, draft?: boolean) {
  if (!draft) return path;
  return `${path}${path.includes("?") ? "&" : "?"}draft=true`;
}

async function request<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const baseUrl = getPayloadBaseUrl();
  const res = await fetch(`${baseUrl}${API_ROUTE}${path}`, {
    cache: init?.cache,
    next: init?.next,
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Payload API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const payload = {
  get: <T>(path: string, options?: { draft?: boolean; revalidate?: number }) =>
    request<T>(appendDraft(path, options?.draft), {
      cache: options?.draft ? "no-store" : "force-cache",
      next: options?.draft ? undefined : { revalidate: options?.revalidate ?? 60 },
    }),
};
