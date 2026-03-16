import { cn } from "@/lib/utils";

type MasteryBadgeProps = {
  mastered: boolean;
  scorePercent: number;
  thresholdPercent: number;
};

export function MasteryBadge({
  mastered,
  scorePercent,
  thresholdPercent,
}: MasteryBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        mastered
          ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-400"
          : "border-amber-400/50 bg-amber-500/10 text-amber-300"
      )}
    >
      {mastered ? "Mastered" : "Needs review"} · {Math.round(scorePercent)}% /{" "}
      {thresholdPercent}%
    </div>
  );
}
