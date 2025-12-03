"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";

import SidebarClient from "@/components/navigation/SidebarClient";

type LessonNav = { slug: string; title: string };
type ModuleNav = { slug: string; title: string; lessons: LessonNav[] };
type ClassNav = { slug: string; title: string; modules: ModuleNav[] };

type AppSidebarProps = {
  classes: ClassNav[];
};

export default function AppSidebar({ classes }: AppSidebarProps) {
  return (
    <Sidebar
      className="w-64 border-r bg-background"
    >
      {/* Inner scrollable content of the shell */}
      <SidebarContent className="px-0 py-4">
        <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Topics
        </div>
        <SidebarClient classes={classes} />
      </SidebarContent>

      {/* Thin rail shown when collapsed (clickable) */}
    </Sidebar>
  );
}
