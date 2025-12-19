"use client";

import * as React from "react";
import { ChevronLeft, PanelLeftClose } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { useSidebar } from "@/hooks/use-sidebar";

import SidebarClient from "@/components/navigation/SidebarClient";

type LessonNav = { slug: string; title: string };
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
        "relative border-r bg-background min-h-dvh h-full flex-col overflow-hidden lg:sticky lg:top-[var(--nav-h,4rem)] lg:h-[calc(100vh-var(--nav-h,4rem))] transition-[width] duration-200",
        isOpen ? "w-64" : "w-14",
        className
      )}
    >
      {/* Toggle rail */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "absolute -right-4 top-4 z-30 h-8 w-8 rounded-full border border-border/70 bg-muted/80 text-foreground shadow-sm hover:bg-muted transition flex items-center justify-center",
          isOpen ? "-right-0" : "right-2"
        )}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", isOpen ? "" : "rotate-180")} />
      </button>

      <div className="sticky top-0 z-20 flex items-center justify-between px-3 py-2 border-b border-border/60 bg-background/95 backdrop-blur">
        <div
          className={cn(
            "text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-opacity duration-150",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          Study Topics
        </div>
      </div>

      {/* Inner scrollable content of the shell */}
      <SidebarContent
        className={cn(
          "relative flex-1 min-h-0 px-0 py-4 overflow-hidden transition-[opacity,visibility] duration-150",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <div className="h-full overflow-y-auto pr-1">
          <SidebarClient classes={classes} />
        </div>
      </SidebarContent>

      {/* Thin rail shown when collapsed (clickable) */}
    </Sidebar>
  );
}
