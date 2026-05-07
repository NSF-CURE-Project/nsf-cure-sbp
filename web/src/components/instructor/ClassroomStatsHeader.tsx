type ClassroomStatsHeaderProps = {
  enrollmentCount: number;
  averageCompletionRate: number;
  activeThisWeek: number;
};

export function ClassroomStatsHeader({
  enrollmentCount,
  averageCompletionRate,
  activeThisWeek,
}: ClassroomStatsHeaderProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Enrollment</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{enrollmentCount}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Avg completion
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {Math.round(averageCompletionRate * 100)}%
        </p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Active this week
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">{activeThisWeek}</p>
      </div>
    </section>
  );
}
