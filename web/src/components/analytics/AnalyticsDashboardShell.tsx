"use client";

import { ScoreHistoryTable } from "@/components/analytics/ScoreHistoryTable";
import { StreakDisplay } from "@/components/analytics/StreakDisplay";

type AnalyticsPayload = {
  totalLessonsCompleted: number;
  totalTimeSpentSec: number;
  quizScoreHistory: {
    date: string | null;
    scorePercent: number;
    attemptId: string;
  }[];
  recentActivity: {
    date: string;
    lessonsCompleted: number;
    quizzesTaken: number;
  }[];
  currentStreak: number;
  longestStreak: number;
  classroomSummaries: {
    classroomId: string;
    classroomTitle: string;
    classTitle: string;
    completionRate: number;
    completedLessons: number;
    totalLessons: number;
  }[];
};

type AnalyticsDashboardShellProps = {
  data: AnalyticsPayload;
};

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
};

export function AnalyticsDashboardShell({ data }: AnalyticsDashboardShellProps) {
  return (
    <main className="mx-auto w-full max-w-[var(--content-max,100ch)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Personal analytics
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Learning Analytics</h1>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/60 bg-card/50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Lessons completed
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {data.totalLessonsCompleted}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Time spent
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {formatDuration(data.totalTimeSpentSec)}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Current streak
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {data.currentStreak} day{data.currentStreak === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Longest streak
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {data.longestStreak} day{data.longestStreak === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        <ScoreHistoryTable title="Quiz Scores" items={data.quizScoreHistory} />

        <StreakDisplay activity={data.recentActivity} />

        <section className="rounded-xl border border-border/60 bg-card/50 p-5">
          <h2 className="text-base font-semibold text-foreground">Classroom Progress</h2>
          {data.classroomSummaries.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No classroom enrollments found.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-2 py-2">Classroom</th>
                    <th className="px-2 py-2">Class</th>
                    <th className="px-2 py-2">Progress</th>
                    <th className="px-2 py-2">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.classroomSummaries.map((row) => (
                    <tr key={row.classroomId} className="border-b border-border/40">
                      <td className="px-2 py-2 text-foreground">{row.classroomTitle}</td>
                      <td className="px-2 py-2 text-muted-foreground">{row.classTitle}</td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {row.completedLessons}/{row.totalLessons}
                      </td>
                      <td className="px-2 py-2 text-foreground">
                        {Math.round(row.completionRate * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
