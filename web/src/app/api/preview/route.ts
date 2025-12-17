import { draftMode, NextRequest, NextResponse } from "next/server";

const PREVIEW_SECRET = process.env.PREVIEW_SECRET || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const type = searchParams.get("type");
  const slug = searchParams.get("slug") || "";

  if (!secret || secret !== PREVIEW_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  await draftMode().enable();

  let redirect = "/";
  switch (type) {
    case "lesson":
      // Expect slug already includes class context; fallback to lessons route without class
      redirect = `/classes/${searchParams.get("classSlug") ?? ""}/lessons/${slug}`;
      break;
    case "class":
      redirect = `/classes/${slug}`;
      break;
    case "home":
      redirect = `/`;
      break;
    case "resources":
      redirect = `/resources`;
      break;
    case "contact":
      redirect = `/contact-us`;
      break;
    default:
      redirect = "/";
  }

  return NextResponse.redirect(new URL(redirect, req.url));
}
