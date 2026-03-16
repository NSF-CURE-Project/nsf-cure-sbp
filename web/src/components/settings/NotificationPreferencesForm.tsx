"use client";

import { useEffect, useRef, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

type Preferences = {
  questionAnswered: boolean;
  newContent: boolean;
  announcement: boolean;
  quizDeadline: boolean;
};

const defaultPreferences: Preferences = {
  questionAnswered: true,
  newContent: true,
  announcement: true,
  quizDeadline: true,
};

const preferenceLabels: {
  key: keyof Preferences;
  label: string;
}[] = [
  { key: "questionAnswered", label: "When a question I asked gets answered" },
  { key: "newContent", label: "When new lessons or content are published" },
  { key: "announcement", label: "Class announcements" },
  { key: "quizDeadline", label: "Quiz and assignment deadlines" },
];

export function NotificationPreferencesForm() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [savedState, setSavedState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = (await res.json()) as {
          user?: { notificationPreferences?: Partial<Preferences> };
        };
        setPreferences({
          ...defaultPreferences,
          ...data.user?.notificationPreferences,
        });
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const queueSave = (nextPreferences: Preferences) => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }

    setSavedState("saving");
    saveTimer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/accounts/me/notification-preferences`,
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nextPreferences),
          }
        );
        if (!res.ok) throw new Error("Unable to save.");
        setSavedState("saved");
        window.setTimeout(() => setSavedState("idle"), 1200);
      } catch {
        setSavedState("error");
      }
    }, 350);
  };

  return (
    <section className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Notifications
          </p>
          <h1 className="text-2xl font-bold text-foreground">
            Notification preferences
          </h1>
        </div>
        <span className="text-sm text-muted-foreground">
          {savedState === "saving"
            ? "Saving..."
            : savedState === "saved"
            ? "Saved"
            : savedState === "error"
            ? "Save failed"
            : ""}
        </span>
      </div>

      {status === "loading" ? (
        <div className="mt-6 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Loading preferences...
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          We could not load your notification preferences.
        </div>
      ) : null}

      {status === "ready" ? (
        <div className="mt-6 space-y-3">
          {preferenceLabels.map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 p-4"
            >
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <Switch
                checked={preferences[item.key]}
                onCheckedChange={(checked) => {
                  const next = { ...preferences, [item.key]: checked };
                  setPreferences(next);
                  queueSave(next);
                }}
                aria-label={item.label}
              />
            </label>
          ))}
        </div>
      ) : null}
    </section>
  );
}
