"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ----------------- Context / Provider ----------------- */

type SidebarContextValue = {
  open: boolean;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  defaultOpen = true,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  const value = React.useMemo(
    () => ({
      open,
      toggle: () => setOpen((prev) => !prev),
    }),
    [open]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

function useSidebarContext() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebarContext must be used within SidebarProvider");
  }
  return ctx;
}

/* ----------------- Root sidebar shell ----------------- */

type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  collapsible?: "icon" | "off";
};

export function Sidebar({
  className,
  collapsible = "icon",
  ...props
}: SidebarProps) {
  const { open } = useSidebarContext();

  return (
    <aside
      data-sidebar-collapsible={collapsible}
      data-sidebar-open={open ? "true" : "false"}
      className={cn(
        "relative flex h-dvh w-64 flex-col bg-[hsl(var(--background)/0.92)] transition-[width] duration-200",
        !open && collapsible === "icon" && "w-14",
        className
      )}
      {...props}
    />
  );
}

/* ----------------- Inner content area ----------------- */

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-3", className)} {...props} />
  );
}

/* ----------------- Inset (main area wrapper) ---------- */

export function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-sidebar-inset
      className={cn("flex min-h-dvh flex-1", className)}
      {...props}
    />
  );
}
