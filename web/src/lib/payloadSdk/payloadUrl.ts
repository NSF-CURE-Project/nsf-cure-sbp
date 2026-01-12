export const getPayloadBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  return (
    process.env.PAYLOAD_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_PAYLOAD_URL ??
    "http://localhost:3000"
  );
};
