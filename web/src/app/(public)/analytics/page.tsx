import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AnalyticsDashboardShell } from "@/components/analytics/AnalyticsDashboardShell";

type AccountUser = {
  id: string;
};

type AnalyticsPayload = {
  totalLessonsCompleted: number;
  totalTimeSpentSec: number;
  quizScoreHistory: { date: string | null; scorePercent: number; attemptId: string }[];
  recentActivity: {
    date: string;
    lessonsCompleted: number;
    quizzesTaken: number;
  }[];
  currentStreak: number;
  longestStreak: number;
  classroomSummaries: {
    classroomId: string;
    classroomTitle: string;
    classTitle: string;
    completionRate: number;
    completedLessons: number;
    totalLessons: number;
  }[];
};

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

export default async function AnalyticsPage() {
  const base = await buildBaseUrl();
  if (!base) redirect("/login?next=/analytics");

  const meRes = await fetch(`${base.base}/api/accounts/me`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!meRes.ok) redirect("/login?next=/analytics");

  const me = (await meRes.json()) as { user?: AccountUser };
  if (!me.user?.id) redirect("/login?next=/analytics");

  const analyticsRes = await fetch(`${base.base}/api/analytics/student`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!analyticsRes.ok) {
    throw new Error("Unable to load analytics.");
  }

  const analytics = (await analyticsRes.json()) as AnalyticsPayload;
  return <AnalyticsDashboardShell data={analytics} />;
}
