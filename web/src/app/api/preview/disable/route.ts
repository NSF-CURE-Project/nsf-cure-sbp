import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const resolvePublicOrigin = (req: NextRequest) => {
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : "");

  if (configuredSiteUrl) {
    try {
      return new URL(configuredSiteUrl).origin;
    } catch {
      // Fall through to forwarded headers.
    }
  }

  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  const forwardedHost =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    req.nextUrl.host;

  return `${forwardedProto}://${forwardedHost}`;
};

export async function GET(req: NextRequest) {
  const rawPreviewHost =
    process.env.PREVIEW_HOST || process.env.NEXT_PUBLIC_PREVIEW_URL || "";
  const previewHost = rawPreviewHost
    ? rawPreviewHost.includes("://")
      ? new URL(rawPreviewHost).hostname
      : rawPreviewHost.split(":")[0]
    : "";
  // Only allow disabling from the preview domain.
  if (previewHost) {
    const host = req.nextUrl.hostname;
    if (host !== previewHost) {
      const target = new URL(req.nextUrl.pathname + req.nextUrl.search, resolvePublicOrigin(req));
      target.hostname = previewHost;
      target.searchParams.set("previewHostRedirect", "1");
      return NextResponse.redirect(target);
    }
  }
  const draft = await draftMode();
  draft.disable();
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
