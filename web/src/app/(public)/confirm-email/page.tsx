"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

export default function ConfirmEmailPage({
  searchParams,
}: {
  searchParams?: { token?: string | string[] };
}) {
  const rawToken = searchParams?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Confirmation token is missing.");
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/accounts/confirm-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message ?? "Unable to confirm email.");
        }
        const data = (await res.json()) as { message?: string };
        setStatus("success");
        setMessage(data?.message ?? "Email confirmed.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to confirm email."
        );
      }
    };

    confirm();
  }, [token]);

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <div className="rounded-md border border-border/60 bg-card/80 p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-foreground">
          Confirm your email
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {status === "loading"
            ? "Verifying your email address now."
            : "You can return to your profile once this is complete."}
        </p>

        <div className="mt-6">
          <div
            className={`rounded-md px-4 py-3 text-sm ${
              status === "error"
                ? "border border-red-200 bg-red-50 text-red-700"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {status === "loading" ? "Working..." : message}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/profile">Back to profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
