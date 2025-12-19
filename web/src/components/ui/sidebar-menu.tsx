"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Root menu list                                                     */
/* ------------------------------------------------------------------ */

export type SidebarMenuProps = React.HTMLAttributes<HTMLUListElement>;

export function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return (
    <ul
      className={cn("flex flex-col gap-1 px-2 py-1", className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Top-level menu item + button                                       */
/* ------------------------------------------------------------------ */

export type SidebarMenuItemProps = React.LiHTMLAttributes<HTMLLIElement>;

export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return <li className={cn("relative", className)} {...props} />;
}

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(function SidebarMenuButton(
  { asChild, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Sub-menu (for nested items)                                        */
/* ------------------------------------------------------------------ */

export type SidebarMenuSubProps = React.HTMLAttributes<HTMLUListElement>;

export function SidebarMenuSub({ className, ...props }: SidebarMenuSubProps) {
  return (
    <ul
      className={cn(
        "mt-1 space-y-1 border-l border-border/50 pl-3",
        className
      )}
      {...props}
    />
  );
}

export type SidebarMenuSubItemProps = React.LiHTMLAttributes<HTMLLIElement>;

export function SidebarMenuSubItem({
  className,
  ...props
}: SidebarMenuSubItemProps) {
  return <li className={cn("relative", className)} {...props} />;
}

export interface SidebarMenuSubButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuSubButtonProps
>(function SidebarMenuSubButton(
  { asChild, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs",
        "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
});
