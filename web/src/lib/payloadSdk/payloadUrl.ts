export const getPayloadBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";
};
