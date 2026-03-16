import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardEnrollment } from "@/components/dashboard/ClassEnrollmentRow";
import type { NextLessonTarget } from "@/components/dashboard/NextLessonCard";
import { getClassesTree } from "@/lib/payloadSdk/classes";
import type { ChapterDoc, ClassDoc, LessonDoc } from "@/lib/payloadSdk/types";

type AccountUser = {
  id: string;
  email: string;
  fullName?: string;
  currentStreak?: number;
  longestStreak?: number;
};

type ClassroomMembership = {
  id: string;
  totalLessons?: number;
  completedLessons?: number;
  completionRate?: number;
  lastActivityAt?: string | null;
  joinedAt?: string;
  classroom?: {
    title?: string;
    class?: {
      id?: string | number;
      title?: string;
      slug?: string;
    };
  };
};

type LessonProgressDoc = {
  lesson?: string | number | { id?: string | number };
  class?: string | number | { id?: string | number };
};

type ApiResult<T> = {
  docs?: T[];
  user?: AccountUser;
};

const idOf = (value: unknown): string => {
  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id?: string | number }).id;
    return id != null ? String(id) : "";
  }
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
};

const toDateSortValue = (value?: string | null): number => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const byOrder = <T extends { order?: number | null; title?: string }>(a: T, b: T) => {
  const aOrder = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
  const bOrder = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return (a.title ?? "").localeCompare(b.title ?? "");
};

const firstIncompleteLesson = (
  classDoc: ClassDoc | undefined,
  completed: Set<string>
): { chapterSlug?: string; lessonSlug: string; lessonTitle: string } | null => {
  if (!classDoc?.chapters || !Array.isArray(classDoc.chapters)) return null;
  const chapters = [...classDoc.chapters].filter(
    (chapter): chapter is ChapterDoc =>
      typeof chapter === "object" && chapter !== null && "slug" in chapter
  );
  chapters.sort(byOrder);

  for (const chapter of chapters) {
    const lessons = Array.isArray(chapter.lessons)
      ? chapter.lessons.filter(
          (lesson): lesson is LessonDoc =>
            typeof lesson === "object" && lesson !== null && "slug" in lesson
        )
      : [];
    lessons.sort(byOrder);
    for (const lesson of lessons) {
      const lessonId = idOf(lesson.id);
      if (!lessonId || completed.has(lessonId)) continue;
      return {
        chapterSlug: chapter.slug,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
      };
    }
  }

  return null;
};

async function fetchApi<T>(path: string): Promise<T | null> {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  const cookie = reqHeaders.get("cookie") ?? "";

  const response = await fetch(`${protocol}://${host}${path}`, {
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  });

  if (!response.ok) return null;
  return (await response.json()) as T;
}

export default async function DashboardPage() {
  const me = await fetchApi<{ user?: AccountUser }>("/api/accounts/me");
  const user = me?.user;

  if (!user?.id) {
    redirect("/login?next=/dashboard");
  }

  const [membershipsResult, progressResult, classTree] = await Promise.all([
    fetchApi<ApiResult<ClassroomMembership>>(
      `/api/classroom-memberships?where[student][equals]=${encodeURIComponent(
        user.id
      )}&depth=2&limit=50`
    ),
    fetchApi<ApiResult<LessonProgressDoc>>(
      `/api/lesson-progress?where[user][equals]=${encodeURIComponent(
        user.id
      )}&where[completed][equals]=true&depth=0&limit=2000`
    ),
    getClassesTree({ revalidate: 0 }).catch(() => []),
  ]);

  const memberships = [...(membershipsResult?.docs ?? [])].sort(
    (a, b) => toDateSortValue(b.lastActivityAt) - toDateSortValue(a.lastActivityAt)
  );

  const enrollments: DashboardEnrollment[] = memberships.map((membership) => ({
    id: membership.id,
    joinedAt: membership.joinedAt,
    totalLessons: membership.totalLessons ?? 0,
    completedLessons: membership.completedLessons ?? 0,
    completionRate: membership.completionRate ?? 0,
    lastActivityAt: membership.lastActivityAt ?? null,
    classroomTitle: membership.classroom?.title ?? "Classroom",
    classTitle: membership.classroom?.class?.title ?? "Class",
    classSlug: membership.classroom?.class?.slug,
  }));

  const completedByClass = new Map<string, Set<string>>();
  for (const entry of progressResult?.docs ?? []) {
    const classId = idOf(entry.class);
    const lessonId = idOf(entry.lesson);
    if (!classId || !lessonId) continue;
    if (!completedByClass.has(classId)) completedByClass.set(classId, new Set());
    completedByClass.get(classId)?.add(lessonId);
  }

  const classById = new Map<string, ClassDoc>();
  for (const classDoc of classTree) {
    classById.set(String(classDoc.id), classDoc);
  }

  let nextLesson: NextLessonTarget | null = null;
  for (const membership of memberships) {
    const classInfo = membership.classroom?.class;
    const classId = idOf(classInfo?.id);
    if (!classId) continue;
    const classDoc = classById.get(classId);
    const classSlug = classInfo?.slug ?? classDoc?.slug;
    if (!classDoc || !classSlug) continue;
    const completed = completedByClass.get(classId) ?? new Set<string>();
    const next = firstIncompleteLesson(classDoc, completed);
    if (!next) continue;

    nextLesson = {
      classSlug,
      chapterSlug: next.chapterSlug,
      lessonSlug: next.lessonSlug,
      lessonTitle: next.lessonTitle,
      classTitle: classInfo?.title ?? classDoc.title,
    };
    break;
  }

  return (
    <DashboardShell
      fullName={user.fullName}
      currentStreak={user.currentStreak ?? 0}
      longestStreak={user.longestStreak ?? 0}
      enrollments={enrollments}
      nextLesson={nextLesson}
    />
  );
}
