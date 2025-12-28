"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

type Props = {
  lessonId: string;
};

const ratings = [
  { value: 1, label: "Not helpful", emoji: "😕" },
  { value: 2, label: "Somewhat helpful", emoji: "😐" },
  { value: 3, label: "Helpful", emoji: "🙂" },
  { value: 4, label: "Very helpful", emoji: "😍" },
];

export function LessonHelpfulFeedback({ lessonId }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadUser = async () => {
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        setIsSignedIn(res.ok);
      } catch {
        if (!controller.signal.aborted) {
          setIsSignedIn(false);
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  const canSubmit = useMemo(
    () => !!lessonId && rating !== null && !sending,
    [lessonId, rating, sending],
  );

  const handleSelect = (value: number) => {
    setRating(value);
    setOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${PAYLOAD_URL}/api/lesson-feedback`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson: lessonId,
          rating,
          message: message.trim() || undefined,
          pageUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not save your feedback. Please try again.");
      }

      setMessage("");
      setSuccess("Thanks! Your feedback helps us improve this lesson.");
      setOpen(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-10 flex justify-center">
      <div className="relative">
        <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background px-5 py-3 text-sm text-muted-foreground shadow-sm">
          <span className="font-medium text-foreground">
            Was this lesson helpful?
          </span>
          <div className="flex items-center gap-2">
            {ratings.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`h-8 w-8 rounded-full border border-border/60 bg-background text-base ${
                  rating === item.value ? "ring-2 ring-primary/40" : ""
                }`}
                aria-label={item.label}
                onClick={() => handleSelect(item.value)}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>

        {open ? (
          <div className="absolute left-1/2 bottom-full z-20 mb-3 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-border/60 bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">
                Share a quick note
              </div>
              <button
                type="button"
                className="text-xs text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <Textarea
              rows={5}
              placeholder="Your feedback..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-3 rounded-xl border-border/70 bg-background shadow-sm"
              disabled={sending}
            />
            <div className="mt-2 flex justify-end text-xs text-muted-foreground">
              Plain text only.
            </div>
            {error ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {isSignedIn
                  ? "Thanks for helping us improve."
                  : "You can submit feedback without signing in."}
              </span>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="rounded-lg px-5"
              >
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
