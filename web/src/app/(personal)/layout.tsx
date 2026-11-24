import React from "react";

import AccountHeartbeat from "@/components/AccountHeartbeat";
import Navbar from "@/components/navigation/navbar";
import { getSiteBranding } from "@/lib/payloadSdk/siteBranding";

// Personal/account routes (dashboard, profile, settings, etc.) get a narrow
// content column and the standard nav. No sidebar — these pages are about
// the signed-in user, not browsing course content.
export default async function PersonalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteBranding = await getSiteBranding({ revalidate: 60 });
  const navHeight = siteBranding.announcement ? "6rem" : "4rem";

  return (
    <div style={{ "--nav-h": navHeight } as React.CSSProperties}>
      <Navbar announcement={siteBranding.announcement} />
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-4xl px-6 pt-6 pb-10">
          {children}
        </div>
      </div>
      <AccountHeartbeat />
    </div>
  );
}
