import type { Metadata } from "next";

export const siteName = "NSF CURE SBP";
export const defaultDescription =
  "NSF CURE Summer Bridge Program helps engineering students build a strong foundation in Statics and Mechanics of Materials.";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_WEB_URL ??
  "http://localhost:3001";

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const resolvedTitle = title ?? siteName;
  const resolvedDescription = description ?? defaultDescription;
  const canonical = path ? new URL(path, siteUrl).toString() : siteUrl;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
    },
  };
}
