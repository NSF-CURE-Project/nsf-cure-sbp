import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardEnrollment } from "@/components/dashboard/ClassEnrollmentRow";
import type { InProgressLessonItem } from "@/components/dashboard/InProgressLessonsList";
import type { NextLessonTarget } from "@/components/dashboard/NextLessonCard";
import type { RecommendedActionItem } from "@/components/dashboard/RecommendedActions";
import type { SavedLessonItem } from "@/components/dashboard/SavedLessonsList";
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
  lesson?: string | number | { id?: string | number; title?: string };
  class?: string | number | { id?: string | number };
  completed?: boolean;
  updatedAt?: string;
};

type LessonBookmarkDoc = {
  id?: string | number;
  lesson?: string | number | { id?: string | number; title?: string };
  updatedAt?: string;
};

type ApiResult<T> = {
  docs?: T[];
  user?: AccountUser;
};

type LessonIndexEntry = {
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  chapterTitle: string;
  chapterSlug: string;
  classTitle: string;
  classSlug: string;
  classId: string;
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

const lessonHref = (entry: LessonIndexEntry) =>
  `/classes/${entry.classSlug}/lessons/${entry.lessonSlug}`;

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

const buildLessonIndex = (classTree: ClassDoc[]): Map<string, LessonIndexEntry> => {
  const map = new Map<string, LessonIndexEntry>();
  for (const classDoc of classTree) {
    const classId = String(classDoc.id);
    const classSlug = classDoc.slug;
    const classTitle = classDoc.title;
    if (!Array.isArray(classDoc.chapters)) continue;
    const chapters = classDoc.chapters.filter(
      (chapter): chapter is ChapterDoc =>
        typeof chapter === "object" && chapter !== null && "slug" in chapter
    );
    for (const chapter of chapters) {
      if (!Array.isArray(chapter.lessons)) continue;
      const lessons = chapter.lessons.filter(
        (lesson): lesson is LessonDoc =>
          typeof lesson === "object" && lesson !== null && "slug" in lesson
      );
      for (const lesson of lessons) {
        const lessonId = idOf(lesson.id);
        if (!lessonId) continue;
        map.set(lessonId, {
          lessonId,
          lessonTitle: lesson.title,
          lessonSlug: lesson.slug,
          chapterTitle: chapter.title,
          chapterSlug: chapter.slug,
          classTitle,
          classSlug,
          classId,
        });
      }
    }
  }
  return map;
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

  const [membershipsResult, progressResult, bookmarksResult, classTree] = await Promise.all([
    fetchApi<ApiResult<ClassroomMembership>>(
      `/api/classroom-memberships?where[student][equals]=${encodeURIComponent(
        user.id
      )}&depth=2&limit=50`
    ),
    fetchApi<ApiResult<LessonProgressDoc>>(
      `/api/lesson-progress?where[user][equals]=${encodeURIComponent(user.id)}&depth=0&limit=2000&sort=-updatedAt`
    ),
    fetchApi<ApiResult<LessonBookmarkDoc>>(
      `/api/lesson-bookmarks?where[user][equals]=${encodeURIComponent(user.id)}&depth=0&limit=500&sort=-updatedAt`
    ),
    getClassesTree({ revalidate: 0 }).catch(() => []),
  ]);

  const lessonIndex = buildLessonIndex(classTree);

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

  const progressDocs = [...(progressResult?.docs ?? [])].sort(
    (a, b) => toDateSortValue(b.updatedAt) - toDateSortValue(a.updatedAt)
  );
  const completedLessonIds = new Set(
    progressDocs
      .filter((entry) => entry.completed)
      .map((entry) => idOf(entry.lesson))
      .filter(Boolean)
  );
  const completedByClass = new Map<string, Set<string>>();
  for (const entry of progressDocs) {
    if (!entry.completed) continue;
    const classId = idOf(entry.class);
    const lessonId = idOf(entry.lesson);
    if (!classId || !lessonId) continue;
    if (!completedByClass.has(classId)) completedByClass.set(classId, new Set());
    completedByClass.get(classId)?.add(lessonId);
  }

  const classById = new Map<string, ClassDoc>();
  for (const classDoc of classTree) classById.set(String(classDoc.id), classDoc);

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

  const inProgressSeen = new Set<string>();
  const inProgressLessons: InProgressLessonItem[] = [];
  for (const progress of progressDocs) {
    if (progress.completed) continue;
    const lessonId = idOf(progress.lesson);
    if (!lessonId || completedLessonIds.has(lessonId) || inProgressSeen.has(lessonId)) continue;
    const lesson = lessonIndex.get(lessonId);
    if (!lesson) continue;
    inProgressSeen.add(lessonId);
    inProgressLessons.push({
      id: lesson.lessonId,
      title: lesson.lessonTitle,
      subtitle: `${lesson.classTitle} · ${lesson.chapterTitle}`,
      href: lessonHref(lesson),
      updatedAt: progress.updatedAt,
    });
    if (inProgressLessons.length >= 6) break;
  }

  const savedSeen = new Set<string>();
  const savedLessons: SavedLessonItem[] = [];
  for (const bookmark of bookmarksResult?.docs ?? []) {
    const lessonId = idOf(bookmark.lesson);
    if (!lessonId || completedLessonIds.has(lessonId) || savedSeen.has(lessonId)) continue;
    const lesson = lessonIndex.get(lessonId);
    if (!lesson) continue;
    savedSeen.add(lessonId);
    savedLessons.push({
      id: lesson.lessonId,
      title: lesson.lessonTitle,
      subtitle: `${lesson.classTitle} · ${lesson.chapterTitle}`,
      href: lessonHref(lesson),
      savedAt: bookmark.updatedAt,
    });
    if (savedLessons.length >= 6) break;
  }

  const resumeItem =
    inProgressLessons[0] != null
      ? {
          title: inProgressLessons[0].title,
          subtitle: inProgressLessons[0].subtitle,
          href: inProgressLessons[0].href,
          hint: "Most recently active",
        }
      : savedLessons[0] != null
      ? {
          title: savedLessons[0].title,
          subtitle: savedLessons[0].subtitle,
          href: savedLessons[0].href,
          hint: "From saved lessons",
        }
      : nextLesson
      ? {
          title: nextLesson.lessonTitle,
          subtitle: nextLesson.classTitle,
          href: `/classes/${nextLesson.classSlug}/lessons/${nextLesson.lessonSlug}`,
          hint: "Next in class sequence",
        }
      : null;

  const recommendedActions: RecommendedActionItem[] = [];
  const actionHref = new Set<string>();
  const pushAction = (action: RecommendedActionItem) => {
    if (actionHref.has(action.href)) return;
    actionHref.add(action.href);
    recommendedActions.push(action);
  };

  if (inProgressLessons[0]) {
    pushAction({
      id: `resume-${inProgressLessons[0].id}`,
      label: `Resume ${inProgressLessons[0].title}`,
      href: inProgressLessons[0].href,
      reason: "You have unfinished progress in this lesson.",
    });
  }
  if (savedLessons[0]) {
    pushAction({
      id: `saved-${savedLessons[0].id}`,
      label: `Revisit ${savedLessons[0].title}`,
      href: savedLessons[0].href,
      reason: "This lesson is in your saved list.",
    });
  }
  if (nextLesson) {
    pushAction({
      id: `next-${nextLesson.lessonSlug}`,
      label: `Continue ${nextLesson.classTitle}`,
      href: `/classes/${nextLesson.classSlug}/lessons/${nextLesson.lessonSlug}`,
      reason: "Next incomplete lesson from your active class.",
    });
  }

  return (
    <DashboardShell
      fullName={user.fullName}
      currentStreak={user.currentStreak ?? 0}
      longestStreak={user.longestStreak ?? 0}
      enrollments={enrollments}
      nextLesson={nextLesson}
      resumeItem={resumeItem}
      savedLessons={savedLessons}
      inProgressLessons={inProgressLessons}
      recommendedActions={recommendedActions}
    />
  );
}
