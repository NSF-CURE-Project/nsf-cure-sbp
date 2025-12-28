"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";

const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

type AccountUser = {
  email: string;
  fullName?: string;
  role?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [signingOut, setSigningOut] = useState(false);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-md border border-border/60 bg-card/80 p-10 shadow-lg">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Profile
          </p>
          <h1 className="text-3xl font-bold text-foreground">Your account</h1>
          <p className="text-muted-foreground">
            Manage your student profile details and sign out of the program
            site.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {status === "loading" ? (
            <div className="rounded-md border border-border/60 bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
              Loading your profile...
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              We could not load your profile. Please refresh the page.
            </div>
          ) : null}

          {status === "ready" && !user ? (
            <div className="rounded-md border border-border/60 bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
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
            <div className="grid gap-4 rounded-md border border-border/60 bg-background/80 p-6 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Full name
                </span>
                <span className="text-foreground">
                  {user.fullName ?? "Student"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </span>
                <span className="text-foreground">{user.email}</span>
              </div>
              {user.role ? (
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Role
                  </span>
                  <span className="text-foreground capitalize">
                    {user.role}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {user ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-md border border-border/70 bg-muted/40 px-5 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-transparent px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:border-border hover:bg-muted/30 hover:text-foreground"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Account settings
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
