import React from "react";

import AuthBackButton from "@/components/layout/AuthBackButton";

// Auth pages self-contain their inner card / hero composition. The layout
// just provides the body chrome and the back button.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="sticky top-4 z-40 px-6 pt-4">
        <AuthBackButton />
      </div>
      {children}
    </div>
  );
}
