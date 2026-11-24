"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAYLOAD_URL = getPayloadBaseUrl();

type LessonRef = {
  id: string;
  href: string;
  title: string;
};

type Props = {
  classId: string | number;
  classTitle: string;
  totalLessons: number;
  lessons: LessonRef[];
  firstLessonHref: string | null;
};

type AccountUser = {
  id: string;
};

type ProgressDoc = {
  id: string;
  completed?: boolean;
  updatedAt?: string;
  lesson?: string | { id?: string | number } | null;
};

const lessonIdFromDoc = (doc: ProgressDoc) => {
  const lesson = doc.lesson;
  if (typeof lesson === "string") return lesson;
  if (lesson && typeof lesson === "object" && lesson.id != null) {
    return String(lesson.id);
  }
  return null;
};

export function ClassProgressSummary({
  classId,
  classTitle,
  totalLessons,
  lessons,
  firstLessonHref,
}: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [progressDocs, setProgressDocs] = useState<ProgressDoc[]>([]);

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
        if (!controller.signal.aborted) setUser(null);
      } finally {
        if (!controller.signal.aborted) setAuthChecked(true);
      }
    };
    void loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!user?.id || !classId) {
      setProgressDocs([]);
      return;
    }
    const controller = new AbortController();
    const loadProgress = async () => {
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/lesson-progress?limit=500&where[class][equals]=${classId}&sort=-updatedAt`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setProgressDocs([]);
          return;
        }
        const data = (await res.json()) as { docs?: ProgressDoc[] };
        setProgressDocs(data.docs ?? []);
      } catch {
        if (!controller.signal.aborted) setProgressDocs([]);
      }
    };
    void loadProgress();
    return () => controller.abort();
  }, [user?.id, classId]);

  const completedIds = useMemo(() => {
    const ids = new Set<string>();
    progressDocs.forEach((doc) => {
      if (!doc.completed) return;
      const id = lessonIdFromDoc(doc);
      if (id) ids.add(id);
    });
    return ids;
  }, [progressDocs]);

  const completedCount = useMemo(() => {
    return lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  }, [completedIds, lessons]);

  const percent = useMemo(() => {
    if (!totalLessons) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  }, [completedCount, totalLessons]);

  const continueLesson = useMemo(() => {
    const inProgress = progressDocs.find((doc) => {
      if (doc.completed) return false;
      const id = lessonIdFromDoc(doc);
      return id ? lessons.some((lesson) => lesson.id === id) : false;
    });
    if (inProgress) {
      const id = lessonIdFromDoc(inProgress);
      const match = lessons.find((lesson) => lesson.id === id);
      if (match) return match;
    }
    const next = lessons.find((lesson) => !completedIds.has(lesson.id));
    return next ?? lessons[0] ?? null;
  }, [completedIds, lessons, progressDocs]);

  if (totalLessons === 0 || !authChecked) return null;

  if (!user) {
    return (
      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/15 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            Save your learning progress
          </p>
          <p className="text-[13px] text-muted-foreground">
            Sign in to track completed lessons across devices.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link href="/login">
            <LogIn className="h-3.5 w-3.5" />
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  const isComplete = percent >= 100;
  const continueHref = continueLesson?.href ?? firstLessonHref;
  const hasStarted = progressDocs.length > 0;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/15 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-sm font-medium text-foreground">
            {isComplete
              ? `${classTitle} complete`
              : hasStarted
                ? `${percent}% complete`
                : "Ready to begin"}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {completedCount} of {totalLessons}{" "}
            {totalLessons === 1 ? "lesson" : "lessons"}
          </p>
        </div>
        {hasStarted ? (
          <div className="h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                isComplete ? "bg-primary" : "bg-primary/80"
              )}
              style={{ width: `${Math.max(percent, percent > 0 ? 4 : 0)}%` }}
            />
          </div>
        ) : null}
      </div>
      {continueHref ? (
        <Button asChild size="sm" className="shrink-0">
          <Link href={continueHref}>
            {isComplete
              ? "Review course"
              : hasStarted
                ? "Continue learning"
                : "Start course"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
