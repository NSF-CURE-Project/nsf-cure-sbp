"use client";

import {
  ClassEnrollmentRow,
  type DashboardEnrollment,
} from "@/components/dashboard/ClassEnrollmentRow";
import {
  NextLessonCard,
  type NextLessonTarget,
} from "@/components/dashboard/NextLessonCard";
import {
  InProgressLessonsList,
  type InProgressLessonItem,
} from "@/components/dashboard/InProgressLessonsList";
import {
  RecommendedActions,
  type RecommendedActionItem,
} from "@/components/dashboard/RecommendedActions";
import {
  ResumeLearningCard,
} from "@/components/dashboard/ResumeLearningCard";
import { SavedLessonsList, type SavedLessonItem } from "@/components/dashboard/SavedLessonsList";

type DashboardShellProps = {
  fullName?: string;
  currentStreak: number;
  longestStreak: number;
  enrollments: DashboardEnrollment[];
  nextLesson: NextLessonTarget | null;
  resumeItem: {
    title: string;
    subtitle: string;
    href: string;
    hint?: string;
  } | null;
  savedLessons: SavedLessonItem[];
  inProgressLessons: InProgressLessonItem[];
  recommendedActions: RecommendedActionItem[];
};

export function DashboardShell({
  fullName,
  currentStreak,
  longestStreak,
  enrollments,
  nextLesson,
  resumeItem,
  savedLessons,
  inProgressLessons,
  recommendedActions,
}: DashboardShellProps) {
  return (
    <main className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="rounded-md border border-border/60 bg-background/80 p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Student dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Welcome back{fullName ? `, ${fullName}` : ""}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="rounded-full border border-border/70 bg-muted/30 px-4 py-1.5 text-sm font-medium text-foreground">
              Current streak: {currentStreak} day{currentStreak === 1 ? "" : "s"}
            </div>
            <div className="rounded-full border border-border/70 bg-muted/30 px-4 py-1.5 text-sm font-medium text-foreground">
              Longest streak: {longestStreak} day{longestStreak === 1 ? "" : "s"}
            </div>
          </div>
        </section>

        <NextLessonCard nextLesson={nextLesson} />
        <ResumeLearningCard item={resumeItem} />

        <div className="grid gap-4 lg:grid-cols-2">
          <SavedLessonsList items={savedLessons} />
          <InProgressLessonsList items={inProgressLessons} />
        </div>

        <RecommendedActions actions={recommendedActions} />

        <section className="rounded-md border border-border/60 bg-background/80 p-6">
          <h2 className="text-sm font-semibold text-foreground">Enrolled classes</h2>
          {enrollments.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              You have not enrolled in a classroom yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {enrollments.map((enrollment) => (
                <ClassEnrollmentRow key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
