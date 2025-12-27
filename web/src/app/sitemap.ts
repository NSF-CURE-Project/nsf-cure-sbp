import type { MetadataRoute } from "next";
import { getClassesTree } from "@/lib/payloadSdk/classes";
import { getPages } from "@/lib/payloadSdk/pages";
import type { ChapterDoc, ClassDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { siteUrl } from "@/lib/seo";

type ChapterLike = ChapterDoc & { lessons?: LessonDoc[] };

const staticRoutes = [
  "/",
  "/directory",
  "/search",
  "/resources",
  "/contact-us",
  "/contacts",
  "/getting-started",
];

const isChapterDoc = (value: ChapterDoc | string): value is ChapterDoc =>
  typeof value === "object" && value !== null && "slug" in value;

const isLessonDoc = (value: LessonDoc | string): value is LessonDoc =>
  typeof value === "object" && value !== null && "slug" in value;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = await getPages().catch(() => []);
  const classes = await getClassesTree().catch(() => []);

  const pageUrls = pages
    .filter((page) => page.slug && page.slug !== "home")
    .map((page) => ({
      url: `${siteUrl}/${page.slug === "home" ? "" : page.slug}`,
      lastModified: now,
    }));

  const classUrls = classes.flatMap((cls: ClassDoc) => {
    const classSlug = cls.slug ? String(cls.slug) : "";
    if (!classSlug) return [];
    const chapterList = Array.isArray(cls.chapters)
      ? (cls.chapters as ChapterDoc[])
      : [];
    const chapters = chapterList.filter(isChapterDoc) as ChapterLike[];

    const chapterUrls = chapters
      .filter((chapter) => chapter.slug)
      .map((chapter) => ({
        url: `${siteUrl}/classes/${classSlug}/chapters/${chapter.slug}`,
        lastModified: now,
      }));

    const lessonUrls = chapters.flatMap((chapter) => {
      const lessons = (chapter.lessons ?? []).filter(isLessonDoc);
      return lessons
        .filter((lesson) => lesson.slug)
        .map((lesson) => ({
          url: `${siteUrl}/classes/${classSlug}/lessons/${lesson.slug}`,
          lastModified: now,
        }));
    });

    return [
      {
        url: `${siteUrl}/classes/${classSlug}`,
        lastModified: now,
      },
      ...chapterUrls,
      ...lessonUrls,
    ];
  });

  const staticUrls = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
  }));

  return [...staticUrls, ...pageUrls, ...classUrls];
}
