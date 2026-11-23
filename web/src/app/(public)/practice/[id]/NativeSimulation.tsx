"use client";

import { useEffect, useRef, useState } from "react";
import loaders from "@/lib/practice/simulations/loaders.generated.mjs";
import type { PracticeAssignment } from "@/lib/practice/assignment";
import { SimulationFrame } from "./SimulationFrame";

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

export function NativeSimulation({ id, title, seed, level, content, fallback, assignment }: {
  id: string;
  title: string;
  seed: string;
  level: string;
  content: { html: string; css: string; version: string };
  fallback: string;
  assignment: PracticeAssignment | null;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [tracking, setTracking] = useState("");

  useEffect(() => {
    const target = mount.current;
    if (!target) return;
    let disposed = false;
    let saving = false;
    let pending: { id: string; signature: string } | null = null;
    const root = target.shadowRoot ?? target.attachShadow({ mode: "open" });
    const body = document.createElement("div");
    body.className = "simulation-body";
    body.dataset.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    body.innerHTML = content.html;
    const style = document.createElement("style");
    style.textContent = content.css + sharedCss;
    root.replaceChildren(style, body);
    const theme = new MutationObserver(() => {
      body.dataset.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

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
              if (!disposed) setTracking(response.ok
                ? result?.completed ? "Practice completed. Your attempt was saved." : "Attempt saved."
                : result?.error ?? "Your attempt could not be saved. Check your answers again to retry.");
            }).catch(() => {
              if (!disposed) setTracking("Your attempt could not be saved. Check your answers again to retry.");
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
      } catch {
        if (!disposed) setFailed(true);
      }
    })();
    return () => {
      disposed = true;
      theme.disconnect();
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
    <section aria-label={title}>
      <div ref={mount} />
      {tracking ? <p role="status" className="mt-3 text-sm text-muted-foreground">{tracking}</p> : null}
    </section>
  );
}
