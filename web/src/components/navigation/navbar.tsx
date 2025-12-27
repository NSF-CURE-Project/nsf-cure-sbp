"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

export default function Navbar() {
  const { resolvedTheme, theme, systemTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; fullName?: string } | null>(null);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; body?: string; read?: boolean; createdAt?: string }[]
  >([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [pages, setPages] = useState<
    { id: string; slug: string; title: string; navOrder?: number | null }[]
  >([]);
  const [authBusy, setAuthBusy] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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

      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !isTypingTarget)) {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (event.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  }, [searchOpen]);
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
          return;
        }
        const data = (await res.json()) as { user?: { id: string; email: string; fullName?: string } };
        setUser(data?.user ?? null);
      } catch (error) {
        if (!controller.signal.aborted) {
          setUser(null);
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
        const res = await fetch(`${PAYLOAD_URL}/api/pages?limit=100&sort=navOrder`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setPages([]);
          return;
        }
        const data = (await res.json()) as {
          docs?: { id: string; slug: string; title: string; navOrder?: number | null }[];
        };
        const cleaned = (data.docs ?? []).filter(
          (page) => page.slug && page.slug !== "home"
        );
        cleaned.sort((a, b) => {
          const aOrder = typeof a.navOrder === "number" ? a.navOrder : Number.POSITIVE_INFINITY;
          const bOrder = typeof b.navOrder === "number" ? b.navOrder : Number.POSITIVE_INFINITY;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return (a.title ?? "").localeCompare(b.title ?? "");
        });
        setPages(cleaned);
      } catch (error) {
        if (!controller.signal.aborted) {
          setPages([]);
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
          },
        );
        if (!res.ok) {
          setNotifications([]);
          return;
        }
        const data = (await res.json()) as {
          docs?: { id: string; title: string; body?: string; read?: boolean; createdAt?: string }[];
        };
        setNotifications(data.docs ?? []);
      } catch (error) {
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
      setAuthBusy(false);
      window.location.href = "/";
    }
  };

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const query = searchValue.trim();
    if (!query) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
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
  mode === "dark"
    ? "/assets/logos/nsf.png"
    : "/assets/logos/nsf.png";

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
    [notifications],
  );

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
            : notification,
        ),
      );
    } catch (error) {
      // Ignore notification read failures.
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((notification) => !notification.read);
    if (unread.length === 0) return;
    await Promise.all(unread.map((item) => handleNotificationRead(item.id)));
  };

  return (
    <nav
      aria-label="Primary"
      className="
        sticky top-0 z-50
        flex items-center gap-3
        h-16 px-4 sm:px-6 border-b
        bg-background/80 backdrop-blur
        supports-[backdrop-filter]:bg-background/60
      "
    >
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <Link href="/" aria-label="Home" className="flex items-center gap-2">
          <Image
            src={cppLogo}
            alt="Cal Poly Pomona Logo"
            width={48}
            height={48}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <Image
          src={nsfLogo}
          alt="NSF Logo"
          width={110}
          height={72}
          className="h-10 w-auto sm:h-12"
          priority
        />

        <span className="font-semibold text-base sm:text-xl text-foreground truncate">
          NSF CURE SBP
        </span>
      </div>

      {/* Desktop links */}
      <div className="hidden lg:flex items-center gap-5 ml-6 text-sm font-medium text-foreground">
        <Link
          href="/"
          className="relative transition-colors hover:text-foreground after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-foreground/70 after:origin-left after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100"
        >
          Home
        </Link>
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/${page.slug}`}
            className="relative transition-colors hover:text-foreground after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-foreground/70 after:origin-left after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100"
          >
            {page.title}
          </Link>
        ))}
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="hidden md:flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-1 text-[13px] text-muted-foreground shadow-sm transition hover:bg-muted/60"
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search program...</span>
          <span className="ml-2 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
            ⌘K
          </span>
        </button>
        {user ? (
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-foreground shadow-sm transition hover:bg-muted/60"
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
              className="z-[9999] w-80 bg-background shadow-xl"
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
                    onClick={() => handleNotificationRead(notification.id)}
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
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hidden md:inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/40"
              >
                <Avatar className="h-8 w-8 border border-border/50">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="bg-muted/60 text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[140px] truncate">{displayName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="center"
              sideOffset={12}
              alignOffset={0}
              className="z-[9999] w-56 bg-background shadow-xl"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="flex items-center">
                  <UserIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleSignOut}
                disabled={authBusy}
              >
                <LogOut className="mr-3 h-4 w-4 text-muted-foreground" />
                {authBusy ? "Signing out..." : "Logout"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Theme
                  </span>
                  <ThemeToggle variant="icon" className="hover:bg-muted/60" />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className="hidden md:inline-flex h-8 items-center rounded-lg border border-border/70 bg-muted/40 px-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
          >
            Sign In
          </Link>
        )}

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[min(22rem,90vw)]">
            <SheetHeader className="px-5 pt-5 pb-3 text-left space-y-1.5">
              <SheetTitle className="text-lg">NSF CURE SBP</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Quick links and search
              </p>
            </SheetHeader>

            <div className="px-5 pb-6 space-y-4">
              {user ? (
                <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-sm">
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
              <form role="search" action="/search" className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search program..."
                  className="h-10 rounded-lg border-border/80 bg-muted/40 pl-9 pr-3 text-sm shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </form>

              <div className="grid gap-2 text-foreground text-base">
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 transition hover:bg-muted"
                >
                  Home
                </Link>
                {pages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/${page.slug}`}
                    className="rounded-md px-3 py-2 transition hover:bg-muted"
                  >
                    {page.title}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="rounded-md px-3 py-2 transition hover:bg-muted"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="rounded-md px-3 py-2 transition hover:bg-muted"
                    >
                      Settings
                    </Link>
                    <div className="rounded-md px-3 py-2">
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                        Theme
                        <ThemeToggle variant="icon" className="hover:bg-muted/60" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={authBusy}
                      className="rounded-md px-3 py-2 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {authBusy ? "Signing out..." : "Logout"}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-2 transition hover:bg-muted"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      {searchOpen ? (
        <div
          className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="mx-auto mt-24 w-[min(92vw,720px)] rounded-2xl border border-border/70 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <form className="flex-1" onSubmit={handleSearchSubmit}>
                <input
                  ref={searchInputRef}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="What are you searching for?"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </form>
              <button
                type="button"
                className="rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-[11px] font-semibold text-muted-foreground transition hover:bg-muted/60"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                Esc
              </button>
            </div>
            <div className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Quick links
              </div>
              <div className="mt-2 grid gap-2">
                <Link
                  href="/directory"
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground transition hover:bg-muted/40"
                  onClick={() => setSearchOpen(false)}
                >
                  Site Directory
                  <span className="text-xs text-muted-foreground">Browse all pages</span>
                </Link>
                <Link
                  href="/classes"
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground transition hover:bg-muted/40"
                  onClick={() => setSearchOpen(false)}
                >
                  Classes
                  <span className="text-xs text-muted-foreground">Explore lessons</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
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
