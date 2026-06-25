"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CirclePlay, CircleDashed, LogIn } from "lucide-react";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PAYLOAD_URL = getPayloadBaseUrl();

type Props = {
  classId: string | number;
  classTitle: string;
  totalLessons: number;
};

type AccountUser = {
  id: string;
};

type ProgressDoc = {
  id: string;
  completed?: boolean;
};

export function ClassProgressSummary({
  classId,
  classTitle,
  totalLessons,
}: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadUser = async () => {
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = (await res.json()) as { user?: AccountUser };
        setUser(data?.user ?? null);
      } catch {
        if (!controller.signal.aborted) {
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAuthChecked(true);
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!user?.id || !classId) return;
    const controller = new AbortController();
    const loadProgress = async () => {
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/lesson-progress?limit=200&where[class][equals]=${classId}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setCompletedCount(0);
          setInProgressCount(0);
          return;
        }
        const data = (await res.json()) as { docs?: ProgressDoc[] };
        const docs = data.docs ?? [];
        setCompletedCount(docs.filter((doc) => doc.completed).length);
        setInProgressCount(docs.filter((doc) => !doc.completed).length);
      } catch {
        if (!controller.signal.aborted) {
          setCompletedCount(0);
          setInProgressCount(0);
        }
      }
    };
    loadProgress();
    return () => controller.abort();
  }, [user?.id, classId]);

  const percent = useMemo(() => {
    if (!totalLessons) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  }, [completedCount, totalLessons]);

  if (totalLessons === 0 || !authChecked) return null;

  if (!user) {
    return (
      <div className="mt-5 border-y border-border/70 bg-muted/10 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Progress tracking
            </p>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Sign in to save lesson completion, resume where you left off, and
              keep this course progress synced across devices.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Sign in to save progress
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const remaining = Math.max(totalLessons - completedCount, 0);
  const isComplete = percent === 100;

  return (
    <div className="mt-5 border-y border-border/70 bg-muted/10 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your progress
          </p>
          <p className="text-sm text-muted-foreground">
            {isComplete ? (
              <>
                You&rsquo;ve completed{" "}
                <span className="font-semibold text-foreground">
                  {classTitle}
                </span>
                . Nice work.
              </>
            ) : (
              <>
                You&rsquo;re{" "}
                <span className="font-semibold text-foreground">
                  {percent}%
                </span>{" "}
                through{" "}
                <span className="font-semibold text-foreground">
                  {classTitle}
                </span>
                {remaining > 0 ? (
                  <>
                    , with {remaining}{" "}
                    {remaining === 1 ? "lesson" : "lessons"} to go.
                  </>
                ) : null}
              </>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tabular-nums leading-none text-foreground">
            {percent}%
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {completedCount} of {totalLessons} lessons complete
          </p>
        </div>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            isComplete
              ? "bg-primary"
              : "bg-gradient-to-r from-primary/70 to-primary"
          )}
          style={{
            width: `${Math.max(percent, percent > 0 ? 4 : 0)}%`,
          }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-border/60 border-y border-border/60 text-xs">
        <ProgressStat
          icon={<CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
          label="Completed"
          value={completedCount}
          accent="primary"
        />
        <ProgressStat
          icon={
            <CirclePlay className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          }
          label="In progress"
          value={inProgressCount}
          accent="blue"
        />
        <ProgressStat
          icon={<CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Not started"
          value={Math.max(totalLessons - completedCount - inProgressCount, 0)}
          accent="muted"
        />
      </div>
    </div>
  );
}

type ProgressStatProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: "primary" | "blue" | "muted";
};

function ProgressStat({ icon, label, value, accent }: ProgressStatProps) {
  return (
    <div
      className={cn(
        "px-2.5 py-2",
        accent === "primary" && "bg-primary/[0.03]",
        accent === "blue" && "bg-blue-500/[0.03]",
        accent === "muted" && "bg-transparent"
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
