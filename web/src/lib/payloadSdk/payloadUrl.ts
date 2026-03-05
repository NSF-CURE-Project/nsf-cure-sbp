export const getPayloadBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (typeof window !== "undefined") {
    if (isDevelopment) {
      // In local dev, route through the web app rewrite (`/api`) to avoid DNS/cookie drift.
      return "";
    }

    return process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "";
  }

  if (isDevelopment) {
    // Prefer direct localhost access from the server runtime during dev.
    return (
      process.env.PAYLOAD_URL ??
      process.env.PAYLOAD_PROXY_TARGET ??
      "http://127.0.0.1:3000"
    );
  }

  return (
    process.env.PAYLOAD_URL ??
    process.env.PAYLOAD_PROXY_TARGET ??
    process.env.NEXT_PUBLIC_PAYLOAD_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
};
