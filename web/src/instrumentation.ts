/**
 * Next.js instrumentation entry point.
 *
 * Runs once when the server starts, on both the Node and Edge runtimes.
 * Wire your APM/error tracker here. To plug in Sentry, follow:
 *   https://docs.sentry.io/platforms/javascript/guides/nextjs/install/manual-setup/
 * and call `Sentry.init` from the matching runtime branch below.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Example for Sentry (uncomment after adding @sentry/nextjs and SENTRY_DSN):
    // const Sentry = await import("@sentry/nextjs");
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   tracesSampleRate: 0.1,
    //   environment: process.env.NODE_ENV,
    // });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime initialization (Sentry edge SDK, etc.)
  }
}

export async function onRequestError(
  err: unknown,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
    revalidateReason: "on-demand" | "stale" | undefined;
    renderSource:
      | "react-server-components"
      | "react-server-components-payload"
      | "server-rendering";
  }
) {
  const error =
    err instanceof Error ? err : new Error(typeof err === "string" ? err : "Unknown server error");
  console.error(
    JSON.stringify({
      level: "server",
      ts: new Date().toISOString(),
      msg: error.message,
      name: error.name,
      stack: error.stack,
      path: request.path,
      method: request.method,
      route: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
    })
  );
  // Forward to Sentry/Datadog/etc. here once wired (e.g. Sentry.captureException).
}
