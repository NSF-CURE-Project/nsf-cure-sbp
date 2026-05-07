"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/observability/report";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, { boundary: "route" });
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          We hit an unexpected error
        </h1>
        <p className="mt-4 text-base text-slate-600">
          The page failed to load. Please try again — if the problem persists,
          contact support and include the reference below.
        </p>
        {error.digest ? (
          <p className="mt-4 inline-block rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700">
            ref: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="h-11 px-6">
            Try again
          </Button>
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
