"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { useSidebar } from "@/hooks/use-sidebar";

import SidebarClient from "@/components/navigation/SidebarClient";

type LessonNav = { id: string | number; slug: string; title: string };
type ModuleNav = { slug: string; title: string; lessons: LessonNav[] };
type ClassNav = { slug: string; title: string; modules: ModuleNav[] };

type AppSidebarProps = {
  classes: ClassNav[];
  className?: string;
};

export default function AppSidebar({ classes, className }: AppSidebarProps) {
  const sidebarStore = useStore(useSidebar, (s) => s);
  const isOpen = sidebarStore?.getOpenState() ?? true;

  const toggle = () => sidebarStore?.toggleOpen();

  return (
    <Sidebar
      className={cn(
        "relative h-full min-h-0 flex-col overflow-hidden bg-[#fcfcfd] transition-[width] duration-200",
        isOpen ? "w-64" : "w-14",
        className
      )}
    >
      <div className="sticky top-0 z-20 flex min-h-10 items-center gap-2 bg-[#fcfcfd]/95 py-1 pl-4 pr-2 backdrop-blur">
        <div
          className={cn(
            "text-[12px] font-semibold uppercase tracking-[0.08em] text-[#667085] transition-opacity duration-150",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          Study Topics
        </div>
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "ml-auto flex h-8 w-8 items-center justify-center rounded-sm text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#172033]",
            !isOpen && "absolute right-2 top-1"
          )}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              isOpen ? "" : "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Inner scrollable content of the shell */}
      <SidebarContent
        className={cn(
          "relative flex-1 min-h-0 overflow-hidden px-0 py-2 transition-[opacity,visibility] duration-150",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <div className="h-full overflow-y-auto px-3 pb-2">
          <SidebarClient classes={classes} />
        </div>
      </SidebarContent>

      {/* Thin rail shown when collapsed (clickable) */}
    </Sidebar>
  );
}
