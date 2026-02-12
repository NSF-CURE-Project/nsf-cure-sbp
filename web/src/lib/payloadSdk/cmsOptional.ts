export const isCmsOptionalMode = () => process.env.CMS_OPTIONAL_MODE === "true";

export async function withCmsFallback<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isCmsOptionalMode()) {
      throw error;
    }

    console.warn("[cms-optional] CMS unavailable, using fallback data.");
    return fallback;
  }
}
