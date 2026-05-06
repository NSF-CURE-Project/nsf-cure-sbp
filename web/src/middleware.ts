import { NextResponse, type NextRequest } from "next/server";

// Canonicalize on https://www.cppsbp.org so search engines and shared
// links don't fragment between apex and www variants of the site.
const CANONICAL_HOST = "www.cppsbp.org";
const REDIRECT_FROM_HOSTS = new Set(["cppsbp.org"]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  if (!REDIRECT_FROM_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.host = CANONICAL_HOST;
  url.protocol = "https:";
  return NextResponse.redirect(url, 301);
}

// Skip framework internals and API proxy paths so we don't add
// extra hops on every fetch.
export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
