"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

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
  id: string | number;
  completed?: boolean;
  completedAt?: string | null;
};

type BookmarkDoc = {
  id: string | number;
  updatedAt?: string;
};

const extractCreatedDoc = <T extends { id: string | number }>(value: unknown): T | null => {
  if (!value || typeof value !== "object") return null;
  if ("doc" in value && typeof value.doc === "object" && value.doc) {
    const wrapped = value.doc as { id?: string | number };
    return wrapped.id != null ? (wrapped as T) : null;
  }
  if (
    "id" in value &&
    (typeof value.id === "string" || typeof value.id === "number")
  ) {
    return value as T;
  }
  return null;
};

export function LessonProgressControls({ lessonId, lessonTitle }: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [progress, setProgress] = useState<ProgressDoc | null>(null);
  const [bookmark, setBookmark] = useState<BookmarkDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookmarkSaving, setBookmarkSaving] = useState(false);
  const autoCompleteTriggered = useRef(false);

  const isCompleted = !!progress?.completed;
  const isBookmarked = !!bookmark?.id;

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
      } catch {
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

  const loadBookmark = useCallback(
    async (signal?: AbortSignal) => {
      if (!user?.id || !lessonId) return;
      setBookmarkLoading(true);
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/lesson-bookmarks?limit=1&where[lesson][equals]=${lessonId}`,
          {
            credentials: "include",
            signal,
          }
        );
        if (!res.ok) {
          setBookmark(null);
          return;
        }
        const data = (await res.json()) as { docs?: BookmarkDoc[] };
        setBookmark(data.docs?.[0] ?? null);
      } catch {
        if (!signal?.aborted) {
          setBookmark(null);
        }
      } finally {
        if (!signal?.aborted) {
          setBookmarkLoading(false);
        }
      }
    },
    [lessonId, user?.id]
  );

  useEffect(() => {
    if (!user?.id || !lessonId) return;
    const controller = new AbortController();
    loadBookmark(controller.signal);
    return () => controller.abort();
  }, [user?.id, lessonId, loadBookmark]);

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
        const data = (await res.json()) as unknown;
        const created = extractCreatedDoc<ProgressDoc>(data);
        setProgress(created);
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

  const toggleBookmark = useCallback(async () => {
    if (!user?.id || !lessonId || bookmarkSaving) return;
    setBookmarkSaving(true);
    try {
      if (bookmark?.id) {
        const res = await fetch(`${PAYLOAD_URL}/api/lesson-bookmarks/${bookmark.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          await loadBookmark();
          return;
        }
        setBookmark(null);
        return;
      }

      const res = await fetch(`${PAYLOAD_URL}/api/lesson-bookmarks`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson: lessonId }),
      });
      if (!res.ok) {
        await loadBookmark();
        return;
      }

      const data = (await res.json()) as unknown;
      const created = extractCreatedDoc<BookmarkDoc>(data);
      if (created) {
        setBookmark(created);
      } else {
        await loadBookmark();
      }
    } finally {
      setBookmarkSaving(false);
    }
  }, [bookmark?.id, bookmarkSaving, lessonId, loadBookmark, user?.id]);

  const statusLabel = useMemo(() => {
    if (isCompleted) return "Completed";
    if (saving) return "Saving...";
    return "Mark complete";
  }, [isCompleted, saving]);

  const bookmarkLabel = useMemo(() => {
    if (bookmarkSaving) return "Saving...";
    if (isBookmarked) return "Saved lesson";
    return "Save lesson";
  }, [bookmarkSaving, isBookmarked]);

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={markComplete}
            disabled={loading || saving || isCompleted}
            className="rounded-full"
          >
            {statusLabel}
          </Button>
          <Button
            type="button"
            variant={isBookmarked ? "secondary" : "outline"}
            onClick={toggleBookmark}
            disabled={bookmarkLoading || bookmarkSaving}
            className="rounded-full"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <BookmarkPlus className="h-4 w-4" />
            )}
            {bookmarkLabel}
          </Button>
        </div>
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
