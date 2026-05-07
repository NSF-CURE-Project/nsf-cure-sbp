import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { CertificateDownloadShell } from "@/components/profile/CertificateDownloadShell";

type RouteParams = {
  classroomId: string;
};

type MembershipDoc = {
  completionRate?: number;
  classroom?: {
    id?: string | number;
    title?: string;
    class?: {
      title?: string;
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

export default async function ClassroomCertificatePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { classroomId } = await params;
  const base = await buildBaseUrl();
  if (!base) notFound();

  const meRes = await fetch(`${base.base}/api/accounts/me`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!meRes.ok) {
    redirect(`/login?next=${encodeURIComponent(`/classrooms/${classroomId}/certificate`)}`);
  }

  const me = (await meRes.json()) as { user?: { id?: string } };
  const userId = me.user?.id;
  if (!userId) {
    redirect(`/login?next=${encodeURIComponent(`/classrooms/${classroomId}/certificate`)}`);
  }

  const paramsQuery = new URLSearchParams({
    depth: "2",
    limit: "1",
  });
  paramsQuery.set("where[classroom][equals]", classroomId);
  paramsQuery.set("where[student][equals]", userId);

  const membershipRes = await fetch(
    `${base.base}/api/classroom-memberships?${paramsQuery.toString()}`,
    {
      headers: base.cookie ? { cookie: base.cookie } : undefined,
      cache: "no-store",
    }
  );
  if (!membershipRes.ok) {
    throw new Error("Unable to load classroom membership.");
  }

  const membershipPayload = (await membershipRes.json()) as { docs?: MembershipDoc[] };
  const membership = membershipPayload.docs?.[0];
  if (!membership) notFound();

  const classroomTitle = membership.classroom?.title ?? "Classroom";
  const classTitle = membership.classroom?.class?.title ?? "Class";
  const completionRate =
    typeof membership.completionRate === "number" ? membership.completionRate : 0;

  return (
    <CertificateDownloadShell
      classroomId={classroomId}
      classroomTitle={classroomTitle}
      classTitle={classTitle}
      completionRate={completionRate}
    />
  );
}
