"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";

const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

type Props = {
  lessonId: string;
  lessonTitle: string;
};

type AccountUser = {
  id: string;
  email: string;
  fullName?: string;
};

type ProgressDoc = {
  id: string;
  completed?: boolean;
  completedAt?: string | null;
};

export function LessonProgressControls({ lessonId, lessonTitle }: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [progress, setProgress] = useState<ProgressDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const autoCompleteTriggered = useRef(false);

  const isCompleted = !!progress?.completed;

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
      } catch (error) {
        if (!controller.signal.aborted) {
          setUser(null);
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!user?.id || !lessonId) return;
    const controller = new AbortController();
    const loadProgress = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/lesson-progress?limit=1&where[lesson][equals]=${lessonId}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setProgress(null);
          return;
        }
        const data = (await res.json()) as { docs?: ProgressDoc[] };
        setProgress(data.docs?.[0] ?? null);
      } catch (error) {
        if (!controller.signal.aborted) {
          setProgress(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    loadProgress();
    return () => controller.abort();
  }, [user?.id, lessonId]);

  const markComplete = useCallback(async () => {
    if (!user?.id || saving || isCompleted) return;
    setSaving(true);
    try {
      if (progress?.id) {
        const res = await fetch(
          `${PAYLOAD_URL}/api/lesson-progress/${progress.id}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: true }),
          }
        );
        if (!res.ok) {
          throw new Error("Could not update progress.");
        }
        const updated = (await res.json()) as ProgressDoc;
        setProgress(updated);
      } else {
        const res = await fetch(`${PAYLOAD_URL}/api/lesson-progress`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson: lessonId,
            completed: true,
          }),
        });
        if (!res.ok) {
          throw new Error("Could not create progress.");
        }
        const created = (await res.json()) as { doc?: ProgressDoc };
        setProgress(created.doc ?? null);
      }
    } finally {
      setSaving(false);
    }
  }, [user?.id, saving, isCompleted, progress?.id, lessonId]);

  const handleVideoComplete = useCallback(() => {
    if (autoCompleteTriggered.current || isCompleted) return;
    autoCompleteTriggered.current = true;
    markComplete();
  }, [markComplete, isCompleted]);

  const statusLabel = useMemo(() => {
    if (isCompleted) return "Completed";
    if (saving) return "Saving...";
    return "Mark complete";
  }, [isCompleted, saving]);

  if (!user) return null;

  return (
    <section className="mt-6 rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Lesson progress
          </p>
          <p className="text-sm text-foreground">
            {isCompleted
              ? `You completed “${lessonTitle}.”`
              : `Complete “${lessonTitle}” when you’re ready.`}
          </p>
        </div>
        <Button
          type="button"
          onClick={markComplete}
          disabled={loading || saving || isCompleted}
          className="rounded-full"
        >
          {statusLabel}
        </Button>
      </div>
      <LessonProgressVideoBridge onComplete={handleVideoComplete} />
    </section>
  );
}

type LessonProgressVideoBridgeProps = {
  onComplete: () => void;
};

export function LessonProgressVideoBridge({
  onComplete,
}: LessonProgressVideoBridgeProps) {
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string }>).detail;
      if (detail?.type === "video-ended") {
        onComplete();
      }
    };
    window.addEventListener("lesson-progress", handler as EventListener);
    return () =>
      window.removeEventListener("lesson-progress", handler as EventListener);
  }, [onComplete]);

  return null;
}
