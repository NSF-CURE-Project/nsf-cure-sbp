const normalizePayloadBase = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim().replace(/\/+$/, "");
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname === "/admin") {
      parsed.pathname = "";
    } else if (parsed.pathname.endsWith("/admin")) {
      parsed.pathname = parsed.pathname.slice(0, -"/admin".length);
    }
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    if (trimmed === "/admin") return "";
    if (trimmed.endsWith("/admin")) return trimmed.slice(0, -"/admin".length);
    return trimmed;
  }
};

export const getPayloadBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (typeof window !== "undefined") {
    // Always route browser calls through this Next app's `/api` rewrite.
    // This avoids cross-origin / cookie / CSRF drift and protects against
    // accidentally setting NEXT_PUBLIC_PAYLOAD_URL to `/admin` paths.
    return "";
  }

  if (isDevelopment) {
    // Prefer direct localhost access from the server runtime during dev.
    return normalizePayloadBase(
      process.env.PAYLOAD_URL ??
        process.env.PAYLOAD_PROXY_TARGET ??
        "http://127.0.0.1:3000"
    );
  }

  return normalizePayloadBase(
    process.env.PAYLOAD_URL ??
      process.env.PAYLOAD_PROXY_TARGET ??
      process.env.NEXT_PUBLIC_CMS_URL ??
      process.env.NEXT_PUBLIC_PAYLOAD_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000"
  );
};
