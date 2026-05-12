type RecentActivityEntry = {
  date: string;
  lessonsCompleted: number;
  quizzesTaken: number;
};

type StreakDisplayProps = {
  activity: RecentActivityEntry[];
};

const toKey = (date: Date) => date.toISOString().slice(0, 10);

export function StreakDisplay({ activity }: StreakDisplayProps) {
  const activityMap = new Map(activity.map((entry) => [entry.date, entry]));
  const cells = Array.from({ length: 84 }).map((_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (83 - index));
    const key = toKey(day);
    const entry = activityMap.get(key);
    const total =
      (entry?.lessonsCompleted ?? 0) + (entry?.quizzesTaken ?? 0);
    return {
      key,
      total,
      title: entry
        ? `${key}: ${entry.lessonsCompleted} lessons, ${entry.quizzesTaken} quizzes`
        : `${key}: no activity`,
    };
  });

  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-5">
      <h2 className="text-base font-semibold text-foreground">Activity Heatmap</h2>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {cells.map((cell) => (
          <div
            key={cell.key}
            title={cell.title}
            className="h-4 w-4 rounded-sm border border-border/40"
            style={{
              backgroundColor:
                cell.total === 0
                  ? "hsl(var(--muted))"
                  : cell.total < 3
                  ? "hsl(var(--primary) / 0.35)"
                  : "hsl(var(--primary) / 0.75)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
