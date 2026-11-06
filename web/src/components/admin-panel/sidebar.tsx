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
  // Skip width transitions until the persisted store has hydrated so the
  // first paint doesn't animate open→closed (the "tweaking" clip).
  const [transitionsReady, setTransitionsReady] = React.useState(false);
  React.useEffect(() => {
    if (!sidebarStore) return;
    const id = window.requestAnimationFrame(() => setTransitionsReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [sidebarStore]);

  const toggle = () => sidebarStore?.toggleOpen();

  return (
    <Sidebar
      className={cn(
        "relative h-full min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground",
        transitionsReady && "transition-[width] duration-200",
        isOpen ? "w-64" : "w-14",
        className
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-20 flex min-h-10 items-center bg-sidebar/95 py-1 backdrop-blur",
          isOpen ? "gap-2 pl-4 pr-2" : "justify-center px-1"
        )}
      >
        {isOpen ? (
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/70">
            Study Topics
          </div>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-sm text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isOpen && "ml-auto"
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
          "relative flex-1 min-h-0 overflow-hidden px-0 py-2",
          transitionsReady && "transition-[opacity,visibility] duration-150",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden px-3 pb-2">
          <SidebarClient classes={classes} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
