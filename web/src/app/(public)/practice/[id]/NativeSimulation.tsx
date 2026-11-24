"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import loaders from "@/lib/practice/simulations/loaders.generated.mjs";
import type { PracticeAssignment } from "@/lib/practice/assignment";
import { SimulationFrame } from "./SimulationFrame";
import { beamWorkspaceStyles } from "./beamWorkspaceStyles";
import {
  enhanceBeamEditors,
  isBeamSimulation,
  mountBeamWorkspace,
} from "./enhanceBeamWorkspace";

type SimulationOptions = {
  document: object;
  localStorage: { setItem: (key: string, value: string) => void };
  seed: string;
  newSeed: () => string;
  initialLevel: string;
  onAttempt: (seed: string, responses: unknown) => void;
  onVariant: (seed: string, level?: string) => void;
};
const loadSimulation = loaders as unknown as Record<string, (() => Promise<{
  default: (options: SimulationOptions) => void;
}>) | undefined>;

const sharedCss = `
  :host { display: block; min-width: 0; }
  .simulation-body {
    --bg: hsl(var(--background)); --panel: hsl(var(--background));
    --surface: hsl(var(--background)); --border: hsl(var(--foreground) / 0.18);
    --dark: hsl(var(--foreground)); --text: hsl(var(--foreground));
    --gray: hsl(var(--muted-foreground)); --muted: hsl(var(--muted-foreground));
    --accent: hsl(var(--primary)); --blue: hsl(var(--primary)); --blue-dark: hsl(var(--primary));
    padding: 0; margin: 0; font-family: inherit; min-height: 0; color-scheme: inherit;
  }
  .simulation-body[data-theme="dark"] { color-scheme: dark; }
  .simulation-body input, .simulation-body button, .simulation-body select { font-family: inherit; }
  .simulation-body :is(input, button, select):focus-visible { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }
  .simulation-body :is(header, .quiz-header) { flex-wrap: wrap; }
  .simulation-body #theme-toggle { display: none; }
  .simulation-body .chip { background: hsl(var(--primary) / 0.1); border-color: hsl(var(--primary) / 0.25); }
  @media (max-width: 640px) {
    .simulation-body .panel { padding: 12px; }
    .simulation-body .input-row input { min-width: 0; }
    .simulation-body .sbp-plot-scroll { overflow-x: auto; }
    .simulation-body .sbp-plot-scroll .editor-svg { min-width: 620px; }
  }
`;

export function NativeSimulation({
  id,
  title,
  seed,
  level,
  content,
  fallback,
  assignment,
  lessonHref = null,
}: {
  id: string;
  title: string;
  seed: string;
  level: string;
  content: { html: string; css: string; version: string };
  fallback: string;
  assignment: PracticeAssignment | null;
  lessonHref?: string | null;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [tracking, setTracking] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const target = mount.current;
    if (!target) return;
    let disposed = false;
    let saving = false;
    let pending: { id: string; signature: string } | null = null;
    const cleanups: Array<() => void> = [];
    const root = target.shadowRoot ?? target.attachShadow({ mode: "open" });
    const body = document.createElement("div");
    body.className = "simulation-body";
    body.dataset.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    body.innerHTML = content.html;
    const style = document.createElement("style");
    style.textContent = content.css + sharedCss + beamWorkspaceStyles;
    root.replaceChildren(style, body);
    const theme = new MutationObserver(() => {
      body.dataset.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    if (isBeamSimulation(body)) {
      cleanups.push(mountBeamWorkspace(body) ?? (() => undefined));
    }

    const scopedDocument = {
      getElementById: root.getElementById.bind(root),
      querySelector: root.querySelector.bind(root),
      querySelectorAll: root.querySelectorAll.bind(root),
      createElement: document.createElement.bind(document),
      createElementNS: document.createElementNS.bind(document),
      createTextNode: document.createTextNode.bind(document),
      documentElement: body,
    };
    const loader = loadSimulation[id];
    void (async () => {
      try {
        if (!loader) throw new Error("Missing simulation");
        const { default: run } = await loader();
        if (disposed) return;
        run({
          document: scopedDocument, localStorage: { setItem: () => undefined },
          seed, newSeed: () => crypto.randomUUID(), initialLevel: level,
          onVariant(nextSeed, nextLevel) {
            if (nextSeed === seed && nextLevel === undefined) return;
            const url = new URL(window.location.href);
            if (url.searchParams.get("variant") === nextSeed &&
                (nextLevel == null || url.searchParams.get("level") === nextLevel)) return;
            url.searchParams.set("variant", nextSeed);
            if (nextLevel) url.searchParams.set("level", nextLevel);
            window.history.replaceState(null, "", url);
          },
          onAttempt(currentSeed, responses) {
            if (!assignment || saving) return;
            saving = true;
            const signature = JSON.stringify([currentSeed, responses]);
            if (!pending || pending.signature !== signature) pending = { id: crypto.randomUUID(), signature };
            setTracking("Saving attempt…");
            void fetch("/api/practice-attempts/record", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ ...assignment, action: "submit", seed: currentSeed, responses,
                submissionId: pending.id, version: content.version }),
            }).then(async (response) => {
              const result = await response.json().catch(() => null);
              if (response.status < 500) pending = null;
              if (disposed) return;
              if (!response.ok) {
                setCompleted(false);
                setTracking(
                  result?.error ??
                    "Your attempt could not be saved. Check your answers again to retry."
                );
                return;
              }
              if (result?.completed) {
                setCompleted(true);
                setTracking("Practice completed. Your attempt was saved.");
              } else {
                setCompleted(false);
                setTracking("Attempt saved.");
              }
            }).catch(() => {
              if (!disposed) {
                setCompleted(false);
                setTracking(
                  "Your attempt could not be saved. Check your answers again to retry."
                );
              }
            }).finally(() => { saving = false; });
          },
        });
        for (const chart of root.querySelectorAll(".editor-svg")) {
          const scroll = document.createElement("div");
          scroll.className = "sbp-plot-scroll";
          scroll.setAttribute("role", "region");
          scroll.setAttribute("aria-label", chart.getAttribute("aria-label") ?? "Diagram grid");
          scroll.tabIndex = 0;
          chart.before(scroll);
          scroll.append(chart);
        }
        if (!disposed) cleanups.push(enhanceBeamEditors(root));
      } catch {
        if (!disposed) setFailed(true);
      }
    })();
    return () => {
      disposed = true;
      theme.disconnect();
      for (const cleanup of cleanups) cleanup();
      root.replaceChildren();
    };
  }, [id, seed, level, content, assignment]);

  if (failed) return (
    <div>
      {assignment ? <p role="status">The fallback simulation does not save attempts.</p> : null}
      <SimulationFrame title={title} document={fallback} />
    </div>
  );
  return (
    <section aria-label={title} className="min-w-0">
      <div ref={mount} className="min-w-0" />
      {tracking ? (
        <div
          role="status"
          className={
            completed
              ? "mt-3 flex flex-col gap-2 rounded-lg border border-primary/25 bg-primary/[0.05] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              : "mt-3 text-sm text-muted-foreground"
          }
        >
          {completed ? (
            <>
              <p className="inline-flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>{tracking}</span>
              </p>
              {lessonHref ? (
                <Link
                  href={lessonHref}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Return to lesson
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ) : null}
            </>
          ) : (
            <p>{tracking}</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
