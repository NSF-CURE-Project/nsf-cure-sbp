type ScoreHistoryItem = {
  date: string | null;
  scorePercent: number;
  attemptId: string;
};

type ScoreHistoryTableProps = {
  title: string;
  items: ScoreHistoryItem[];
};

const formatDate = (value: string | null) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export function ScoreHistoryTable({ title, items }: ScoreHistoryTableProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No attempts yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Score</th>
                <th className="px-2 py-2">Percent</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.attemptId} className="border-b border-border/40">
                  <td className="px-2 py-2 text-foreground">{formatDate(item.date)}</td>
                  <td className="px-2 py-2 text-foreground">{item.scorePercent.toFixed(1)}%</td>
                  <td className="px-2 py-2 text-muted-foreground">
                    {Math.round(item.scorePercent)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
