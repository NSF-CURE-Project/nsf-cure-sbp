import React, { Suspense } from "react";

import AccountHeartbeat from "@/components/AccountHeartbeat";
import ContentShell from "@/components/layout/ContentShell";
import Navbar from "@/components/navigation/navbar";
import SidebarData from "@/components/layout/SidebarData";
import {
  MobileSidebarFallback,
  SidebarFallback,
} from "@/components/layout/SidebarFallback";

// Public, browsable content (home, lessons, classes, search, …). Renders the
// nav + sidebar shell. No `cookies()` / `draftMode()` reads — the sidebar
// open/closed state hydrates from the cookie on the client (see
// ContentShell), and draft mode is only consulted by the /preview/* routes.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <ContentShell
        sidebarSlot={
          <Suspense fallback={<SidebarFallback />}>
            <SidebarData draft={false} variant="desktop" />
          </Suspense>
        }
        mobileSidebarSlot={
          <Suspense fallback={<MobileSidebarFallback />}>
            <SidebarData draft={false} variant="mobile" />
          </Suspense>
        }
      >
        {children}
      </ContentShell>
      <AccountHeartbeat />
    </>
  );
}
