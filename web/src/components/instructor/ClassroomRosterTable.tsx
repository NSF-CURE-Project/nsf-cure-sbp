"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type StudentRow = {
  accountId: string;
  name: string;
  email: string | null;
  completedLessons: number;
  totalLessons: number;
  completionRate: number;
  lastActivityAt: string | null;
  joinedAt: string | null;
};

type ClassroomRosterTableProps = {
  students: StudentRow[];
};

export function ClassroomRosterTable({ students }: ClassroomRosterTableProps) {
  const [sortBy, setSortBy] = useState<"completion" | "activity">("completion");

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      if (sortBy === "completion") {
        return b.completionRate - a.completionRate;
      }
      return (
        new Date(b.lastActivityAt ?? 0).getTime() -
        new Date(a.lastActivityAt ?? 0).getTime()
      );
    });
  }, [sortBy, students]);

  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Roster</h2>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            className={cn(
              "rounded-md border px-3 py-1.5",
              sortBy === "completion"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground"
            )}
            onClick={() => setSortBy("completion")}
          >
            Sort by completion
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md border px-3 py-1.5",
              sortBy === "activity"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground"
            )}
            onClick={() => setSortBy("activity")}
          >
            Sort by last active
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2">Student</th>
              <th className="px-2 py-2">Progress</th>
              <th className="px-2 py-2">Completion</th>
              <th className="px-2 py-2">Last active</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student) => (
              <tr key={student.accountId} className="border-b border-border/40">
                <td className="px-2 py-3">
                  <div className="font-medium text-foreground">{student.name}</div>
                  <div className="text-xs text-muted-foreground">{student.email}</div>
                </td>
                <td className="px-2 py-3">
                  <div className="mb-1 text-xs text-muted-foreground">
                    {student.completedLessons}/{student.totalLessons}
                  </div>
                  <div className="h-2 w-36 rounded-full bg-muted/60">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.max(4, student.completionRate * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-2 py-3 text-foreground">
                  {Math.round(student.completionRate * 100)}%
                </td>
                <td className="px-2 py-3 text-muted-foreground">
                  {student.lastActivityAt
                    ? new Date(student.lastActivityAt).toLocaleDateString()
                    : "No activity"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
