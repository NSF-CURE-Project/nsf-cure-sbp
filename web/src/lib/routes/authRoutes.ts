export const AUTH_ONLY_ROUTES = [
  "/signin",
  "/signup",
  "/reset-password",
  "/verify-email",
  "/invite",
  "/login",
  "/register",
  "/forgot-password",
  "/check-email",
];

export const PERSONAL_ROUTES = [
  "/profile",
  "/settings",
  "/account",
  "/privacy",
  "/notifications",
];

export const isAuthRoute = (pathname: string | null) => {
  if (!pathname) return false;
  return AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

export const isPersonalRoute = (pathname: string | null) => {
  if (!pathname) return false;
  return PERSONAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

export const shouldHideSidebar = (pathname: string | null) =>
  isAuthRoute(pathname) || isPersonalRoute(pathname);
