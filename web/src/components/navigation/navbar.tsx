"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { ChevronDown, LogOut, Menu, Search, Settings, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ email: string; fullName?: string } | null>(null);
  const [pages, setPages] = useState<{ id: string; slug: string; title: string }[]>([]);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => setMounted(true), []);
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
        const data = (await res.json()) as { user?: { email: string; fullName?: string } };
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
        const res = await fetch(`${PAYLOAD_URL}/api/pages?limit=100&sort=title`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setPages([]);
          return;
        }
        const data = (await res.json()) as {
          docs?: { id: string; slug: string; title: string }[];
        };
        setPages((data.docs ?? []).filter((page) => page.slug && page.slug !== "home"));
      } catch (error) {
        if (!controller.signal.aborted) {
          setPages([]);
        }
      }
    };
    loadPages();
    return () => controller.abort();
  }, []);

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
          className="hover:text-primary transition-colors"
        >
          Home
        </Link>
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/${page.slug}`}
            className="hover:text-primary transition-colors"
          >
            {page.title}
          </Link>
        ))}
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-2">
        <form
          role="search"
          className="relative hidden md:block w-48 lg:w-56"
          action="/search"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search program..."
            className="h-10 rounded-lg border-border/80 bg-muted/40 pl-9 pr-3 text-sm shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </form>
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
              sideOffset={8}
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
            className="hidden md:inline-flex items-center rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
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
    </nav>
  );
}
