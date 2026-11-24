import { payload } from "./payloadClient";

export const DEFAULT_STUDENT_LOGIN_DISABLED_MESSAGE =
  "Student account access is temporarily unavailable. Please check back later.";

type AuthSettingsGlobal = {
  studentLoginEnabled?: boolean | null;
  studentLoginDisabledMessage?: string | null;
};

type AuthSettingsResponse = AuthSettingsGlobal & {
  global?: AuthSettingsGlobal;
};

export type AuthSettings = {
  studentLoginEnabled: boolean;
  studentLoginDisabledMessage: string;
};

const defaultAuthSettings: AuthSettings = {
  studentLoginEnabled: true,
  studentLoginDisabledMessage: DEFAULT_STUDENT_LOGIN_DISABLED_MESSAGE,
};

export async function getAuthSettings(options?: {
  revalidate?: number;
  cache?: "force-cache" | "no-store";
}): Promise<AuthSettings> {
  try {
    const response = await payload.get<AuthSettingsResponse>(
      "/globals/auth-settings?depth=0",
      {
        revalidate: options?.revalidate ?? 10,
        cache: options?.cache,
      }
    );

    const globalData = response?.global ?? response;
    const disabledMessage =
      globalData?.studentLoginDisabledMessage?.trim() ||
      DEFAULT_STUDENT_LOGIN_DISABLED_MESSAGE;

    return {
      studentLoginEnabled: globalData?.studentLoginEnabled !== false,
      studentLoginDisabledMessage: disabledMessage,
    };
  } catch {
    return defaultAuthSettings;
  }
}
