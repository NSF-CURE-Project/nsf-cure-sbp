// src/app/(public)/layout.tsx
import React, { Suspense } from "react";
import { cookies, draftMode } from "next/headers";

import PublicLayoutShell from "@/components/layout/PublicLayoutShell";
import SidebarData from "@/components/layout/SidebarData";
import {
  MobileSidebarFallback,
  SidebarFallback,
} from "@/components/layout/SidebarFallback";

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

  return (
    <PublicLayoutShell
      defaultOpen={defaultOpen}
      sidebarSlot={
        <Suspense fallback={<SidebarFallback />}>
          <SidebarData draft={isPreview} variant="desktop" />
        </Suspense>
      }
      mobileSidebarSlot={
        <Suspense fallback={<MobileSidebarFallback />}>
          <SidebarData draft={isPreview} variant="mobile" />
        </Suspense>
      }
    >
      {children}
    </PublicLayoutShell>
  );
}
