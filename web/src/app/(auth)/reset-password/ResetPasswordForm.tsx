"use client";

import { useId, useState } from "react";

import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

export function ResetPasswordForm({ token }: { token: string }) {
  const errorId = useId();
  const [password, setPassword] = useState("");
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
      const res = await fetch(`${PAYLOAD_URL}/api/accounts/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({ token, password }),
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
      setMessage("Password updated. You can now sign in.");
      window.location.href = "/login";
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
      <PasswordInput
        label="New password"
        name="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter a new password"
        aria-invalid={status === "error" || undefined}
        aria-describedby={status === "error" ? errorId : undefined}
      />

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
        {status === "loading" ? "Updating…" : "Reset password"}
      </Button>
    </form>
  );
}
