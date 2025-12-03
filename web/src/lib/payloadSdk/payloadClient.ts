const BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL!;
const API_ROUTE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${API_ROUTE}${path}`, {
    cache: "no-store",   // ← REQUIRED for immediate updates
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
  get: <T>(path: string) => request<T>(path),
};
