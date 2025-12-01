import React from "react";
import { cookies } from "next/headers";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import AppSidebar from "@/components/admin-panel/sidebar";
import Footer from "@/components/Footer";
import { getClassesTree } from "@/lib/strapiSdk/root";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // restore open/closed state if you want
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const classes = await getClassesTree();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-dvh bg-background text-foreground flex">
        {/* LEFT: Salimi sidebar with your dynamic items */}
        <AppSidebar classes={classes} />

        {/* RIGHT: main content (no TOC) lives in SidebarInset */}
        <SidebarInset className="flex-1">
          <div
            id="layout"
            className="min-h-dvh flex flex-col"
          >
            <main className="min-w-0 overflow-x-hidden p-6 lg:px-8 flex-1">
              <div
                id="content"
                className="mx-auto w-full max-w-[var(--content-max,100ch)] transition-[max-width] duration-300"
              >
                {children}
              </div>
            </main>

            <footer className="border-t bg-background/80 backdrop-blur py-8 px-6 text-center text-sm text-muted-foreground">
              <Footer />
            </footer>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
