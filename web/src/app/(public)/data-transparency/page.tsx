import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DataTransparencyShell } from "@/components/profile/DataTransparencyShell";

type AccountUser = { id: string };

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

export default async function DataTransparencyPage() {
  const base = await buildBaseUrl();
  if (!base) redirect("/login?next=/data-transparency");

  const meRes = await fetch(`${base.base}/api/accounts/me`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!meRes.ok) redirect("/login?next=/data-transparency");

  const me = (await meRes.json()) as { user?: AccountUser };
  if (!me.user?.id) redirect("/login?next=/data-transparency");

  const summaryRes = await fetch(`${base.base}/api/accounts/me/data-summary`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!summaryRes.ok) throw new Error("Unable to load your data summary.");

  const summary = await summaryRes.json();
  return <DataTransparencyShell data={summary} />;
}
