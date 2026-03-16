import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ClassroomRosterTable } from "@/components/instructor/ClassroomRosterTable";
import { ClassroomStatsHeader } from "@/components/instructor/ClassroomStatsHeader";

type RouteParams = { classroomId: string };

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

export default async function InstructorClassroomDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { classroomId } = await params;
  const base = await buildBaseUrl();
  if (!base) redirect("/dashboard");

  const res = await fetch(
    `${base.base}/api/instructor/classrooms/${encodeURIComponent(classroomId)}/roster`,
    {
      headers: base.cookie ? { cookie: base.cookie } : undefined,
      cache: "no-store",
    }
  );

  if (res.status === 404) notFound();
  if (!res.ok) redirect("/dashboard");

  const payload = (await res.json()) as {
    classroom: { title: string };
    students: {
      accountId: string;
      name: string;
      email: string | null;
      completedLessons: number;
      totalLessons: number;
      completionRate: number;
      lastActivityAt: string | null;
      joinedAt: string | null;
    }[];
  };

  const enrollmentCount = payload.students.length;
  const averageCompletionRate =
    enrollmentCount > 0
      ? payload.students.reduce((sum, student) => sum + student.completionRate, 0) /
        enrollmentCount
      : 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activeThisWeek = payload.students.filter((student) => {
    const timestamp = new Date(student.lastActivityAt ?? 0).getTime();
    return Number.isFinite(timestamp) && timestamp >= weekAgo;
  }).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Instructor portal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          {payload.classroom.title}
        </h1>
      </header>

      <ClassroomStatsHeader
        enrollmentCount={enrollmentCount}
        averageCompletionRate={averageCompletionRate}
        activeThisWeek={activeThisWeek}
      />
      <ClassroomRosterTable students={payload.students} />
    </div>
  );
}
