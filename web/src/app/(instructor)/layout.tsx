import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const base = await buildBaseUrl();
  if (!base) redirect("/dashboard");

  const meRes = await fetch(`${base.base}/api/users/me`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!meRes.ok) redirect("/dashboard");

  const me = (await meRes.json()) as {
    user?: { role?: string };
  };
  if (!["professor", "admin"].includes(me.user?.role ?? "")) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}
