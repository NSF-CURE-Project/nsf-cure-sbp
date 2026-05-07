import { cn } from "@/lib/utils";

type QuestionStatusBadgeProps = {
  status?: "open" | "answered" | "resolved" | string | null;
};

export function QuestionStatusBadge({ status }: QuestionStatusBadgeProps) {
  const normalized = status === "resolved" || status === "answered" ? status : "open";
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        normalized === "resolved"
          ? "bg-emerald-500/10 text-emerald-400"
          : normalized === "answered"
          ? "bg-blue-500/10 text-blue-300"
          : "bg-amber-500/10 text-amber-300"
      )}
    >
      {normalized}
    </span>
  );
}
