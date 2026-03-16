"use client";

import Link from "next/link";

export type DashboardEnrollment = {
  id: string;
  classroomId?: string;
  joinedAt?: string;
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
  lastActivityAt?: string | null;
  classroomTitle: string;
  classTitle: string;
  classSlug?: string;
};

type ClassEnrollmentRowProps = {
  enrollment: DashboardEnrollment;
};

export function ClassEnrollmentRow({ enrollment }: ClassEnrollmentRowProps) {
  const completionPercent = Math.round((enrollment.completionRate || 0) * 100);
  const lastActivity = enrollment.lastActivityAt
    ? new Date(enrollment.lastActivityAt).toLocaleDateString()
    : "No activity yet";

  return (
    <article className="rounded-md border border-border/60 bg-background px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {enrollment.classroomTitle}
          </h3>
          <p className="text-xs text-muted-foreground">
            {enrollment.classTitle}
          </p>
        </div>
        <div className="text-xs text-muted-foreground">{completionPercent}%</div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, Math.max(0, completionPercent))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {enrollment.completedLessons}/{enrollment.totalLessons} lessons completed •{" "}
        {lastActivity}
      </p>
      {enrollment.classSlug ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link
            href={`/classes/${enrollment.classSlug}`}
            className="inline-block text-xs font-semibold text-primary underline underline-offset-4"
          >
            Open class
          </Link>
          {enrollment.completionRate >= 1 && enrollment.classroomId ? (
            <Link
              href={`/classrooms/${enrollment.classroomId}/certificate`}
              className="inline-block text-xs font-semibold text-primary underline underline-offset-4"
            >
              Certificate
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
