"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Bookmark,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LoginLink } from "@/components/auth/LoginLink";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import { cn } from "@/lib/utils";
import { GlobalSearchDialog } from "@/components/navigation/global-search/GlobalSearchDialog";

const PAYLOAD_URL = getPayloadBaseUrl();
const NAVBAR_USER_CACHE_KEY = "sbp-navbar-user";
const NAVBAR_PAGES_CACHE_KEY = "sbp-navbar-pages";

type NavbarUser = {
  id: string;
  email: string;
  fullName?: string;
};

type NavbarPage = {
  id: string;
  slug: string;
  title: string;
  navOrder?: number | null;
  hidden?: boolean | null;
};

export type NavbarAnnouncement = {
  message: string;
  href?: string;
  linkLabel?: string;
};

function readCachedNavbarUser(): NavbarUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(NAVBAR_USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NavbarUser>;
    if (!parsed || typeof parsed.id !== "string" || typeof parsed.email !== "string") {
      return null;
    }
    return {
      id: parsed.id,
      email: parsed.email,
      fullName: typeof parsed.fullName === "string" ? parsed.fullName : undefined,
    };
  } catch {
    return null;
  }
}

function writeCachedNavbarUser(user: NavbarUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(NAVBAR_USER_CACHE_KEY);
    return;
  }
  window.localStorage.setItem(NAVBAR_USER_CACHE_KEY, JSON.stringify(user));
}

function readCachedNavbarPages(): NavbarPage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NAVBAR_PAGES_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<NavbarPage>[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (page) =>
          page &&
          typeof page.id === "string" &&
          typeof page.slug === "string" &&
          typeof page.title === "string"
      )
      .map((page) => ({
        id: page.id as string,
        slug: page.slug as string,
        title: page.title as string,
        navOrder: typeof page.navOrder === "number" ? page.navOrder : null,
      }));
  } catch {
    return [];
  }
}

function writeCachedNavbarPages(pages: NavbarPage[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAVBAR_PAGES_CACHE_KEY, JSON.stringify(pages));
}

