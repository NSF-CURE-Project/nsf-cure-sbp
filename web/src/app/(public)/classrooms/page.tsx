import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ClassroomsShell } from "@/components/dashboard/ClassroomsShell";

type AccountUser = {
  id: string;
};

type ClassroomMembership = {
  id: string | number;
  totalLessons?: number;
  completedLessons?: number;
  completionRate?: number;
  lastActivityAt?: string | null;
  classroom?: {
    id?: string | number;
    title?: string;
    class?: {
      title?: string;
      slug?: string;
    };
  };
};

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

export default async function ClassroomsPage() {
  const base = await buildBaseUrl();
  if (!base) redirect("/login?next=/classrooms");

  const meRes = await fetch(`${base.base}/api/accounts/me`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!meRes.ok) redirect("/login?next=/classrooms");

  const me = (await meRes.json()) as { user?: AccountUser };
  const userId = me.user?.id;
  if (!userId) redirect("/login?next=/classrooms");

  const params = new URLSearchParams({
    depth: "2",
    limit: "50",
  });
  params.set("where[student][equals]", userId);

  const membershipsRes = await fetch(
    `${base.base}/api/classroom-memberships?${params.toString()}`,
    {
      headers: base.cookie ? { cookie: base.cookie } : undefined,
      cache: "no-store",
    }
  );
  if (!membershipsRes.ok) {
    throw new Error("Unable to load classrooms.");
  }

  const membershipsPayload = (await membershipsRes.json()) as {
    docs?: ClassroomMembership[];
  };
  const classrooms = (membershipsPayload.docs ?? []).map((membership) => ({
    id: String(membership.id),
    classroomId: String(membership.classroom?.id ?? ""),
    classroomTitle: membership.classroom?.title ?? "Classroom",
    classTitle: membership.classroom?.class?.title ?? "Class",
    classSlug: membership.classroom?.class?.slug ?? undefined,
    completionRate:
      typeof membership.completionRate === "number" ? membership.completionRate : 0,
    completedLessons:
      typeof membership.completedLessons === "number" ? membership.completedLessons : 0,
    totalLessons: typeof membership.totalLessons === "number" ? membership.totalLessons : 0,
    lastActivityAt: membership.lastActivityAt ?? null,
  }));

  return <ClassroomsShell classrooms={classrooms} />;
}
