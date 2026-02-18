export const getPayloadBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "";
  }
  return (
    process.env.PAYLOAD_URL ??
    process.env.PAYLOAD_PROXY_TARGET ??
    process.env.NEXT_PUBLIC_PAYLOAD_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
};
