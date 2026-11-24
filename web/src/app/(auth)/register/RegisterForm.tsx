"use client";

import { useId, useState } from "react";

import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { LoginLink } from "@/components/auth/LoginLink";
import { Input } from "@/components/ui/input";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

export function RegisterForm() {
  const nameId = useId();
  const emailId = useId();
  const errorId = useId();
  const [fullName, setFullName] = useState("");
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
      const res = await fetch(`${PAYLOAD_URL}/api/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          fullName: fullName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Registration failed.");
      }

      setStatus("success");
      setMessage("Account created. You can sign in now.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Registration failed."
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label
          htmlFor={nameId}
          className="block text-sm font-medium text-foreground"
        >
          Full name
        </label>
        <Input
          id={nameId}
          type="text"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="h-11 rounded-lg text-[15px] sm:h-12"
          placeholder="Jane Doe"
        />
      </div>
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
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Create a password"
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

      {status !== "success" ? (
        <Button
          type="submit"
          disabled={status === "loading"}
          className="h-11 w-full rounded-lg text-[15px] font-semibold sm:h-12"
        >
          {status === "loading" ? "Creating account…" : "Create account"}
        </Button>
      ) : (
        <Button asChild className="h-11 w-full rounded-lg text-[15px] font-semibold sm:h-12">
          <LoginLink>Go to sign in</LoginLink>
        </Button>
      )}
    </form>
  );
}
