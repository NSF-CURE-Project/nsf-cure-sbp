"use client";

import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/use-confirm";

type ClassroomItem = {
  id: string;
  classroomId: string;
  classroomTitle: string;
  classTitle: string;
  classSlug?: string;
  completionRate: number;
  completedLessons: number;
  totalLessons: number;
  lastActivityAt?: string | null;
};

type ClassroomsShellProps = {
  classrooms: ClassroomItem[];
};

const formatDate = (value?: string | null) => {
  if (!value) return "No recent activity";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export function ClassroomsShell({ classrooms }: ClassroomsShellProps) {
  const [items, setItems] = useState(classrooms);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const leaveClassroom = async (classroomId: string) => {
    const target = items.find((item) => item.classroomId === classroomId);
    const confirmed = await confirm({
      title: target ? `Leave "${target.classroomTitle}"?` : "Leave this classroom?",
      message:
        "Your enrollment progress will no longer appear on your dashboard. You can rejoin later with the active join code.",
      confirmLabel: "Leave classroom",
      destructive: true,
    });
    if (!confirmed) return;

    setLeavingId(classroomId);
    setError(null);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/leave`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Unable to leave classroom.");
      }

      setItems((prev) => prev.filter((item) => item.classroomId !== classroomId));
    } catch (leaveError) {
      setError(
        leaveError instanceof Error ? leaveError.message : "Unable to leave classroom."
      );
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,96ch)] px-4 py-6 sm:px-6 lg:px-8">
      {confirmDialog}
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Enrollment
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">My Classrooms</h1>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {items.length === 0 ? (
          <section className="rounded-xl border border-border/60 bg-card/40 p-5 text-sm text-muted-foreground">
            You are not currently enrolled in any classroom.
          </section>
        ) : (
          <section className="grid gap-4">
            {items.map((item) => {
              const pct = Math.max(0, Math.min(100, Math.round(item.completionRate * 100)));
              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-border/60 bg-card/50 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {item.classroomTitle}
                      </h2>
                      <p className="text-sm text-muted-foreground">{item.classTitle}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                        item.completionRate >= 1
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-blue-500/10 text-blue-300"
                      )}
                    >
                      {item.completionRate >= 1 ? "Completed" : "In progress"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.completedLessons}/{item.totalLessons} lessons complete
                      </span>
                      <span className="font-semibold text-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/40">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Last activity: {formatDate(item.lastActivityAt)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    {item.classSlug ? (
                      <Link
                        href={`/classes/${item.classSlug}`}
                        className="font-semibold text-primary underline underline-offset-4"
                      >
                        Open class
                      </Link>
                    ) : null}
                    {item.completionRate >= 1 ? (
                      <Link
                        href={`/classrooms/${item.classroomId}/certificate`}
                        className="font-semibold text-primary underline underline-offset-4"
                      >
                        Download certificate
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void leaveClassroom(item.classroomId)}
                      disabled={leavingId === item.classroomId}
                      className="font-semibold text-red-500 underline underline-offset-4 disabled:opacity-50"
                    >
                      {leavingId === item.classroomId ? "Leaving..." : "Leave classroom"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
