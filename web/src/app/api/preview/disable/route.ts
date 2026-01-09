import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
      const target = new URL(req.url);
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
