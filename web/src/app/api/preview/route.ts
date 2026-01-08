import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const PREVIEW_SECRET = process.env.PREVIEW_SECRET || "";

export async function GET(req: NextRequest) {
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
    case "home":
      redirect = `/`;
      break;
    default:
      redirect = "/";
  }

  return NextResponse.redirect(new URL(redirect, req.url));
}
