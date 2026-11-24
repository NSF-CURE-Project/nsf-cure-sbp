"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

export function ForgotPasswordForm() {
  const emailId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${PAYLOAD_URL}/api/accounts/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        let detail = "";
        if (raw) {
          try {
            const data = JSON.parse(raw) as { message?: string };
            detail = data?.message?.trim() ?? "";
          } catch {
            detail = raw.trim();
          }
        }
        throw new Error(detail || "Password reset failed.");
      }

      setStatus("success");
      setMessage("Check your email for a password reset link.");
      window.location.href = "/check-email";
    } catch (error) {
      setStatus("error");
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("Request timed out. Please try again in a few seconds.");
        return;
      }
      setMessage(
        error instanceof Error ? error.message : "Password reset failed."
      );
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label
          htmlFor={emailId}
          className="block text-sm font-medium text-foreground"
        >
          Email address
        </label>
        <Input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-lg text-[15px] sm:h-12"
          placeholder="student@cpp.edu"
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" ? errorId : undefined}
        />
      </div>

      {message ? (
        <div
          id={errorId}
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-lg px-3.5 py-3 text-sm leading-relaxed ${
            status === "error"
              ? "border border-destructive/25 bg-destructive/5 text-destructive"
              : "border border-primary/20 bg-primary/5 text-primary"
          }`}
        >
          {message}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-11 w-full rounded-lg text-[15px] font-semibold sm:h-12"
      >
        {status === "loading" ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
