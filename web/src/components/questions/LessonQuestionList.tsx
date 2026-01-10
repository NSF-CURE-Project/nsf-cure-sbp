"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PAYLOAD_URL = getPayloadBaseUrl();

type Props = {
  lessonId: string;
  refreshKey?: number;
};

type AccountUser = {
  id: string;
  email: string;
  fullName?: string;
};

type Question = {
  id: string;
  title: string;
  status: "open" | "answered" | "resolved";
  createdAt?: string;
};

export function LessonQuestionList({ lessonId, refreshKey = 0 }: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

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
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/questions?limit=10&sort=-createdAt&where[lesson][equals]=${lessonId}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          throw new Error("Could not load your questions.");
        }
        const data = (await res.json()) as { docs?: Question[] };
        setQuestions(data.docs ?? []);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your questions."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    loadQuestions();
    return () => controller.abort();
  }, [user?.id, lessonId, refreshKey]);

  const handleResolve = async (questionId: string) => {
    setResolvingId(questionId);
    try {
      const res = await fetch(`${PAYLOAD_URL}/api/questions/${questionId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (!res.ok) {
        throw new Error("Could not update this question.");
      }
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === questionId
            ? { ...question, status: "resolved" }
            : question
        )
      );
    } catch (resolveError) {
      setError(
        resolveError instanceof Error
          ? resolveError.message
          : "Could not update this question."
      );
    } finally {
      setResolvingId(null);
    }
  };

  const hasQuestions = questions.length > 0;

  const statusBadge = useMemo(
    () => (status: Question["status"]) => {
      if (status === "answered")
        return { label: "Answered", variant: "default" as const };
      if (status === "resolved")
        return { label: "Resolved", variant: "secondary" as const };
      return { label: "Open", variant: "outline" as const };
    },
    []
  );

  if (!user) {
    return null;
  }

  return (
    <section className="mt-6 space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-5">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Your questions
        </h3>
        <p className="text-sm text-muted-foreground">
          Track responses and resolve when a staff answer helps.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading questions...</p>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !hasQuestions ? (
        <p className="text-sm text-muted-foreground">
          No questions yet for this lesson.
        </p>
      ) : null}

      <div className="space-y-3">
        {questions.map((question) => {
          const badge = statusBadge(question.status);
          return (
            <div
              key={question.id}
              className="rounded-xl border border-border/60 bg-background/60 px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={badge.variant}>{badge.label}</Badge>
                <span className="text-sm font-semibold text-foreground">
                  {question.title}
                </span>
                {question.createdAt ? (
                  <span className="text-xs text-muted-foreground">
                    {formatShortDate(question.createdAt)}
                  </span>
                ) : null}
              </div>

              {question.status === "answered" ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleResolve(question.id)}
                    disabled={resolvingId === question.id}
                  >
                    {resolvingId === question.id
                      ? "Updating..."
                      : "This answered my question"}
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
