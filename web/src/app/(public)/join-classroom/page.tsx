"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

type Classroom = {
  id: string;
  title?: string;
  class?: { slug?: string; title?: string };
};

export default function JoinClassroomPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const classLink = useMemo(() => {
    const slug = classroom?.class?.slug;
    return slug ? `/classes/${slug}` : null;
  }, [classroom?.class?.slug]);

  useEffect(() => {
    const controller = new AbortController();
    const loadUser = async () => {
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        setIsLoggedIn(res.ok);
      } catch (error) {
        if (!controller.signal.aborted) {
          setIsLoggedIn(false);
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setClassroom(null);

    try {
      const res = await fetch(`${PAYLOAD_URL}/api/classrooms/join`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Unable to join classroom.");
      }

      const data = (await res.json()) as { classroom?: Classroom };
      setClassroom(data.classroom ?? null);
      setStatus("success");
      setMessage("You have joined the classroom.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to join classroom."
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Classroom Access
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">
          Join a Classroom
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter the code provided by your professor to enroll and track your
          progress for credit.
        </p>
      </div>

      {isLoggedIn === false ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-sm">
          <p className="text-foreground">
            Please sign in to your student account before joining a classroom.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border/60 bg-background p-6 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-foreground">
              Classroom code
            </label>
            <input
              type="text"
              name="code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-md border border-border/70 bg-background px-4 py-3 text-sm tracking-[0.3em] font-semibold uppercase shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="ABC123"
              required
            />
          </div>

          {message ? (
            <div
              className={`rounded-md px-4 py-3 text-sm ${
                status === "error"
                  ? "border border-red-200 bg-red-50 text-red-700"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </div>
          ) : null}

          {status === "success" && classroom ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="font-semibold">
                {classroom.title ?? "Classroom joined"}.
              </div>
              {classroom.class?.title ? (
                <div className="text-emerald-700/80">
                  Class: {classroom.class.title}
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Joining..." : "Join Classroom"}
          </button>

          {classLink ? (
            <Link
              href={classLink}
              className="block text-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Go to class page
            </Link>
          ) : null}
        </form>
      )}
    </div>
  );
}
