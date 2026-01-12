import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const PREVIEW_SECRET = process.env.PREVIEW_SECRET || "";

export async function GET(req: NextRequest) {
  const rawPreviewHost =
    process.env.PREVIEW_HOST || process.env.NEXT_PUBLIC_PREVIEW_URL || "";
  const previewHost = rawPreviewHost
    ? rawPreviewHost.includes("://")
      ? new URL(rawPreviewHost).hostname
      : rawPreviewHost.split(":")[0]
    : "";
  if (previewHost) {
    const requestHost = req.nextUrl.hostname;
    const alreadyRedirected =
      req.nextUrl.searchParams.get("previewHostRedirect") === "1";
    if (requestHost !== previewHost && !alreadyRedirected) {
      const target = new URL(req.url);
      target.hostname = previewHost;
      target.searchParams.set("previewHostRedirect", "1");
      return NextResponse.redirect(target);
    }
  }

  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const type = searchParams.get("type");
  const slug = searchParams.get("slug") || "";

  if (!secret || secret !== PREVIEW_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  let redirect = "/";
  switch (type) {
    case "page": {
      if (!slug || slug === "home") {
        redirect = "/";
      } else {
        redirect = `/${slug}`;
      }
      break;
    }
    case "footer":
      redirect = "/";
      break;
    case "lesson":
      redirect = `/preview/lesson/${slug}`;
      break;
    case "class":
      redirect = `/classes/${slug}`;
      break;
    case "quiz":
      redirect = `/preview/quiz/${slug}`;
      break;
    case "home":
      redirect = `/`;
      break;
    default:
      redirect = "/";
  }

  const target = new URL(redirect, req.url);
  target.searchParams.set("preview", "1");
  target.searchParams.set("secret", secret ?? "");
  target.searchParams.set("ts", Date.now().toString());
  return NextResponse.redirect(target);
}
