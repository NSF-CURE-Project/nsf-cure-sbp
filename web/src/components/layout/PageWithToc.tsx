// src/components/layout/PageWithToc.tsx
import React from "react";
import Toc from "@/components/navigation/Toc";
import Footer from "@/components/Footer";

export function PageWithToc({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="layout"
      className="
        min-h-dvh
        grid grid-cols-1
        lg:grid-cols-[minmax(0,1fr)_var(--toc-w,14rem)]
        lg:gap-[var(--toc-gap,1.25rem)]
      "
      style={{ gridTemplateRows: "1fr auto" }}
    >
      {/* MAIN CONTENT */}
      <main className="min-w-0 overflow-x-hidden p-6 lg:px-8 lg:row-start-1">
        <div id="content" className="w-full">
          {children}
        </div>
      </main>

      {/* TOC – fixed width via CSS var (default 14rem) */}
      <aside
        className="hidden lg:block lg:row-start-1 relative"
        style={{ width: "var(--toc-w,14rem)" }}
      >
        <Toc />
      </aside>

      {/* FOOTER */}
      <footer className="border-t bg-background/80 backdrop-blur py-8 px-6 text-center text-sm text-muted-foreground col-span-full lg:row-start-2">
        <Footer />
      </footer>
    </div>
  );
}
