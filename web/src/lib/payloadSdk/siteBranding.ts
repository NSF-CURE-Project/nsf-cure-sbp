import { payload } from "./payloadClient";
import { getPayloadBaseUrl } from "./payloadUrl";

const DEFAULT_LOGO_SRC = "/assets/logos/sbp_logo_transparent.png";
const DEFAULT_LOGO_ALT = "SBP logo";

type MediaUpload = {
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type SiteBrandingGlobal = {
  programLogo?: MediaUpload | string | number | null;
  programLogoAlt?: string | null;
};

type SiteBrandingResponse = SiteBrandingGlobal & {
  global?: SiteBrandingGlobal;
};

export type SiteBranding = {
  programLogo: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
};

const toPositiveNumber = (value: unknown): number | undefined => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const getFilenameFromPath = (path: string): string | null => {
  const normalized = path.split("?")[0]?.split("#")[0] ?? "";
  const parts = normalized.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return last ? decodeURIComponent(last) : null;
};

const withPayloadBase = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getPayloadBaseUrl();
  if (!base) return path;
  return `${base}${path}`;
};

const resolveMediaSource = (value: SiteBrandingGlobal["programLogo"]): string | null => {
  if (!value) return null;

  if (typeof value === "object") {
    const media = value as MediaUpload;
    const filename = media.filename?.trim();
    if (filename) {
      return `/api/media/file/${encodeURIComponent(filename)}`;
    }

    const url = media.url?.trim();
    if (url) {
      if (url.startsWith("/api/media/")) return url;
      if (url.startsWith("/media/")) {
        const extractedFilename = getFilenameFromPath(url);
        if (extractedFilename) {
          return `/api/media/file/${encodeURIComponent(extractedFilename)}`;
        }
      }

      if (url.startsWith("http://") || url.startsWith("https://")) {
        try {
          const parsed = new URL(url);
          const pathFilename = getFilenameFromPath(parsed.pathname);
          if (
            pathFilename &&
            (parsed.pathname.startsWith("/media/") ||
              parsed.pathname.startsWith("/api/media/file/"))
          ) {
            return `/api/media/file/${encodeURIComponent(pathFilename)}`;
          }
        } catch {
          // fall through to direct URL usage
        }
      }

      return withPayloadBase(url);
    }
    return null;
  }

  return null;
};

const defaultBranding: SiteBranding = {
  programLogo: {
    src: DEFAULT_LOGO_SRC,
    alt: DEFAULT_LOGO_ALT,
    width: 64,
    height: 64,
  },
};

export async function getSiteBranding(options?: {
  draft?: boolean;
  revalidate?: number;
}): Promise<SiteBranding> {
  try {
    const response = await payload.get<SiteBrandingResponse>(
      "/globals/site-branding?depth=1",
      {
        draft: options?.draft,
        revalidate: options?.revalidate ?? 60,
      }
    );

    const globalData = response?.global ?? response;
    const logoSrc =
      resolveMediaSource(globalData?.programLogo) ?? defaultBranding.programLogo.src;

    const media =
      globalData?.programLogo && typeof globalData.programLogo === "object"
        ? (globalData.programLogo as MediaUpload)
        : undefined;

    const alt = globalData?.programLogoAlt?.trim() || media?.alt?.trim() || DEFAULT_LOGO_ALT;

    return {
      programLogo: {
        src: logoSrc,
        alt,
        width: toPositiveNumber(media?.width) ?? defaultBranding.programLogo.width,
        height: toPositiveNumber(media?.height) ?? defaultBranding.programLogo.height,
      },
    };
  } catch {
    return defaultBranding;
  }
}
