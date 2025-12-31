"use client";

import Link from "next/link";
import { Copy, Settings } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

type AccountUser = {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  emailVerified?: boolean;
};

type ClassroomMembership = {
  id: string;
  joinedAt?: string;
  totalLessons?: number;
  completedLessons?: number;
  completionRate?: number;
  lastActivityAt?: string | null;
  classroom?: {
    id?: string;
    title?: string;
    class?: { slug?: string; title?: string };
  };
};

export default function ProfilePage() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [classrooms, setClassrooms] = useState<ClassroomMembership[]>([]);
  const [classroomsStatus, setClassroomsStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [signingOut, setSigningOut] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCooldown, setConfirmCooldown] = useState(0);
  const [logoutAllStatus, setLogoutAllStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [logoutAllMessage, setLogoutAllMessage] = useState("");

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
          setStatus("ready");
          return;
        }
        const data = (await res.json()) as { user?: AccountUser };
        setUser(data?.user ?? null);
        setStatus("ready");
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    const loadClassrooms = async () => {
      setClassroomsStatus("loading");
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/classroom-memberships?where[student][equals]=${user.id}&depth=2`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setClassrooms([]);
          setClassroomsStatus("error");
          return;
        }
        const data = (await res.json()) as { docs?: ClassroomMembership[] };
        setClassrooms(data.docs ?? []);
        setClassroomsStatus("ready");
      } catch (error) {
        if (!controller.signal.aborted) {
          setClassrooms([]);
          setClassroomsStatus("error");
        }
      }
    };
    loadClassrooms();
    return () => controller.abort();
  }, [user?.id]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch(`${PAYLOAD_URL}/api/accounts/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setSigningOut(false);
      window.location.href = "/login";
    }
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    } catch (error) {
      setCopiedEmail(false);
    }
  };

  const handleSendConfirmation = async () => {
    setConfirmStatus("sending");
    setConfirmMessage("");
    try {
      const res = await fetch(
        `${PAYLOAD_URL}/api/accounts/request-email-confirmation`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Unable to send confirmation link.");
      }
      const data = (await res.json()) as { message?: string };
      setConfirmStatus("sent");
      setConfirmMessage(data?.message ?? "Confirmation link sent.");
      setConfirmCooldown(60);
    } catch (error) {
      setConfirmStatus("error");
      setConfirmMessage(
        error instanceof Error
          ? error.message
          : "Unable to send confirmation link."
      );
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllStatus("loading");
    setLogoutAllMessage("");
    try {
      const res = await fetch(`${PAYLOAD_URL}/api/accounts/logout-all`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Unable to log out of all sessions.");
      }
      window.location.href = "/login";
    } catch (error) {
      setLogoutAllStatus("error");
      setLogoutAllMessage(
        error instanceof Error
          ? error.message
          : "Unable to log out of all sessions."
      );
    } finally {
      setLogoutAllStatus("idle");
    }
  };

  useEffect(() => {
    if (confirmCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setConfirmCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [confirmCooldown]);

  const progressSummary = classrooms.reduce(
    (summary, membership) => {
      const total = membership.totalLessons ?? 0;
      const completed = membership.completedLessons ?? 0;
      const lastActivity = membership.lastActivityAt
        ? new Date(membership.lastActivityAt).getTime()
        : null;

      return {
        totalLessons: summary.totalLessons + total,
        completedLessons: summary.completedLessons + completed,
        lastActivityAt:
          lastActivity && lastActivity > summary.lastActivityAt
            ? lastActivity
            : summary.lastActivityAt,
      };
    },
    { totalLessons: 0, completedLessons: 0, lastActivityAt: 0 }
  );

  const overallCompletion =
    progressSummary.totalLessons > 0
      ? Math.round(
          (progressSummary.completedLessons / progressSummary.totalLessons) *
            100
        )
      : 0;

  const lastActivityLabel =
    progressSummary.lastActivityAt > 0
      ? new Date(progressSummary.lastActivityAt).toLocaleString()
      : "No activity yet";

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
      <div className="rounded-md bg-card/80 p-10 shadow-lg">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Profile
          </p>
          <h1 className="text-3xl font-bold text-foreground">Your account</h1>
          <p className="text-base text-muted-foreground">
            Manage your student profile details and sign out of the program
            site.
          </p>
        </div>

        <div className="mt-10 space-y-6 text-[15px] leading-relaxed">
          {status === "loading" ? (
            <div className="rounded-md border border-border/60 bg-muted/30 px-5 py-4 text-base text-muted-foreground">
              Loading your profile...
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700">
              We could not load your profile. Please refresh the page.
            </div>
          ) : null}

          {status === "ready" && !user ? (
            <div className="rounded-md border border-border/60 bg-muted/30 px-5 py-4 text-base text-muted-foreground">
              You are not signed in.{" "}
              <Link
                href="/login"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          ) : null}

          {status === "ready" && user ? (
            <div className="grid gap-4 rounded-md border border-border/60 bg-background/80 p-6 text-[15px]">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Full name
                </span>
                <span className="text-base font-medium text-foreground">
                  {user.fullName ?? "Student"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-medium text-foreground">
                    {user.email}
                  </span>
                  {user.role ? (
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      • <span className="capitalize">{user.role}</span>
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      user.emailVerified
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(user.email)}
                    className="inline-flex items-center rounded-md p-1 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
                    aria-label="Copy email"
                    title="Copy email"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  {copiedEmail ? (
                    <span className="text-xs text-emerald-500">Copied</span>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  Contact support to change your email.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Institution
                </span>
                <span className="text-base font-medium text-foreground">
                  Cal Poly Pomona
                </span>
              </div>
            </div>
          ) : null}

          {status === "ready" && user ? (
            <div className="rounded-md border border-border/60 bg-background/80 p-6 text-[15px] space-y-3">
              <div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email confirmation
                </span>
                <p className="text-[15px] text-muted-foreground">
                  {user.emailVerified
                    ? "Your email address is verified."
                    : "Send a confirmation link to verify this email address."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={handleSendConfirmation}
                  disabled={
                    confirmStatus === "sending" ||
                    confirmCooldown > 0 ||
                    user.emailVerified
                  }
                  variant="outline"
                  className="px-5"
                >
                  {confirmStatus === "sending"
                    ? "Sending..."
                    : confirmCooldown > 0
                      ? `Resend in ${confirmCooldown}s`
                      : "Send confirmation link"}
                </Button>
                {confirmMessage ? (
                  <span
                    className={`text-sm ${
                      confirmStatus === "error"
                        ? "text-red-300"
                        : "text-emerald-400"
                    }`}
                  >
                    {confirmMessage}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {status === "ready" && user ? (
            <div className="rounded-md border border-border/60 bg-background/80 p-6 text-[15px] space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Joined classrooms
                  </span>
                  <p className="text-[15px] text-muted-foreground">
                    Your enrollments and credit-tracked classrooms.
                  </p>
                </div>
                <Link
                  href="/join-classroom"
                  className="inline-flex items-center rounded-md border border-border/70 bg-background/60 px-3 py-1.5 text-[13px] font-semibold text-foreground/80 transition hover:border-border hover:bg-muted/30 hover:text-foreground"
                >
                  Join a classroom
                </Link>
              </div>

              {classroomsStatus === "loading" ? (
                <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                  Loading classrooms...
                </div>
              ) : null}

              {classroomsStatus === "error" ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  We could not load your classrooms.
                </div>
              ) : null}

              {classroomsStatus === "ready" && classrooms.length === 0 ? (
                <div className="rounded-md bg-muted/20 px-4 py-3 text-[15px] text-muted-foreground italic">
                  You haven't joined a classroom yet. Enter a join code to
                  enroll.
                </div>
              ) : null}

              {classroomsStatus === "ready" && classrooms.length > 0 ? (
                <div className="grid gap-3">
                  {classrooms.map((membership) => {
                    const classroomTitle =
                      membership.classroom?.title ?? "Classroom";
                    const classTitle = membership.classroom?.class?.title;
                    const classSlug = membership.classroom?.class?.slug;
                    const joinedAt = membership.joinedAt
                      ? new Date(membership.joinedAt).toLocaleDateString()
                      : null;
                    const totalLessons = membership.totalLessons ?? 0;
                    const completedLessons = membership.completedLessons ?? 0;
                    const completionRate = membership.completionRate ?? 0;
                    const statusLabel =
                      totalLessons > 0 && completionRate >= 1
                        ? "Completed"
                        : "Active";
                    const lastActivity = membership.lastActivityAt
                      ? new Date(membership.lastActivityAt).toLocaleDateString()
                      : "No activity yet";

                    return (
                      <div
                        key={membership.id}
                        className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-background px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[15px] font-semibold text-foreground">
                            {classroomTitle}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {statusLabel}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {classTitle ? `Class: ${classTitle}` : "Course"}
                          {joinedAt ? ` • Joined ${joinedAt}` : ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {totalLessons > 0
                            ? `${completedLessons}/${totalLessons} lessons completed`
                            : "No lessons started"}
                          {" • "}
                          {lastActivity}
                        </div>
                        {classSlug ? (
                          <Link
                            href={`/classes/${classSlug}`}
                            className="text-xs font-semibold text-primary underline underline-offset-4"
                          >
                            Go to class
                          </Link>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {status === "ready" && user ? (
            <div className="rounded-md border border-border/60 bg-background/80 p-6 text-[15px] space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Progress summary
                </span>
                <p className="text-[15px] text-muted-foreground">
                  A snapshot of your recent learning activity.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-md border border-border/60 bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Lessons completed
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">
                    {progressSummary.completedLessons}
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Overall completion
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">
                    {overallCompletion}%
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Last activity
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {lastActivityLabel}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {user ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              variant="outline"
              className="border-red-200/40 text-red-200 hover:bg-red-500/10 hover:text-red-100"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
            <Button asChild variant="outline" className="px-5">
              <Link href="/settings" className="inline-flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Account settings
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/forgot-password">Reset password</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogoutAll}
              disabled={logoutAllStatus === "loading"}
            >
              {logoutAllStatus === "loading"
                ? "Logging out..."
                : "Log out of all sessions"}
            </Button>
            {logoutAllMessage ? (
              <span className="text-sm text-red-300">{logoutAllMessage}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
