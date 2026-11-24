import Link from "next/link";
import { ArrowRight, CheckCircle2, CirclePlay, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PracticeStatus = 1 | 2 | 3;

type LessonPracticeCardProps = {
  href: string;
  title: string;
  required: boolean;
  status?: number;
};

const statusMeta = (status?: number) => {
  if (status === 3) {
    return {
      label: "Completed",
      hint: "Nice work — you can revisit this practice any time.",
      cta: "Practice again",
      icon: CheckCircle2,
    };
  }
  if (status === 2 || status === 1) {
    return {
      label: status === 2 ? "In progress" : "Started",
      hint: "Pick up where you left off in the practice workspace.",
      cta: "Continue practice",
      icon: CirclePlay,
    };
  }
  return {
    label: null,
    hint: "Opens in the practice workspace — return here when you’re done.",
    cta: "Start practice",
    icon: Sparkles,
  };
};

export function LessonPracticeCard({
  href,
  title,
  required,
  status,
}: LessonPracticeCardProps) {
  const normalized =
    status === 1 || status === 2 || status === 3
      ? (status as PracticeStatus)
      : undefined;
  const meta = statusMeta(normalized);
  const StatusIcon = meta.icon;
  const complete = normalized === 3;

  return (
    <section
      className={cn(
        "rounded-xl border px-4 py-4 sm:px-5",
        complete
          ? "border-primary/30 bg-primary/[0.04]"
          : "border-border/70 bg-muted/15"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {required ? "Required practice" : "Optional practice"}
            </span>
            {meta.label ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium",
                  complete
                    ? "bg-primary/15 text-primary"
                    : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                )}
              >
                <StatusIcon className="h-3 w-3" aria-hidden />
                {meta.label}
              </span>
            ) : null}
          </div>
          <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
            {title}
          </h3>
          <p className="max-w-xl text-[13px] leading-relaxed text-muted-foreground">
            {meta.hint}
          </p>
        </div>

        <Button
          asChild
          variant={complete ? "outline" : "default"}
          className="shrink-0"
        >
          <Link href={href}>
            {meta.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
