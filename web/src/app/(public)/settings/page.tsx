"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

type AccountUser = {
  email: string;
  fullName?: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
        const account = data?.user ?? null;
        setUser(account);
        setFullName(account?.fullName ?? "");
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Unable to update settings.");
      }

      setMessage("Profile updated.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update settings."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-md border border-border/60 bg-card/80 p-10 shadow-lg">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Settings
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Account settings
          </h1>
          <p className="text-muted-foreground">
            Update your display name used across the student portal.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {status === "loading" ? (
            <div className="rounded-md border border-border/60 bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
              Loading your account...
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              We could not load your account. Please refresh the page.
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
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-2 bg-muted/40 text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground">
                  Display name
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2"
                  placeholder="Your name"
                />
              </div>

              {message ? (
                <div
                  className={`rounded-md px-4 py-3 text-sm ${
                    message === "Profile updated."
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={saving}
                  variant="outline"
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-transparent px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:border-border hover:bg-muted/30 hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                  Back to profile
                </Link>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </main>
  );
}
