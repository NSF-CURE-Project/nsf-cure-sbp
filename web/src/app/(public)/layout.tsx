import React, { Suspense } from "react";

import AccountHeartbeat from "@/components/AccountHeartbeat";
import ContentShell from "@/components/layout/ContentShell";
import CookieBanner from "@/components/layout/CookieBanner";
import Navbar from "@/components/navigation/navbar";
import SidebarData from "@/components/layout/SidebarData";
import { getSiteBranding } from "@/lib/payloadSdk/siteBranding";
import {
  MobileSidebarFallback,
  SidebarFallback,
} from "@/components/layout/SidebarFallback";

// Public, browsable content (home, lessons, classes, search, …). Renders the
// nav + sidebar shell. No `cookies()` / `draftMode()` reads — the sidebar
// open/closed state hydrates from the cookie on the client (see
// ContentShell), and draft mode is only consulted by the /preview/* routes.
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteBranding = await getSiteBranding({ revalidate: 60 });
  const navHeight = siteBranding.announcement ? "6rem" : "4rem";

  return (
    <div style={{ "--nav-h": navHeight } as React.CSSProperties}>
      <Navbar announcement={siteBranding.announcement} />
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
      <CookieBanner />
    </div>
  );
}
