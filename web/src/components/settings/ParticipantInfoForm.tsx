"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

type AccountUser = {
  participantType?: string | null;
  organizationName?: string | null;
  firstGenCollegeStudent?: boolean | null;
  transferStudent?: boolean | null;
  contributionSummary?: string | null;
};

const participantTypeOptions = [
  { label: "Undergraduate", value: "undergraduate_student" },
  { label: "Graduate", value: "graduate_student" },
  { label: "K-12", value: "k12_student" },
  { label: "Teacher", value: "teacher" },
  { label: "Staff", value: "staff" },
  { label: "Faculty", value: "faculty" },
  { label: "Other", value: "other" },
];

export function ParticipantInfoForm() {
  const [form, setForm] = useState({
    participantType: "",
    organizationName: "",
    firstGenCollegeStudent: false,
    transferStudent: false,
    contributionSummary: "",
  });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
        const data = (await res.json()) as { user?: AccountUser };
        const user = data.user;
        setForm({
          participantType: user?.participantType ?? "",
          organizationName: user?.organizationName ?? "",
          firstGenCollegeStudent: Boolean(user?.firstGenCollegeStudent),
          transferStudent: Boolean(user?.transferStudent),
          contributionSummary: user?.contributionSummary ?? "",
        });
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${PAYLOAD_URL}/api/accounts/me/demographics`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Unable to save participant info.");
      }

      setMessage("Participant info saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save participant info."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Participant info
        </p>
        <h1 className="text-2xl font-bold text-foreground">
          NSF reporting profile
        </h1>
        <p className="text-sm text-muted-foreground">
          This information is used for NSF reporting purposes.
        </p>
      </div>

      {status === "loading" ? (
        <div className="mt-6 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Loading participant info...
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          We could not load your participant info.
        </div>
      ) : null}

      {status === "ready" ? (
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground">
              Participant type
            </label>
            <select
              value={form.participantType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  participantType: event.target.value,
                }))
              }
              className="mt-2 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
            >
              <option value="">Select participant type</option>
              {participantTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground">
              Organization name
            </label>
            <Input
              value={form.organizationName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  organizationName: event.target.value,
                }))
              }
              className="mt-2"
              placeholder="Your college, school, or organization"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
              <input
                type="checkbox"
                checked={form.firstGenCollegeStudent}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    firstGenCollegeStudent: event.target.checked,
                  }))
                }
                className="mt-0.5"
              />
              <span>
                <span className="block font-semibold text-foreground">
                  First-generation college student
                </span>
                <span className="text-muted-foreground">
                  Used for cohort reporting.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
              <input
                type="checkbox"
                checked={form.transferStudent}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    transferStudent: event.target.checked,
                  }))
                }
                className="mt-0.5"
              />
              <span>
                <span className="block font-semibold text-foreground">
                  Transfer student
                </span>
                <span className="text-muted-foreground">
                  Used for cohort reporting.
                </span>
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground">
              Contribution summary
            </label>
            <Textarea
              value={form.contributionSummary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contributionSummary: event.target.value,
                }))
              }
              className="mt-2 min-h-28"
              placeholder="Briefly describe your participation in the project."
            />
          </div>

          {message ? (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                message === "Participant info saved."
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          ) : null}

          <Button type="submit" variant="outline" disabled={saving}>
            {saving ? "Saving..." : "Save participant info"}
          </Button>
        </form>
      ) : null}
    </section>
  );
}
