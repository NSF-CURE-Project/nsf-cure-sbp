import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SavedLessonsShell } from "@/components/dashboard/SavedLessonsShell";

type AccountUser = { id: string };

type BookmarkDoc = {
  id: string | number;
  createdAt?: string | null;
  lesson?: { title?: string | null; slug?: string | null } | string | number | null;
  chapter?: { title?: string | null } | string | number | null;
  class?: { title?: string | null; slug?: string | null } | string | number | null;
};

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

export default async function SavedLessonsPage() {
  const base = await buildBaseUrl();
  if (!base) redirect("/login?next=/saved-lessons");

  const meRes = await fetch(`${base.base}/api/accounts/me`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!meRes.ok) redirect("/login?next=/saved-lessons");

  const me = (await meRes.json()) as { user?: AccountUser };
  const userId = me.user?.id;
  if (!userId) redirect("/login?next=/saved-lessons");

  const params = new URLSearchParams({ depth: "2", sort: "-createdAt", limit: "100" });
  params.set("where[user][equals]", userId);

  const bookmarksRes = await fetch(
    `${base.base}/api/lesson-bookmarks?${params.toString()}`,
    {
      headers: base.cookie ? { cookie: base.cookie } : undefined,
      cache: "no-store",
    }
  );
  if (!bookmarksRes.ok) throw new Error("Unable to load saved lessons.");

  const payload = (await bookmarksRes.json()) as { docs?: BookmarkDoc[] };
  type GroupedItem = {
    id: string;
    title: string;
    className: string;
    chapterName: string;
    href: string;
    bookmarkedAt: string | null;
  };
  const groupedMap = new Map<
    string,
    { className: string; items: GroupedItem[] }
  >();

  for (const bookmark of payload.docs ?? []) {
    const classValue =
      typeof bookmark.class === "object" && bookmark.class !== null ? bookmark.class : null;
    const lessonValue =
      typeof bookmark.lesson === "object" && bookmark.lesson !== null ? bookmark.lesson : null;
    const chapterValue =
      typeof bookmark.chapter === "object" && bookmark.chapter !== null ? bookmark.chapter : null;

    const className = classValue?.title ?? "Saved lessons";
    const classSlug = classValue?.slug ?? "";
    const lessonSlug = lessonValue?.slug ?? "";
    const href =
      classSlug && lessonSlug
        ? `/classes/${classSlug}/lessons/${lessonSlug}`
        : "/learning";

    if (!groupedMap.has(className)) {
      groupedMap.set(className, { className, items: [] });
    }

    groupedMap.get(className)?.items.push({
      id: String(bookmark.id),
      title: lessonValue?.title ?? "Untitled lesson",
      className,
      chapterName: chapterValue?.title ?? "Chapter",
      href,
      bookmarkedAt: bookmark.createdAt ?? null,
    });
  }

  return <SavedLessonsShell groupedLessons={[...groupedMap.values()]} />;
}
