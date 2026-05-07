import React from "react";

import AccountHeartbeat from "@/components/AccountHeartbeat";
import Navbar from "@/components/navigation/navbar";

// Personal/account routes (dashboard, profile, settings, etc.) get a narrow
// content column and the standard nav. No sidebar — these pages are about
// the signed-in user, not browsing course content.
export default function PersonalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-4xl px-6 pt-6 pb-10">
          {children}
        </div>
      </div>
      <AccountHeartbeat />
    </>
  );
}
