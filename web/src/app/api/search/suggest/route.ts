import { NextResponse } from "next/server";
import {
  chapterHasReadableLessons,
  getClassesTree,
} from "@/lib/payloadSdk/classes";
import { getPages } from "@/lib/payloadSdk/pages";
import type { ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";
import type { SearchResultItem } from "@/components/navigation/global-search/types";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 12;

function tokensOf(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);
}

function scoreText(queryTokens: string[], ...fields: string[]) {
  if (queryTokens.length === 0) return 0;
  const haystack = fields.join(" ").toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (!haystack.includes(token)) return 0;
    if (fields[0]?.toLowerCase().startsWith(token)) score += 8;
    else if (fields[0]?.toLowerCase().includes(token)) score += 5;
    else score += 2;
  }
  return score;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const q = (searchParams.get("q") ?? "").trim();

  try {
    const [classes, pages] = await Promise.all([
      getClassesTree({ revalidate: 60 }).catch(() => []),
      getPages().catch(() => []),
    ]);

    if (mode === "topics") {
      const results: SearchResultItem[] = classes
        .filter((cls) => cls.slug && cls.title)
        .slice(0, 8)
        .map((cls) => ({
          id: `topic:${cls.slug}`,
          title: cls.title as string,
          href: `/classes/${cls.slug}`,
          kind: "topic",
          subtitle: cls.description?.trim() || "Course",
          badge: "Course",
          keywords: [cls.slug as string, cls.title as string],
        }));
      return NextResponse.json({ results });
    }

    if (q.length < 2) {
      return NextResponse.json({ results: [] satisfies SearchResultItem[] });
    }

    const queryTokens = tokensOf(q);
    const ranked: Array<SearchResultItem & { score: number }> = [];

    for (const cls of classes) {
      const classTitle = cls.title?.trim() || "Untitled class";
      const classSlug = cls.slug?.trim();
      if (!classSlug) continue;

      const classScore = scoreText(queryTokens, classTitle, classSlug, cls.description ?? "");
      if (classScore > 0) {
        ranked.push({
          id: `class:${classSlug}`,
          title: classTitle,
          href: `/classes/${classSlug}`,
          kind: "class",
          subtitle: "Course",
          badge: "Course",
          score: classScore + 4,
        });
      }

      const chapters = Array.isArray(cls.chapters)
        ? (cls.chapters as ChapterDoc[]).filter(chapterHasReadableLessons)
        : [];

      for (const chapter of chapters) {
        const chapterTitle = chapter.title?.trim() || "Untitled chapter";
        const chapterSlug = chapter.slug?.trim();
        if (!chapterSlug) continue;

        const chapterScore = scoreText(
          queryTokens,
          chapterTitle,
          chapterSlug,
          classTitle
        );
        if (chapterScore > 0) {
          ranked.push({
            id: `chapter:${classSlug}:${chapterSlug}`,
            title: chapterTitle,
            href: `/classes/${classSlug}/chapters/${chapterSlug}`,
            kind: "chapter",
            subtitle: classTitle,
            badge: "Chapter",
            score: chapterScore + 2,
          });
        }

        const lessons = Array.isArray(chapter.lessons)
          ? (chapter.lessons as LessonDoc[])
          : [];
        for (const lesson of lessons) {
          const lessonTitle = lesson.title?.trim() || "Untitled lesson";
          const lessonSlug = lesson.slug?.trim();
          if (!lessonSlug) continue;
          const lessonScore = scoreText(
            queryTokens,
            lessonTitle,
            lessonSlug,
            chapterTitle,
            classTitle
          );
          if (lessonScore > 0) {
            ranked.push({
              id: `lesson:${classSlug}:${lessonSlug}`,
              title: lessonTitle,
              href: `/classes/${classSlug}/lessons/${lessonSlug}`,
              kind: "lesson",
              subtitle: `${classTitle} · ${chapterTitle}`,
              badge: "Lesson",
              score: lessonScore + 6,
            });
          }
        }
      }
    }

    for (const page of pages) {
      const slug = page.slug?.trim();
      if (!slug || slug === "home" || page.hidden) continue;
      const title = page.title?.trim() || slug;
      const pageScore = scoreText(queryTokens, title, slug);
      if (pageScore > 0) {
        ranked.push({
          id: `page:${slug}`,
          title,
          href: slug === "learning" ? "/learning" : `/${slug}`,
          kind: "page",
          subtitle: "Page",
          badge: "Page",
          score: pageScore,
        });
      }
    }

    if (scoreText(queryTokens, "practice", "problems", "exercises") > 0) {
      ranked.push({
        id: "practice:library",
        title: "Practice problems",
        href: "/practice",
        kind: "practice",
        subtitle: "Interactive exercises",
        badge: "Practice",
        score: 12,
      });
    }

    ranked.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    const results = ranked.slice(0, MAX_RESULTS).map((item) => ({
      id: item.id,
      title: item.title,
      href: item.href,
      kind: item.kind,
      subtitle: item.subtitle,
      badge: item.badge,
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { results: [], error: "Search is temporarily unavailable." },
      { status: 500 }
    );
  }
}
