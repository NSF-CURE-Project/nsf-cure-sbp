"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/admin-panel/sidebar";
import { MobileSidebar } from "@/components/admin-panel/mobile-sidebar";
import Footer from "@/components/Footer";
import LockBodyScroll from "@/components/layout/LockBodyScroll";
import { isAuthRoute } from "@/lib/routes/authRoutes";

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
  const authOnly = isAuthRoute(pathname);

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

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <LockBodyScroll />
      <div className="relative h-[calc(100dvh-var(--nav-h,4rem))] bg-background text-foreground flex overflow-hidden">
        <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-[var(--nav-h,4rem)] lg:h-[calc(100vh-var(--nav-h,4rem))] lg:w-64 lg:z-30 lg:bg-background">
          <AppSidebar classes={sidebarClasses} />
        </div>

        <SidebarInset className="flex-1 flex flex-col min-w-0 h-[calc(100dvh-var(--nav-h,4rem))] overflow-hidden lg:ml-64">
          <div
            id="layout"
            className="h-full flex flex-col overflow-y-scroll overflow-x-hidden"
            style={{ scrollbarGutter: "stable" }}
          >
            <main className="min-w-0 p-4 sm:p-6 lg:px-8 flex-1">
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

            <footer className="border-t bg-background/80 backdrop-blur py-8 px-6 text-center text-sm text-muted-foreground w-full">
              <Footer />
            </footer>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
