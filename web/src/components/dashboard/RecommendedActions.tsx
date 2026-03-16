"use client";

import Link from "next/link";

export type RecommendedActionItem = {
  id: string;
  label: string;
  href: string;
  reason: string;
};

type RecommendedActionsProps = {
  actions: RecommendedActionItem[];
};

export function RecommendedActions({ actions }: RecommendedActionsProps) {
  return (
    <section className="rounded-md border border-border/60 bg-background/80 p-5">
      <h2 className="text-sm font-semibold text-foreground">Recommended next actions</h2>
      {actions.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No pending actions. Keep up the momentum.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {actions.map((action) => (
            <li key={action.id} className="rounded-md border border-border/50 bg-muted/20 p-3">
              <p className="text-sm font-semibold text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.reason}</p>
              <Link
                href={action.href}
                className="mt-1 inline-block text-xs font-semibold text-primary underline underline-offset-4"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
