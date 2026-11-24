"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, CirclePlay, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import {
  readLocalPracticeProgress,
  type PracticeProgressStatus,
} from "@/lib/practice/localProgress";
import { practicePath } from "@/lib/practice/slugs";
import { cn } from "@/lib/utils";

const PAYLOAD_URL = getPayloadBaseUrl();

type PracticeProblem = {
  id: string;
  title: string;
  chapter: string;
  subject: string;
};

type ProblemProgress = {
  status: Exclude<PracticeProgressStatus, "not-started">;
  seed?: string | null;
  updatedAt?: string | null;
};

type PracticeLibraryProps = {
  problems: PracticeProblem[];
};

const displayTitle = (title: string) =>
  title.replace(/^Practice Problem\s+\d+\s*:\s*/i, "").trim() || title;

const chapterLabel = (chapter: string) => chapter.replace(/_\s*/g, " · ");

const subjectLabel = (subject: string) =>
  subject === "Static_problems" ? "Statics" : "Mechanics of Materials";

export function PracticeLibrary({ problems }: PracticeLibraryProps) {
  const [signedIn, setSignedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [progress, setProgress] = useState<Record<string, ProblemProgress>>({});

  useEffect(() => {
    const local = readLocalPracticeProgress();
    const mapped: Record<string, ProblemProgress> = {};
    Object.entries(local).forEach(([id, value]) => {
      mapped[id] = {
        status: value.status,
        seed: value.seed,
        updatedAt: value.updatedAt,
      };
    });
    setProgress(mapped);

    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(
          `${PAYLOAD_URL}/api/practice-attempts/library-status`,
          {
            credentials: "include",
            signal: controller.signal,
            cache: "no-store",
          }
        );
        if (!response.ok) {
          setSignedIn(false);
          return;
        }
        const data = (await response.json()) as {
          signedIn?: boolean;
          problems?: Record<string, ProblemProgress>;
        };
        setSignedIn(Boolean(data.signedIn));
        if (data.signedIn && data.problems) {
          setProgress((prev) => {
            const next = { ...prev };
            Object.entries(data.problems ?? {}).forEach(([id, value]) => {
              const localEntry = prev[id];
              if (value.status === "completed") {
                next[id] = value;
                return;
              }
              if (localEntry?.status === "completed") {
                next[id] = localEntry;
                return;
              }
              next[id] = value;
            });
            return next;
          });
        }
      } catch {
        if (!controller.signal.aborted) setSignedIn(false);
      } finally {
        if (!controller.signal.aborted) setAuthChecked(true);
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const subjects = useMemo(() => {
    return ["Static_problems", "Mechanics_of_materials_problems"]
      .map((subject) => {
        const items = problems.filter((problem) => problem.subject === subject);
        const chapters = [...new Set(items.map((problem) => problem.chapter))].sort(
          (a, b) => a.localeCompare(b, undefined, { numeric: true })
        );
        return { subject, items, chapters };
      })
      .filter((group) => group.items.length > 0);
  }, [problems]);

  return (
    <div className="space-y-8">
      {authChecked ? (
        signedIn ? (
          <p className="text-sm text-muted-foreground">
            Progress is saved to your account. Completed means you met the
            grading requirements for a variation of the problem.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5 rounded-lg border border-border/50 bg-muted/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                Save practice progress
              </p>
              <p className="text-[13px] text-muted-foreground">
                You can practice now. Sign in to keep completion synced across
                devices.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link href="/login?next=/practice">
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            </Button>
          </div>
        )
      ) : null}

      {subjects.map(({ subject, items, chapters }) => (
        <section key={subject} className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            {subjectLabel(subject)}
          </h2>
          {chapters.map((chapter) => {
            const chapterProblems = items.filter(
              (problem) => problem.chapter === chapter
            );
            const completedCount = chapterProblems.filter(
              (problem) => progress[problem.id]?.status === "completed"
            ).length;
            const inProgressCount = chapterProblems.filter(
              (problem) => progress[problem.id]?.status === "in-progress"
            ).length;
            const started = completedCount + inProgressCount > 0;
            const percent = chapterProblems.length
              ? Math.round((completedCount / chapterProblems.length) * 100)
              : 0;

            return (
              <details
                key={chapter}
                className="group rounded-lg border border-border/60 bg-background open:bg-muted/[0.03]"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {chapterLabel(chapter)}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {started
                        ? `${completedCount} of ${chapterProblems.length} problems completed`
                        : `${chapterProblems.length} ${
                            chapterProblems.length === 1 ? "problem" : "problems"
                          }`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {started ? (
                      <>
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {percent}%
                        </p>
                        <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                            style={{ width: `${Math.max(percent, 4)}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-[12px] font-medium text-muted-foreground">
                        Not started
                      </p>
                    )}
                  </div>
                </summary>

                <ul className="divide-y divide-border/40 border-t border-border/50">
                  {chapterProblems.map((problem) => {
                    const entry = progress[problem.id];
                    const status: PracticeProgressStatus =
                      entry?.status ?? "not-started";
                    const href = practicePath(
                      problem.id,
                      entry?.seed ? { variant: entry.seed } : undefined
                    );
                    return (
                      <li key={problem.id}>
                        <Link
                          href={href}
                          prefetch={false}
                          className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                        >
                          <span className="min-w-0 text-[15px] font-medium leading-snug text-foreground">
                            {displayTitle(problem.title)}
                          </span>
                          <StatusBadge status={status} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: PracticeProgressStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-primary">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        Completed
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-blue-600 dark:text-blue-400">
        <CirclePlay className="h-3.5 w-3.5" aria-hidden />
        In progress
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-muted-foreground"
      )}
    >
      <CircleDashed className="h-3.5 w-3.5" aria-hidden />
      Not started
    </span>
  );
}
