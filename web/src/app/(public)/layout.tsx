// src/app/(public)/layout.tsx
import React from "react";
import { cookies, draftMode } from "next/headers";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import AppSidebar from "@/components/admin-panel/sidebar";
import { MobileSidebar } from "@/components/admin-panel/mobile-sidebar";
import Footer from "@/components/Footer";

import { getClassesTree } from "@/lib/payloadSdk/classes";
import type {
  ClassDoc,
  ChapterDoc,
  LessonDoc,
} from "@/lib/payloadSdk/types";

// Ensure this layout is always rendered on the server with fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // restore open/closed state if you want
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const { isEnabled: isPreview } = await draftMode();

  const payloadClasses = await getClassesTree({ draft: isPreview });

  // ------ NORMALIZE FOR SIDEBAR (Strapi-style shape) ------
  const sidebarClasses = normalizeClassesForSidebar(payloadClasses);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="relative min-h-dvh bg-background text-foreground flex overflow-x-hidden">
        {/* LEFT: sticky, fixed-width sidebar (overlays footer) */}
        <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-[var(--nav-h,4rem)] lg:h-[calc(100vh-var(--nav-h,4rem))] lg:w-64 lg:z-30 lg:bg-background">
          <AppSidebar classes={sidebarClasses as any} />
        </div>

        {/* RIGHT: main column with left padding to clear sidebar */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <div id="layout" className="min-h-dvh flex flex-col">
            <main className="min-w-0 overflow-x-hidden p-4 sm:p-6 lg:px-8 flex-1">
              <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
                <MobileSidebar classes={sidebarClasses as any} />
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

/**
 * Map Payload classes → old sidebar ClassItem shape:
 * {
 *   slug, title,
 *   modules: [
 *     { slug, title, lessons: [{ slug, title }] }
 *   ]
 * }
 */
function normalizeClassesForSidebar(classes: ClassDoc[]) {
  return classes.map((cls: ClassDoc) => {
    const c: any = cls;

    const title =
      typeof c.title === "string" && c.title.trim()
        ? c.title
        : "Untitled class";

    const slug = typeof c.slug === "string" ? c.slug : "";

    const chapters: ChapterDoc[] = Array.isArray(c.chapters)
      ? (c.chapters as ChapterDoc[])
      : [];

    const modules = chapters.map((ch: any) => {
      const chapterTitle =
        typeof ch?.title === "string" && ch.title.trim()
          ? ch.title
          : "Untitled chapter";

      const chapterSlug = typeof ch?.slug === "string" ? ch.slug : "";

      const rawLessons: LessonDoc[] = Array.isArray(ch?.lessons)
        ? (ch.lessons as LessonDoc[])
        : [];

      const lessons = rawLessons
        .map((l: any) => ({
          title:
            typeof l?.title === "string" && l.title.trim()
              ? l.title
              : "Untitled lesson",
          slug: typeof l?.slug === "string" ? l.slug : "",
        }))
        .filter((l) => l.slug); // drop invalid entries

      return {
        title: chapterTitle,
        slug: chapterSlug,
        lessons,
      };
    });

    return {
      title,
      slug,
      modules,
    };
  });
}
