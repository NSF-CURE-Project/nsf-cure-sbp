"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ----------------- Context / Provider ----------------- */

type SidebarContextValue = {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen(!open),
    }),
    [open, setOpen]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebarContext() {
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
        // Width is owned by the caller (AppSidebar) so we don't fight the
        // persisted zustand open-state with a second, unsynced width here.
        "relative flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground",
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
