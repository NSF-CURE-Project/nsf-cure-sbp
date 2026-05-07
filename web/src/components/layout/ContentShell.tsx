"use client";

import React, { useEffect, useState } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

const SIDEBAR_COOKIE = "sidebar_state";

const readSidebarCookie = (): boolean | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SIDEBAR_COOKIE}=`));
  if (!match) return null;
  const value = match.slice(SIDEBAR_COOKIE.length + 1);
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
};

type ContentShellProps = {
  children: React.ReactNode;
  sidebarSlot?: React.ReactNode;
  mobileSidebarSlot?: React.ReactNode;
};

export default function ContentShell({
  children,
  sidebarSlot,
  mobileSidebarSlot,
}: ContentShellProps) {
  // Default to collapsed during the first paint to avoid layout shift on
  // narrow screens; hydrate from the cookie once we're on the client.
  const [defaultOpen, setDefaultOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const cookie = readSidebarCookie();
    setDefaultOpen(cookie ?? true);
  }, []);

  const sidebarStore = useStore(useSidebar, (s) => s);
  const sidebarOpen = sidebarStore?.getOpenState() ?? defaultOpen ?? true;

  return (
    <SidebarProvider defaultOpen={defaultOpen ?? true}>
      <div className="relative min-h-[calc(100dvh-var(--nav-h,4rem))] bg-background text-foreground flex flex-col">
        <div
          className={cn(
            "flex-1 grid",
            sidebarOpen
              ? "lg:grid-cols-[16rem_minmax(0,1fr)]"
              : "lg:grid-cols-[minmax(0,1fr)]"
          )}
        >
          <div
            className={cn(
              "hidden lg:flex lg:flex-col lg:bg-background lg:shadow-[0_1px_0_rgba(15,23,42,0.04)]",
              sidebarOpen
                ? "lg:sticky lg:top-[var(--nav-h,4rem)] lg:h-[calc(100dvh-var(--nav-h,4rem))]"
                : "lg:fixed lg:left-0 lg:top-[var(--nav-h,4rem)] lg:h-[calc(100dvh-var(--nav-h,4rem))] lg:w-14 lg:z-30"
            )}
          >
            {sidebarSlot}
          </div>

          <SidebarInset
            className={cn(
              "flex flex-col min-w-0",
              sidebarOpen ? "lg:col-start-2" : "lg:pl-14"
            )}
          >
            <div
              id="layout"
              className="min-h-full flex flex-col"
              style={{ scrollbarGutter: "stable" }}
            >
              <main className="min-w-0 px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6 lg:px-8 flex-1">
                <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
                  {mobileSidebarSlot}
                  <span className="text-xs text-muted-foreground">
                    Tap to browse classes and lessons
                  </span>
                </div>

                <div
                  id="content"
                  className="mx-auto w-full max-w-[var(--content-max,100ch)] transition-[max-width] duration-300"
                >
                  {children}
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
        <Footer contentOffsetClassName={sidebarOpen ? "" : "lg:pl-14"} />
      </div>
    </SidebarProvider>
  );
}
