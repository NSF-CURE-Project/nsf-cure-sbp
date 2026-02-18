"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        throw new Error(data?.message ?? "Login failed.");
      }

      const data = await res.json();
      if (data?.token) {
        localStorage.setItem("sbp-auth-token", data.token);
      }

      setStatus("success");
      setMessage("Logged in successfully.");
      window.location.href = "/";
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Login failed.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-semibold tracking-[0.01em] text-slate-900">
          Email
        </label>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="login-input h-12 rounded-xl !border !border-slate-300 !bg-white !text-base !text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:!border-slate-400 focus-visible:!border-emerald-600 focus-visible:!ring-2 focus-visible:!ring-emerald-200 dark:!border-slate-300 dark:!bg-white dark:!text-slate-900"
          placeholder="student@cpp.edu"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-semibold tracking-[0.01em] text-slate-900">
          Password
        </label>
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="login-input h-12 rounded-xl !border !border-slate-300 !bg-white !text-base !text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:!border-slate-400 focus-visible:!border-emerald-600 focus-visible:!ring-2 focus-visible:!ring-emerald-200 dark:!border-slate-300 dark:!bg-white dark:!text-slate-900"
          placeholder="••••••••"
        />
      </div>

      {message ? (
        <div
          aria-live="polite"
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
        className="h-12 w-full rounded-xl bg-emerald-700 text-base font-semibold text-white shadow-md shadow-emerald-900/30 transition-all duration-200 hover:bg-emerald-800 active:scale-[0.99]"
      >
        {status === "loading" ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
