"use client";

import { useState } from "react";

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${PAYLOAD_URL}/api/accounts/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Password reset failed.");
      }

      setStatus("success");
      setMessage("Check your email for a password reset link.");
      window.location.href = "/check-email";
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Password reset failed.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-semibold text-foreground">Email</label>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-md border border-border/70 bg-background px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          placeholder="student@cpp.edu"
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

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
