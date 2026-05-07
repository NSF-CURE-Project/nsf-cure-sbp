import { NextResponse, type NextRequest } from "next/server";

// Canonicalize on https://www.cppsbp.org so search engines and shared
// links don't fragment between apex and www variants of the site.
const CANONICAL_HOST = "www.cppsbp.org";
const REDIRECT_FROM_HOSTS = new Set(["cppsbp.org"]);

const COOKIE_PREFIX = process.env.PAYLOAD_COOKIE_PREFIX || "payload";
const SESSION_COOKIE_CANDIDATES = Array.from(
  new Set([`${COOKIE_PREFIX}-token`, "payload-token", "accounts-token"])
);

// Routes that require an authenticated session cookie. Presence-only check;
// the Payload API still enforces real auth on data fetches.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/saved-lessons",
  "/problem-attempts",
  "/quiz-attempts",
  "/classrooms",
  "/notifications",
  "/instructor",
  "/analytics",
];

const hasSessionCookie = (request: NextRequest) =>
  SESSION_COOKIE_CANDIDATES.some((name) =>
    Boolean(request.cookies.get(name)?.value)
  );

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";

  if (REDIRECT_FROM_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    // Clear the internal Next runtime port so the Location header points
    // to the public origin, not https://www.cppsbp.org:8080/.
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  const { pathname, search } = request.nextUrl;

  if (isProtectedPath(pathname) && !hasSessionCookie(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Skip framework internals and API proxy paths so we don't add
// extra hops on every fetch.
export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
