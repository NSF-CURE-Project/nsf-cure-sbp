"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        setMessage(
          "Request timed out. Please try again in a few seconds."
        );
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
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-semibold text-foreground">
          New password
        </label>
        <Input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2"
          placeholder="Enter a new password"
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

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full"
      >
        {status === "loading" ? "Updating..." : "Reset password"}
      </Button>
    </form>
  );
}
