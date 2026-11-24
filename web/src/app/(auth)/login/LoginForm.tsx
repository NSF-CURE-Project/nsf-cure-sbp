"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

const normalizeReturnPath = (value?: string | null) => {
  if (!value) return null;
  const candidate = value.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return null;
  if (candidate === "/login" || candidate.startsWith("/login?")) return null;
  return candidate;
};

const getReturnPath = () => {
  if (typeof window === "undefined") return "/";

  const search = new URLSearchParams(window.location.search);
  const fromQuery = normalizeReturnPath(search.get("next"));
  if (fromQuery) return fromQuery;

  try {
    if (!document.referrer) return "/";
    const referrer = new URL(document.referrer);
    if (referrer.origin !== window.location.origin) return "/";
    return (
      normalizeReturnPath(
        `${referrer.pathname}${referrer.search}${referrer.hash}`
      ) ?? "/"
    );
  } catch {
    return "/";
  }
};

export function LoginForm() {
  const emailId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
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

    try {
      const res = await fetch(`${PAYLOAD_URL}/api/accounts/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message ?? "Unable to sign in. Check your email and password."
        );
      }

      setStatus("success");
      setMessage("Signed in successfully.");
      window.location.href = getReturnPath();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Check your email and password."
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
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
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 rounded-lg text-[15px]"
          placeholder="student@cpp.edu"
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" ? errorId : undefined}
        />
      </div>

      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-invalid={status === "error" || undefined}
        aria-describedby={status === "error" ? errorId : undefined}
        hint={
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary transition-colors duration-150 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Forgot password?
          </Link>
        }
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
        disabled={status === "loading" || status === "success"}
        className="h-12 w-full rounded-lg text-[15px] font-semibold shadow-[0_2px_8px_rgba(0,80,48,0.10)] transition-[background-color,box-shadow,color] duration-150 hover:bg-primary/90 hover:shadow-[0_3px_10px_rgba(0,80,48,0.12)]"
      >
        {status === "loading"
          ? "Signing in…"
          : status === "success"
            ? "Redirecting…"
            : "Sign in"}
      </Button>
    </form>
  );
}
