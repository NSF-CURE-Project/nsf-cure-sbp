"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/admin-panel/sidebar";
import { MobileSidebar } from "@/components/admin-panel/mobile-sidebar";
import Footer from "@/components/Footer";
import { isAuthRoute, shouldHideSidebar } from "@/lib/routes/authRoutes";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

type SidebarLesson = { title: string; slug: string };
type SidebarModule = { title: string; slug: string; lessons: SidebarLesson[] };
type SidebarClass = { title: string; slug: string; modules: SidebarModule[] };

type PublicLayoutShellProps = {
  children: React.ReactNode;
  defaultOpen: boolean;
  sidebarClasses: SidebarClass[];
};

export default function PublicLayoutShell({
  children,
  defaultOpen,
  sidebarClasses,
}: PublicLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarStore = useStore(useSidebar, (s) => s);
  const sidebarOpen = sidebarStore?.getOpenState() ?? defaultOpen;
  const authOnly = isAuthRoute(pathname);
  const hideSidebar = shouldHideSidebar(pathname);

  if (authOnly) {
    const handleBack = () => {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    };

    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="px-6 pt-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/60"
          >
            <span aria-hidden="true">←</span>
            Back
          </button>
        </div>
        <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl">{children}</div>
        </div>
      </div>
    );
  }

  if (hideSidebar) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-4xl px-6 pt-6 pb-10">
          {children}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="relative min-h-[calc(100dvh-var(--nav-h,4rem))] bg-background text-foreground flex flex-col">
        <div
          className={cn(
            "flex-1 grid",
            sidebarOpen ? "lg:grid-cols-[16rem_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)]"
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
            <AppSidebar classes={sidebarClasses} />
          </div>

          <SidebarInset
            className={cn(
              "flex flex-col min-w-0",
              sidebarOpen && "lg:col-start-2"
            )}
          >
            <div
              id="layout"
              className="min-h-full flex flex-col"
              style={{ scrollbarGutter: "stable" }}
            >
              <main className="min-w-0 px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6 lg:px-8 flex-1">
                <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
                  <MobileSidebar classes={sidebarClasses} />
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
        <Footer />
      </div>
    </SidebarProvider>
  );
}
