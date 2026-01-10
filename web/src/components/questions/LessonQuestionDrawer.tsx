"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PAYLOAD_URL = getPayloadBaseUrl();

type Props = {
  lessonId: string;
  lessonTitle: string;
  onSubmitted?: () => void;
};

type AccountUser = {
  id: string;
  email: string;
  fullName?: string;
};

export function LessonQuestionDrawer({
  lessonId,
  lessonTitle,
  onSubmitted,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && body.trim().length > 0 && !submitting;
  }, [title, body, submitting]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let attachmentId: string | null = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt", file.name || "Question attachment");
        const uploadRes = await fetch(`${PAYLOAD_URL}/api/media`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error("Upload failed. Please try again.");
        }
        const uploadData = (await uploadRes.json()) as {
          doc?: { id?: string };
        };
        attachmentId = uploadData?.doc?.id ?? null;
      }

      const res = await fetch(`${PAYLOAD_URL}/api/questions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson: lessonId,
          title: title.trim(),
          body: body.trim(),
          attachment: attachmentId ?? undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not submit your question. Please try again.");
      }

      setTitle("");
      setBody("");
      setFile(null);
      setSuccess("Question submitted. Staff will respond here soon.");
      setOpen(false);
      onSubmitted?.();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-border/60 bg-muted/20 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Questions about this lesson</h2>
          <p className="text-sm text-muted-foreground">
            Ask a question tied to “{lessonTitle}.”
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button type="button" className="rounded-full" disabled={!lessonId}>
              Ask a Question about this Lesson
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="h-dvh w-[min(95vw,540px)] overflow-y-auto px-6 sm:px-8"
          >
            <SheetHeader className="space-y-2 border-b border-border/60 pb-4">
              <SheetTitle className="text-xl">Ask a question</SheetTitle>
              <SheetDescription className="text-sm">
                Your question will be linked to “{lessonTitle}.”
              </SheetDescription>
              <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                Include any symbols, formulas, or steps you already tried for a
                faster response.
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              {!user ? (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Please{" "}
                  <Link href="/login" className="text-foreground underline">
                    sign in
                  </Link>{" "}
                  to submit a lesson question.
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Title
                </label>
                <Input
                  placeholder="Short summary of your question"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-11 rounded-lg border-border/70 bg-background/60 focus-visible:ring-2 focus-visible:ring-primary/40"
                  disabled={!user || submitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  What are you stuck on?
                </label>
                <Textarea
                  rows={7}
                  placeholder="Explain what you tried, where it got confusing, and any symbols/equations."
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="rounded-lg border-border/70 bg-background/60 focus-visible:ring-2 focus-visible:ring-primary/40"
                  disabled={!user || submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Use $...$ for inline math or $$...$$ for display
                  equations.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Optional image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setFile(nextFile);
                  }}
                  className="h-11 cursor-pointer rounded-lg border-border/70 bg-background/60 file:mr-4 file:h-9 file:rounded-md file:border-0 file:bg-muted/60 file:px-3 file:text-xs file:font-semibold file:text-foreground hover:file:bg-muted"
                  disabled={!user || submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Screenshots of your work help staff answer faster.
                </p>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                <span className="text-xs text-muted-foreground">
                  Staff usually respond within 24 hours.
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!user || !canSubmit}
                  >
                    {submitting ? "Submitting..." : "Submit Question"}
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {success ? (
        <p className="mt-4 text-sm text-emerald-700">{success}</p>
      ) : null}
    </section>
  );
}