export default function Navbar({
  announcement,
}: {
  announcement?: NavbarAnnouncement | null;
}) {
  const { resolvedTheme, theme, systemTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<NavbarUser | null>(() => readCachedNavbarUser());
  const [notifications, setNotifications] = useState<
    {
      id: string;
      title: string;
      body?: string;
      read?: boolean;
      createdAt?: string;
      link?: string;
    }[]
  >([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [resolvedUser, setResolvedUser] = useState(() => !!readCachedNavbarUser());
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [pages, setPages] = useState<NavbarPage[]>(() => readCachedNavbarPages());
  const [authBusy, setAuthBusy] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTypingTarget =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        target?.isContentEditable;

      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !isTypingTarget)
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const loadUser = async () => {
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setUser(null);
          writeCachedNavbarUser(null);
          return;
        }
        const data = (await res.json()) as { user?: NavbarUser };
        const nextUser = data?.user ?? null;
        setUser(nextUser);
        writeCachedNavbarUser(nextUser);
      } catch {
        // Preserve cached user on transient network failures to avoid auth flicker.
      } finally {
        if (!controller.signal.aborted) {
          setResolvedUser(true);
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadPages = async () => {
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/pages?limit=100&sort=navOrder&where[hidden][not_equals]=true`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          if (!readCachedNavbarPages().length) {
            setPages([]);
          }
          return;
        }
        const data = (await res.json()) as {
          docs?: NavbarPage[];
        };
        const cleaned = (data.docs ?? []).filter(
          (page) => page.slug && page.slug !== "home" && !page.hidden
        );
        cleaned.sort((a, b) => {
          const aOrder =
            typeof a.navOrder === "number"
              ? a.navOrder
              : Number.POSITIVE_INFINITY;
          const bOrder =
            typeof b.navOrder === "number"
              ? b.navOrder
              : Number.POSITIVE_INFINITY;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return (a.title ?? "").localeCompare(b.title ?? "");
        });
        setPages(cleaned);
        writeCachedNavbarPages(cleaned);
      } catch {
        if (!controller.signal.aborted) {
          const cached = readCachedNavbarPages();
          if (!cached.length) {
            setPages([]);
          }
        }
      }
    };
    loadPages();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    const loadNotifications = async () => {
      setNotificationsBusy(true);
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/notifications?limit=8&sort=-createdAt`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setNotifications([]);
          return;
        }
        const data = (await res.json()) as {
          docs?: {
            id: string;
            title: string;
            body?: string;
            read?: boolean;
            createdAt?: string;
            link?: string;
          }[];
        };
        setNotifications(data.docs ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setNotifications([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setNotificationsBusy(false);
        }
      }
    };
    loadNotifications();
    return () => controller.abort();
  }, [user?.id, notificationsOpen]);

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await fetch(`${PAYLOAD_URL}/api/accounts/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      writeCachedNavbarUser(null);
      setAuthBusy(false);
      window.location.href = "/";
    }
  };

  const mode = useMemo(() => {
    if (!mounted) return "light";
    if (resolvedTheme) return resolvedTheme;
    if (theme === "system" && systemTheme) return systemTheme;
    if (theme) return theme;
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    }
    return "light";
  }, [mounted, resolvedTheme, theme, systemTheme]);

  const cppLogo =
    mode === "dark"
      ? "/assets/logos/cpp_yellow.png"
      : "/assets/logos/cpp_green.png";

  const nsfLogo =
    mode === "dark" ? "/assets/logos/nsf.png" : "/assets/logos/nsf.png";

  const displayName = user?.fullName ?? "Student";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "SB";
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );
  const announcementMessage = announcement?.message.trim() ?? "";
  const announcementHref = announcement?.href?.trim();
  const announcementLinkLabel = announcement?.linkLabel?.trim() || "Learn more";

  const handleNotificationRead = async (notificationId: string) => {
    try {
      await fetch(`${PAYLOAD_URL}/api/notifications/${notificationId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch {
      // Ignore notification read failures.
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((notification) => !notification.read);
    if (unread.length === 0) return;
    await Promise.all(unread.map((item) => handleNotificationRead(item.id)));
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {announcementMessage ? (
        <div
          role="status"
          aria-label="Site announcement"
          className="border-b border-primary/20 bg-primary px-4 py-1.5 text-primary-foreground sm:px-6"
        >
          <div className="mx-auto flex min-h-5 max-w-[var(--content-max,1200px)] items-center gap-2 text-[12px] font-medium leading-5 sm:text-[13px]">
            <p className="min-w-0 flex-1 text-pretty">{announcementMessage}</p>
            {announcementHref ? (
              <a
                href={announcementHref}
                className="shrink-0 font-semibold text-primary-foreground underline underline-offset-2 transition hover:text-primary-foreground/90"
              >
                {announcementLinkLabel}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
      <nav
        aria-label="Primary"
        className="
          flex items-center gap-3
          h-16 px-4 sm:px-6 border-b
          bg-background/80
          supports-[backdrop-filter]:bg-background/60
        "
      >
      <div className="flex min-w-0 items-center gap-2 sm:gap-5">
        <Link href="/" aria-label="Home" className="flex items-center gap-2">
          <Image
            src={cppLogo}
            alt="Cal Poly Pomona Logo"
            width={300}
            height={150}
            className="h-8 w-auto sm:h-12"
            sizes="(min-width: 640px) 96px, 80px"
          />
        </Link>

        <Image
          src={nsfLogo}
          alt="NSF Logo"
          width={80}
          height={80}
          className="size-8 sm:size-12"
          sizes="(min-width: 640px) 48px, 40px"
          priority
        />

        <span className="truncate text-[13px] font-semibold text-foreground sm:text-xl">
          NSF CURE SBP
        </span>
      </div>

      {/* Desktop links */}
      <div className="hidden lg:flex items-center gap-5 ml-6 text-sm font-medium text-foreground">
        <Link
          href="/"
          className={cn(
            "relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:transition-transform after:duration-200 hover:text-foreground hover:after:scale-x-100",
            pathname === "/"
              ? "font-semibold text-primary after:bg-primary after:scale-x-100"
              : "after:bg-foreground/70 after:scale-x-0"
          )}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          Home
        </Link>
        {pages.map((page) => {
          const href = page.slug === "learning" ? "/learning" : `/${page.slug}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={page.id}
              href={href}
              className={cn(
                "relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:transition-transform after:duration-200 hover:text-foreground hover:after:scale-x-100",
                isActive
                  ? "font-semibold text-primary after:bg-primary after:scale-x-100"
                  : "after:bg-foreground/70 after:scale-x-0"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {page.title}
            </Link>
          );
        })}
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-md shadow-none md:hidden"
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
        >
          <Search aria-hidden="true" />
        </Button>
        <button
          type="button"
          className="hidden md:flex items-center gap-2 rounded-[10px] border border-border/70 bg-muted/30 px-3 py-1.5 text-[13px] text-muted-foreground transition hover:border-border hover:bg-muted/50"
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-[13px]">Search…</span>
          <span className="ml-1 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-foreground/70">
            ⌘K
          </span>
        </button>
        {!resolvedUser ? (
          <div
            className="hidden md:inline-flex h-8 items-center gap-2.5 rounded-full border border-border/60 bg-background/70 px-2 py-1.5 opacity-70"
            aria-hidden="true"
          >
            <span className="h-8 w-8 rounded-full border border-border/60 bg-muted/40" />
            <span className="h-3.5 w-24 rounded bg-muted/50" />
            <span className="h-4 w-4 rounded bg-muted/50" />
          </div>
        ) : user ? (
          <>
            <ThemeToggle
              variant="icon"
              className="hidden md:inline-flex h-8 w-8 rounded-md hover:bg-muted/60"
            />
            <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden md:inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 py-1 pl-1 pr-2 text-sm font-medium text-foreground transition hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Open account menu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="" alt={displayName} />
                    <AvatarFallback className="bg-muted/60 text-[11px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-[13px]">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${
                      profileMenuOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="end"
                sideOffset={8}
                className="z-[9999] w-[300px] overflow-hidden rounded-[12px] border border-border/70 bg-background p-1.5 shadow-[0_8px_28px_rgba(16,24,40,0.12)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150"
              >
                <DropdownMenuLabel className="px-2.5 py-2 font-normal">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src="" alt={displayName} />
                      <AvatarFallback className="bg-muted text-[11px] font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                        {displayName}
                      </p>
                      <p className="truncate text-[12px] leading-tight text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    asChild
                    className="h-10 cursor-pointer gap-2.5 rounded-md px-2.5 text-[13px] font-medium focus:bg-muted/70"
                  >
                    <Link href="/profile">
                      <UserRound className="size-4 text-muted-foreground" aria-hidden />
                      My profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="h-10 cursor-pointer gap-2.5 rounded-md px-2.5 text-[13px] font-medium focus:bg-muted/70"
                  >
                    <Link href="/saved-lessons">
                      <Bookmark className="size-4 text-muted-foreground" aria-hidden />
                      Saved lessons
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="h-10 cursor-pointer gap-2.5 rounded-md px-2.5 text-[13px] font-medium focus:bg-muted/70"
                  >
                    <Link href="/settings">
                      <Settings2 className="size-4 text-muted-foreground" aria-hidden />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="h-10 cursor-pointer gap-2.5 rounded-md px-2.5 text-[13px] font-medium focus:bg-muted/70"
                  >
                    <Link href="/data-transparency">
                      <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
                      Privacy & data
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="h-10 cursor-pointer gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-foreground focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-300"
                  onClick={handleSignOut}
                  disabled={authBusy}
                >
                  <LogOut className="size-4 text-muted-foreground" aria-hidden />
                  {authBusy ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <ThemeToggle
              variant="icon"
              className="hover:bg-muted/60"
            />
            <LoginLink
              className="hidden md:inline-flex h-8 items-center rounded-full border border-border/70 bg-muted/40 px-4 text-sm font-medium text-foreground transition hover:bg-muted/60"
            >
              Sign In
            </LoginLink>
          </>
        )}
        {!resolvedUser ? (
          <button
            type="button"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-foreground/70 opacity-70"
            aria-hidden="true"
            disabled
          >
            <Bell className="h-4 w-4" />
          </button>
        ) : user ? (
          <DropdownMenu
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          >
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-foreground transition hover:bg-muted/60"
                aria-label="Open notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {unreadCount}
                  </span>
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              sideOffset={12}
              className="z-[9999] w-80 border border-border/70 bg-background"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold">Notifications</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </Button>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {notificationsBusy ? (
                  <div className="px-3 py-3 text-sm text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : null}
                {!notificationsBusy && notifications.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : null}
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex cursor-pointer flex-col items-start gap-1 py-2"
                    onClick={async () => {
                      await handleNotificationRead(notification.id);
                      setNotificationsOpen(false);
                      if (notification.link) {
                        router.push(notification.link);
                      }
                    }}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {notification.title}
                      </span>
                      {!notification.read ? (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      ) : null}
                    </div>
                    {notification.body ? (
                      <span className="text-xs text-muted-foreground">
                        {notification.body}
                      </span>
                    ) : null}
                    {notification.createdAt ? (
                      <span className="text-[11px] text-muted-foreground">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-md shadow-none lg:hidden"
              aria-label="Open navigation"
            >
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[min(22rem,90vw)]">
            <SheetHeader className="px-5 pt-5 pb-3 text-left">
              <SheetTitle className="text-lg">NSF CURE SBP</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Quick links and search
              </SheetDescription>
            </SheetHeader>

            <div className="px-5 pb-6 space-y-4">
              {!resolvedUser ? null : user ? (
                <div className="border-y border-border/60 bg-muted/20 px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border/50">
                      <AvatarImage src="" alt={displayName} />
                      <AvatarFallback className="bg-background text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Logged in as
                      </div>
                      <div className="text-foreground">
                        {displayName} • {user.email}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex w-full items-center gap-2 rounded-[10px] border border-border/70 bg-muted/30 px-3 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-muted/50"
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden />
                <span>Search lessons, topics, and resources…</span>
              </button>

              <div className="grid gap-2 text-foreground text-base">
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 transition hover:bg-muted"
                >
                  Home
                </Link>
                {pages.map((page) => {
                  const href =
                    page.slug === "learning" ? "/learning" : `/${page.slug}`;
                  return (
                    <Link
                      key={page.id}
                      href={href}
                      className="rounded-md px-3 py-2 transition hover:bg-muted"
                    >
                      {page.title}
                    </Link>
                  );
                })}
                {!resolvedUser ? null : user ? (
                  <>
                    <Link
                      href="/profile"
                      className="rounded-md px-3 py-2 transition hover:bg-muted"
                    >
                      My profile
                    </Link>
                    <Link
                      href="/saved-lessons"
                      className="rounded-md px-3 py-2 transition hover:bg-muted"
                    >
                      Saved lessons
                    </Link>
                    <Link
                      href="/settings"
                      className="rounded-md px-3 py-2 transition hover:bg-muted"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/data-transparency"
                      className="rounded-md px-3 py-2 transition hover:bg-muted"
                    >
                      Privacy & data
                    </Link>
                    <div className="flex items-center justify-between rounded-md px-3 py-2">
                      <span className="text-sm text-muted-foreground">Appearance</span>
                      <ThemeToggle
                        variant="icon"
                        className="hover:bg-muted/60"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={authBusy}
                      className="rounded-md px-3 py-2 text-left text-foreground transition hover:bg-red-500/10 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-red-300"
                    >
                      {authBusy ? "Signing out…" : "Sign out"}
                    </button>
                  </>
                ) : (
                  <LoginLink
                    className="rounded-md px-3 py-2 transition hover:bg-muted"
                  >
                    Sign In
                  </LoginLink>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </nav>
    </header>
  );
}

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
