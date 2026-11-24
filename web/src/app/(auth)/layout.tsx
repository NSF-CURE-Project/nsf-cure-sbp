import React from "react";

import { AuthHeader } from "@/components/auth/AuthHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AuthHeader />
      {children}
    </div>
  );
}
