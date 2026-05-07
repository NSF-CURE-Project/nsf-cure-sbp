/**
 * Pluggable error/event reporter.
 *
 * Today this is a thin wrapper around console + an optional fetch beacon.
 * To wire Sentry/Datadog/Highlight: import their SDK in the matching
 * `instrumentation*.ts` and re-export their capture function from here.
 */

type Severity = "info" | "warning" | "error";

type Context = Record<string, unknown> | undefined;

const isBrowser = typeof window !== "undefined";

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const sendBeacon = (payload: Record<string, unknown>) => {
  if (!isBrowser) return;
  try {
    const body = safeStringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/observability/log", blob);
      return;
    }
    void fetch("/api/observability/log", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => {});
  } catch {
    // best-effort
  }
};

export function reportClientError(error: unknown, context?: Context) {
  const err =
    error instanceof Error ? error : new Error(safeStringify(error));
  if (process.env.NODE_ENV !== "production") {
    console.error("[report]", err, context);
  }
  sendBeacon({
    type: "error",
    message: err.message,
    stack: err.stack,
    name: err.name,
    digest: (error as { digest?: string } | null)?.digest,
    context,
    url: isBrowser ? window.location.href : undefined,
    ts: Date.now(),
  });
}

export function reportEvent(
  name: string,
  severity: Severity = "info",
  context?: Context
) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[report]", severity, name, context);
  }
  sendBeacon({
    type: "event",
    severity,
    name,
    context,
    url: isBrowser ? window.location.href : undefined,
    ts: Date.now(),
  });
}

export function reportServerError(error: unknown, context?: Context) {
  const err =
    error instanceof Error ? error : new Error(safeStringify(error));
  console.error(
    JSON.stringify({
      level: "error",
      msg: err.message,
      name: err.name,
      stack: err.stack,
      context,
      ts: new Date().toISOString(),
    })
  );
}
