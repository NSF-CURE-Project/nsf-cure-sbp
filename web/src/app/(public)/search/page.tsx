import Link from "next/link";
import type { ReactNode } from "react";
import { getClassesTree } from "@/lib/payloadSdk/classes";
import { getPages } from "@/lib/payloadSdk/pages";
import type {
  ClassDoc,
  ChapterDoc,
  LessonDoc,
  PageLayoutBlock,
  QuizDoc,
} from "@/lib/payloadSdk/types";
import { Search } from "lucide-react";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = buildMetadata({
  title: "Search",
  description: "Search classes, chapters, lessons, and pages.",
  path: "/search",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ResultType = "class" | "chapter" | "lesson" | "page" | "home";

type Result = {
  id: string;
  title: string;
  type: ResultType;
  href: string;
  slug?: string;
  classSlug?: string;
  chapterKey?: string;
  subtitle?: string;
  tags: string[];
  searchText: string;
  snippetText: string;
  sortOrder: number;
};

type RankedResult = Result & {
  score: number;
};

type SelectOption = {
  value: string;
  label: string;
  count?: number;
  classSlug?: string;
};

const TYPE_OPTIONS: { value: ResultType; label: string }[] = [
  { value: "lesson", label: "Lessons" },
  { value: "chapter", label: "Chapters" },
  { value: "class", label: "Classes" },
  { value: "page", label: "Pages" },
  { value: "home", label: "Home" },
];

const TYPE_BADGE_LABEL: Record<ResultType, string> = {
  lesson: "Lesson",
  chapter: "Chapter",
  class: "Class",
  page: "Page",
  home: "Home",
};

const TYPE_WEIGHT: Record<ResultType, number> = {
  lesson: 8,
  chapter: 6,
  class: 5,
  page: 4,
  home: 3,
};

const STOP_WORDS = new Set([
  "about",
  "after",
  "all",
  "and",
  "are",
  "class",
  "content",
  "course",
  "for",
  "from",
  "home",
  "into",
  "lesson",
  "lessons",
  "module",
  "page",
  "pages",
  "that",
  "the",
  "their",
  "this",
  "with",
  "your",
]);

const selectClassName =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border/60 bg-card/70 h-11 w-full min-w-0 rounded-xl border px-3.5 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-[color,box-shadow,background-color,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-muted/30 dark:border-border/70 dark:shadow-black/20 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20";

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);
  const query = readSearchParam(sp.q);
  const rawTypes = readSearchParams(sp.type);
  const rawClass = readSearchParam(sp.class);
  const rawChapter = readSearchParam(sp.chapter);
  const rawTags = readSearchParams(sp.tag);
  const term = normalizeText(query ?? "");

  const [classes, pages] = await Promise.all([
    getClassesTree({ draft: isPreview }).catch(() => []),
    getPages({ draft: isPreview }).catch(() => []),
  ]);

  const context = buildResults(classes, pages);

  const selectedTypes = resolveTypeFilters(rawTypes);
  const selectedClass = resolveFilterValue(rawClass, context.classOptions);
  const selectedChapter = resolveFilterValue(rawChapter, context.chapterOptions);
  const selectedTags = resolveTagFilters(rawTags, context.tagOptions);

  const normalizedChapter = ensureChapterForClass(
    selectedChapter,
    selectedClass,
    context.chapterOptions
  );

  const hasFilters =
    selectedTypes.length > 0 ||
    selectedClass !== "all" ||
    normalizedChapter !== "all" ||
    selectedTags.length > 0;
  const hasSearchIntent = Boolean(term) || hasFilters;
  const activeChapterOptions =
    selectedClass === "all"
      ? context.chapterOptions
      : context.chapterOptions.filter((option) => option.classSlug === selectedClass);
  const visibleTagOptions = uniqueOptionsByValue([
    ...context.tagOptions.filter((option) => selectedTags.includes(option.value)),
    ...context.tagOptions.slice(0, 24),
  ]);

  const rankedResults = hasSearchIntent
    ? rankAndFilterResults(context.items, {
        term,
        types: selectedTypes,
        classSlug: selectedClass,
        chapterKey: normalizedChapter,
        tags: selectedTags,
      })
    : [];

  const suggestions = buildSuggestions({
    term,
    items: context.items,
    tagOptions: context.tagOptions,
  });

  const highlightTokens = unique(splitTokens(query ?? ""));

  const buildSearchHref = (
    overrides: Partial<{
      q: string;
      types: ResultType[];
      class: string;
      chapter: string;
      tags: string[];
    }>
  ) => {
    const params = new URLSearchParams();
    const nextQ = (overrides.q ?? query ?? "").trim();
    const nextTypes = unique(overrides.types ?? selectedTypes);
    const nextClass = overrides.class ?? selectedClass;
    const nextChapter = overrides.chapter ?? normalizedChapter;
    const nextTags = unique(overrides.tags ?? selectedTags);

    if (nextQ) params.set("q", nextQ);
    nextTypes.forEach((type) => params.append("type", type));
    if (nextClass !== "all") params.set("class", nextClass);
    if (nextChapter !== "all") params.set("chapter", nextChapter);
    nextTags.forEach((tag) => params.append("tag", tag));

    const queryString = params.toString();
    return queryString ? `/search?${queryString}` : "/search";
  };

  const selectedClassOption = context.classOptions.find(
    (option) => option.value === selectedClass
  );
  const selectedChapterOption = context.chapterOptions.find(
    (option) => option.value === normalizedChapter
  );
  const selectedTypeOptions = TYPE_OPTIONS.filter((option) =>
    selectedTypes.includes(option.value)
  );
  const selectedTagOptions = context.tagOptions.filter((option) =>
    selectedTags.includes(option.value)
  );
  const primaryTagOptions = visibleTagOptions.slice(0, 8);
  const extraTagOptions = visibleTagOptions.slice(8);
  const showMoreTagsByDefault = selectedTags.some((tag) =>
    extraTagOptions.some((option) => option.value === tag)
  );
  const trimmedQuery = query?.trim() ?? "";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.1em] text-muted-foreground">
            Search
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Find content
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Search across classes, chapters, lessons, and pages with smart
            ranking and filters.
          </p>
        </header>

        <section className="rounded-2xl border border-border/70 bg-gradient-to-b from-muted/25 to-background/50 p-4 shadow-sm sm:p-5">
          <form role="search" action="/search" className="space-y-7">
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={query ?? ""}
                  placeholder="Search titles, topics, or lesson content..."
                  className="h-[3.25rem] rounded-xl border-border/70 bg-background/55 pl-12 pr-4 text-[17px] placeholder:text-muted-foreground/80"
                />
              </div>
              {hasSearchIntent ? (
                <div className="flex justify-end">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/search">Clear</Link>
                  </Button>
                </div>
              ) : null}
              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                    Query suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <Link
                        key={suggestion}
                        href={buildSearchHref({ q: suggestion })}
                        className="rounded-full border border-border/70 bg-muted/20 px-3 py-1.5 text-sm text-foreground transition hover:border-primary/60 hover:bg-primary/10"
                      >
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-5 border-t border-border/50 pt-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="search-class"
                    className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground"
                  >
                    Class
                  </label>
                  <select
                    id="search-class"
                    name="class"
                    defaultValue={selectedClass}
                    className={selectClassName}
                    aria-label="Filter by class"
                  >
                    <option value="all">All classes</option>
                    {context.classOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="search-chapter"
                    className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground"
                  >
                    Chapter
                  </label>
                  <select
                    id="search-chapter"
                    name="chapter"
                    defaultValue={normalizedChapter}
                    className={selectClassName}
                    aria-label="Filter by chapter"
                  >
                    <option value="all">All chapters</option>
                    {activeChapterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                  Content type
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TYPE_OPTIONS.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="type"
                        value={option.value}
                        defaultChecked={selectedTypes.includes(option.value)}
                        className="peer sr-only"
                      />
                      <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-sm text-muted-foreground transition peer-checked:border-primary/55 peer-checked:bg-primary/15 peer-checked:text-foreground hover:border-border/90">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {visibleTagOptions.length > 0 ? (
                <details
                  className="rounded-xl border border-border/55 bg-background/25 p-4"
                  open={selectedTags.length > 0 || showMoreTagsByDefault}
                >
                  <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground transition hover:text-foreground [&::-webkit-details-marker]:hidden">
                    More filters
                  </summary>
                  <fieldset className="mt-4">
                    <legend className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                      Tags
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {primaryTagOptions.map((option) => (
                        <label key={option.value} className="cursor-pointer">
                          <input
                            type="checkbox"
                            name="tag"
                            value={option.value}
                            defaultChecked={selectedTags.includes(option.value)}
                            className="peer sr-only"
                          />
                          <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-sm text-muted-foreground transition peer-checked:border-primary/55 peer-checked:bg-primary/15 peer-checked:text-foreground hover:border-border/90">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {extraTagOptions.length > 0 ? (
                      <details className="mt-3" open={showMoreTagsByDefault}>
                        <summary className="cursor-pointer text-xs font-semibold text-muted-foreground transition hover:text-foreground">
                          + more ({extraTagOptions.length})
                        </summary>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {extraTagOptions.map((option) => (
                            <label key={option.value} className="cursor-pointer">
                              <input
                                type="checkbox"
                                name="tag"
                                value={option.value}
                                defaultChecked={selectedTags.includes(option.value)}
                                className="peer sr-only"
                              />
                              <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-sm text-muted-foreground transition peer-checked:border-primary/55 peer-checked:bg-primary/15 peer-checked:text-foreground hover:border-border/90">
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </fieldset>
                </details>
              ) : null}
            </div>
          </form>

          {hasFilters ? (
            <div className="mt-6 border-t border-border/50 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                Active filters
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedClassOption ? (
                  <Link
                    href={buildSearchHref({ class: "all", chapter: "all" })}
                    className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-foreground transition hover:border-primary/60"
                  >
                    Class: {selectedClassOption.label} ×
                  </Link>
                ) : null}
                {selectedChapterOption ? (
                  <Link
                    href={buildSearchHref({ chapter: "all" })}
                    className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-foreground transition hover:border-primary/60"
                  >
                    Chapter: {selectedChapterOption.label} ×
                  </Link>
                ) : null}
                {selectedTypeOptions.map((option) => (
                  <Link
                    key={`type-${option.value}`}
                    href={buildSearchHref({
                      types: selectedTypes.filter((type) => type !== option.value),
                    })}
                    className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-foreground transition hover:border-primary/60"
                  >
                    Type: {option.label} ×
                  </Link>
                ))}
                {selectedTagOptions.map((option) => (
                  <Link
                    key={`tag-${option.value}`}
                    href={buildSearchHref({
                      tags: selectedTags.filter((tag) => tag !== option.value),
                    })}
                    className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-foreground transition hover:border-primary/60"
                  >
                    Tag: {option.label} ×
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {!hasSearchIntent ? (
          <div className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-muted-foreground">
            Enter a query or apply filters to find matching content.
          </div>
        ) : rankedResults.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-muted-foreground">
            <p>
              No results for{" "}
              <span className="font-semibold text-foreground">
                {trimmedQuery || "your filters"}
              </span>
              .
            </p>
            {suggestions.length > 0 ? (
              <p className="mt-1 text-sm">
                Try one of the suggestions above or clear a filter.
              </p>
            ) : null}
          </div>
        ) : (
          <section className="space-y-5">
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                <span className="text-lg">{rankedResults.length}</span> result
                {rankedResults.length === 1 ? "" : "s"}
                {trimmedQuery ? (
                  <>
                    {" "}
                    for{" "}
                    <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-primary">
                      "{trimmedQuery}"
                    </span>
                  </>
                ) : null}
              </p>
            </div>
            <ul className="space-y-4">
              {rankedResults.map((item) => {
                const snippet = buildResultSnippet(item, query ?? "", highlightTokens);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="group block rounded-xl border border-border/80 bg-muted/25 px-4 py-4 shadow-sm transition hover:border-primary/50 hover:bg-muted/35 hover:shadow-md sm:px-5"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                          {TYPE_BADGE_LABEL[item.type]}
                        </span>
                        {item.subtitle ? <span className="truncate">{item.subtitle}</span> : null}
                      </div>
                      <p className="mt-2 text-lg font-semibold text-foreground transition group-hover:text-foreground/90">
                        {highlightText(item.title, highlightTokens)}
                      </p>
                      {snippet ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {highlightText(snippet, highlightTokens)}
                        </p>
                      ) : null}
                      {item.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags.slice(0, 4).map((tag) => (
                            <span
                              key={`${item.id}-${tag}`}
                              className="rounded-full border border-border/60 bg-background/35 px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              #{formatTagLabel(tag)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

function buildResults(
  classes: ClassDoc[],
  pages: { title: string; slug: string; layout?: PageLayoutBlock[] | null }[]
) {
  const items: Result[] = [];
  const classOptions: SelectOption[] = [];
  const chapterOptions: SelectOption[] = [];
  const tagCounts = new Map<string, number>();
  let sortOrder = 0;

  const pushItem = (item: Omit<Result, "sortOrder">) => {
    const normalizedTags = unique(item.tags.map(normalizeTag).filter(Boolean));
    normalizedTags.forEach((tag) =>
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    );
    items.push({
      ...item,
      tags: normalizedTags,
      sortOrder,
    });
    sortOrder += 1;
  };

  for (const cls of classes) {
    const classTitle = cls.title ?? "Untitled class";
    const classSlug = cls.slug ?? "";
    if (!classSlug) continue;

    classOptions.push({
      value: classSlug,
      label: classTitle,
    });

    pushItem({
      id: `class-${String(cls.id ?? classSlug)}`,
      title: classTitle,
      type: "class",
      slug: classSlug,
      href: `/classes/${classSlug}`,
      classSlug,
      tags: deriveTags({
        title: classTitle,
        subtitle: cls.description ?? "",
        explicit: ["class"],
      }),
      searchText: [classTitle, cls.description ?? "", classSlug].join(" "),
      snippetText: cls.description ?? classTitle,
    });

    const chapters: ChapterDoc[] = Array.isArray(cls.chapters)
      ? (cls.chapters as ChapterDoc[])
      : [];

    for (const chapter of chapters) {
      const chapterTitle = chapter.title ?? "Untitled chapter";
      const chapterSlug = chapter.slug ?? "";
      if (!chapterSlug) continue;

      const chapterKey = makeChapterKey(classSlug, chapterSlug);
      const chapterBody = extractTextFromRichText(chapter.objective);

      chapterOptions.push({
        value: chapterKey,
        label: `${classTitle} • ${chapterTitle}`,
        classSlug,
      });

      pushItem({
        id: `chapter-${String(cls.id ?? classSlug)}-${String(
          chapter.id ?? chapterSlug
        )}`,
        title: chapterTitle,
        type: "chapter",
        slug: chapterSlug,
        href: `/classes/${classSlug}/chapters/${chapterSlug}`,
        classSlug,
        chapterKey,
        subtitle: classTitle,
        tags: deriveTags({
          title: chapterTitle,
          subtitle: classTitle,
          explicit: ["chapter"],
        }),
        searchText: [
          chapterTitle,
          chapterSlug,
          classTitle,
          chapterBody,
        ].join(" "),
        snippetText: chapterBody || `${classTitle} ${chapterTitle}`,
      });

      const lessons: LessonDoc[] = Array.isArray(chapter.lessons)
        ? (chapter.lessons as LessonDoc[])
        : [];

      for (const lesson of lessons) {
        const lessonTitle = lesson.title ?? "Untitled lesson";
        const lessonSlug = lesson.slug ?? "";
        if (!lessonSlug) continue;

        const lessonBlocks = Array.isArray(lesson.layout) ? lesson.layout : [];
        const lessonBlockText = extractTextFromBlocks(lessonBlocks).join(" ");
        const lessonExplicitTags = [
          ...extractExplicitTagsFromBlocks(lessonBlocks),
          ...extractAssessmentTags(lesson),
        ];

        pushItem({
          id: `lesson-${String(cls.id ?? classSlug)}-${String(
            chapter.id ?? chapterSlug
          )}-${String(lesson.id ?? lessonSlug)}`,
          title: lessonTitle,
          type: "lesson",
          slug: lessonSlug,
          href: `/classes/${classSlug}/lessons/${lessonSlug}`,
          classSlug,
          chapterKey,
          subtitle: `${classTitle} • ${chapterTitle}`,
          tags: deriveTags({
            title: lessonTitle,
            subtitle: `${classTitle} ${chapterTitle}`,
            explicit: ["lesson", ...lessonExplicitTags],
          }),
          searchText: [
            lessonTitle,
            lessonSlug,
            classTitle,
            chapterTitle,
            lessonBlockText,
          ].join(" "),
          snippetText: lessonBlockText || `${classTitle} ${chapterTitle} ${lessonTitle}`,
        });
      }
    }
  }

  for (const page of pages) {
    const pageSlug = page.slug ?? "";
    if (!pageSlug) continue;

    const pageTitle = page.title ?? "Untitled page";
    const pageBlocks = Array.isArray(page.layout) ? page.layout : [];
    const pageBlockText = extractTextFromBlocks(pageBlocks).join(" ");
    const pageType: ResultType = pageSlug === "home" ? "home" : "page";
    const pageHref = pageSlug === "home" ? "/" : `/${pageSlug}`;

    pushItem({
      id: `${pageType}-${pageSlug}`,
      title: pageTitle,
      type: pageType,
      slug: pageSlug,
      href: pageHref,
      subtitle: pageType === "home" ? "Homepage content" : "Page content",
      tags: deriveTags({
        title: pageTitle,
        subtitle: pageSlug,
        explicit: [pageType, ...extractExplicitTagsFromBlocks(pageBlocks)],
      }),
      searchText: [pageTitle, pageSlug, pageBlockText].join(" "),
      snippetText: pageBlockText || pageTitle,
    });
  }

  const tagOptions: SelectOption[] = [...tagCounts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, 80)
    .map(([value, count]) => ({
      value,
      label: formatTagLabel(value),
      count,
    }));

  return {
    items,
    classOptions: classOptions.sort((a, b) => a.label.localeCompare(b.label)),
    chapterOptions: chapterOptions.sort((a, b) => a.label.localeCompare(b.label)),
    tagOptions,
  };
}

function rankAndFilterResults(
  items: Result[],
  filters: {
    term: string;
    types: ResultType[];
    classSlug: string;
    chapterKey: string;
    tags: string[];
  }
): RankedResult[] {
  const tokens = unique(splitTokens(filters.term));
  const hasQuery = tokens.length > 0;

  return items
    .filter((item) => {
      if (filters.types.length > 0 && !filters.types.includes(item.type)) return false;
      if (filters.classSlug !== "all") {
        if (item.type === "class") {
          if (item.classSlug !== filters.classSlug && item.slug !== filters.classSlug) {
            return false;
          }
        } else if (item.classSlug !== filters.classSlug) {
          return false;
        }
      }
      if (filters.chapterKey !== "all" && item.chapterKey !== filters.chapterKey) {
        return false;
      }
      if (filters.tags.length > 0) {
        const hasAnyTag = filters.tags.some((tag) => item.tags.includes(tag));
        if (!hasAnyTag) return false;
      }
      return true;
    })
    .map((item) => {
      const score = hasQuery ? scoreResult(item, filters.term, tokens) : 0;
      return {
        ...item,
        score,
      };
    })
    .filter((item) => !hasQuery || item.score > 0)
    .sort((a, b) => {
      if (hasQuery && b.score !== a.score) return b.score - a.score;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.title.localeCompare(b.title);
    });
}

function scoreResult(item: Result, term: string, tokens: string[]): number {
  const title = normalizeText(item.title);
  const subtitle = normalizeText(item.subtitle ?? "");
  const slug = normalizeText(item.slug ?? "");
  const body = normalizeText(item.searchText);
  const tags = new Set(item.tags.map(normalizeTag));
  let score = 0;

  if (title === term) score += 220;
  else if (title.startsWith(term)) score += 150;
  else if (title.includes(term)) score += 90;

  if (slug === term) score += 120;
  else if (slug.startsWith(term)) score += 80;
  else if (slug.includes(term)) score += 40;

  if (subtitle.includes(term)) score += 35;
  if (body.includes(term)) score += 20;

  let matchedTokens = 0;
  tokens.forEach((token) => {
    let matched = false;

    if (containsWord(title, token)) {
      score += 30;
      matched = true;
    } else if (title.includes(token)) {
      score += 20;
      matched = true;
    }

    if (containsWord(slug, token)) {
      score += 18;
      matched = true;
    } else if (slug.includes(token)) {
      score += 10;
      matched = true;
    }

    if (subtitle.includes(token)) {
      score += 12;
      matched = true;
    }

    if (body.includes(token)) {
      score += 8;
      matched = true;
    }

    if (tags.has(token)) {
      score += 24;
      matched = true;
    }

    if (matched) matchedTokens += 1;
  });

  if (tokens.length > 0 && matchedTokens === tokens.length) score += 30;

  score += TYPE_WEIGHT[item.type] ?? 0;
  return score;
}

function buildSuggestions({
  term,
  items,
  tagOptions,
}: {
  term: string;
  items: Result[];
  tagOptions: SelectOption[];
}): string[] {
  const limit = 8;
  const phraseMap = new Map<string, string>();
  const wordMap = new Map<string, string>();

  items.forEach((item) => {
    const title = item.title.trim();
    const normalizedTitle = normalizeText(title);
    if (normalizedTitle) phraseMap.set(normalizedTitle, title);
    item.tags.forEach((tag) => {
      const normalizedTag = normalizeTag(tag);
      if (normalizedTag) {
        phraseMap.set(normalizedTag, formatTagLabel(normalizedTag));
        wordMap.set(normalizedTag, formatTagLabel(normalizedTag));
      }
    });
    splitTokens(item.title).forEach((token) => {
      if (token.length >= 3) {
        wordMap.set(token, formatTagLabel(token));
      }
    });
  });

  if (!term) {
    return tagOptions.slice(0, limit).map((option) => option.label);
  }

  const suggestions: string[] = [];
  const seen = new Set<string>();

  const direct = [...phraseMap.entries()]
    .filter(([normalized]) => normalized.includes(term) && normalized !== term)
    .sort((a, b) => {
      const aStarts = a[0].startsWith(term) ? 0 : 1;
      const bStarts = b[0].startsWith(term) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a[0].length - b[0].length;
    });

  for (const [, label] of direct) {
    const key = normalizeText(label);
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(label);
    if (suggestions.length >= limit) return suggestions;
  }

  if (splitTokens(term).length === 1) {
    const fuzzy = [...wordMap.entries()]
      .map(([normalized, label]) => ({
        label,
        normalized,
        distance: levenshtein(term, normalized),
      }))
      .filter((item) => {
        const lengthGap = Math.abs(item.normalized.length - term.length);
        return lengthGap <= 3 && item.distance <= 2 && item.normalized !== term;
      })
      .sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return a.normalized.length - b.normalized.length;
      });

    for (const item of fuzzy) {
      const key = normalizeText(item.label);
      if (seen.has(key)) continue;
      seen.add(key);
      suggestions.push(item.label);
      if (suggestions.length >= limit) return suggestions;
    }
  }

  return suggestions;
}

function buildResultSnippet(item: Result, query: string, tokens: string[]): string {
  const source = (item.snippetText || item.searchText || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!source) return "";

  const searchTerms = unique([...splitTokens(query), ...tokens]);
  if (searchTerms.length === 0) return truncateText(source, 180);

  const lowerSource = source.toLowerCase();
  let matchIndex = -1;
  let matchedTerm = "";

  const sortedTerms = [...searchTerms].sort((a, b) => b.length - a.length);
  for (const term of sortedTerms) {
    const idx = lowerSource.indexOf(term.toLowerCase());
    if (idx >= 0 && (matchIndex === -1 || idx < matchIndex)) {
      matchIndex = idx;
      matchedTerm = term;
    }
  }

  if (matchIndex === -1) return truncateText(source, 180);

  const start = Math.max(0, matchIndex - 60);
  const end = Math.min(source.length, matchIndex + matchedTerm.length + 120);

  let snippet = source.slice(start, end).trim();
  if (start > 0) snippet = `...${snippet}`;
  if (end < source.length) snippet = `${snippet}...`;

  return snippet;
}

function highlightText(text: string, tokens: string[]): ReactNode {
  const normalizedTokens = unique(
    tokens.map((token) => token.toLowerCase()).filter((token) => token.length > 1)
  );
  if (!text || normalizedTokens.length === 0) return text;

  const pattern = normalizedTokens
    .sort((a, b) => b.length - a.length)
    .map((token) => escapeRegex(token))
    .join("|");
  if (!pattern) return text;

  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (normalizedTokens.includes(part.toLowerCase())) {
      return (
        <mark
          key={`mark-${index}`}
          className="rounded-sm bg-primary/20 px-0.5 text-foreground"
        >
          {part}
        </mark>
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
}

function deriveTags({
  title,
  subtitle,
  explicit,
}: {
  title: string;
  subtitle?: string;
  explicit?: string[];
}): string[] {
  const tags = new Set<string>();

  (explicit ?? []).forEach((tag) => {
    const normalized = normalizeTag(tag);
    if (normalized) tags.add(normalized);
  });

  extractKeywordTags([title, subtitle ?? ""], 5).forEach((token) => tags.add(token));
  return [...tags];
}

function extractExplicitTagsFromBlocks(blocks: PageLayoutBlock[]): string[] {
  const tags: string[] = [];

  blocks.forEach((block) => {
    if (block.blockType === "resourcesList") {
      (block.resources ?? []).forEach((resource) => {
        if (resource.type) tags.push(resource.type);
      });
    }
    if (block.blockType === "contactsList") {
      (block.contacts ?? []).forEach((contact) => {
        if (contact.category) tags.push(contact.category);
      });
    }
    if (block.blockType === "videoBlock") {
      tags.push("video");
    }
    if (block.blockType === "quizBlock") {
      tags.push("quiz");
    }
  });

  return tags;
}

function extractAssessmentTags(lesson: LessonDoc): string[] {
  const tags: string[] = [];
  const quizValue = lesson.assessment?.quiz;
  if (typeof quizValue === "object" && quizValue !== null) {
    const quizDoc = quizValue as QuizDoc;
    if (Array.isArray(quizDoc.tags)) {
      quizDoc.tags.forEach((tag) => {
        if (typeof tag === "string") tags.push(tag);
      });
    }
    if (typeof quizDoc.difficulty === "string") tags.push(quizDoc.difficulty);
  }
  return tags;
}

function readSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function readSearchParams(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function resolveTypeFilters(values: string[]): ResultType[] {
  const allowed = new Set(TYPE_OPTIONS.map((option) => option.value));
  return unique(
    values
      .map((value) => value.toLowerCase())
      .filter((value): value is ResultType => allowed.has(value as ResultType))
  );
}

function resolveTagFilters(values: string[], options: SelectOption[]): string[] {
  const allowed = new Set(options.map((option) => option.value));
  return unique(values.filter((value) => allowed.has(value)));
}

function resolveFilterValue(value: string | undefined, options: SelectOption[]): string {
  if (!value) return "all";
  return options.some((option) => option.value === value) ? value : "all";
}

function ensureChapterForClass(
  chapterValue: string,
  classValue: string,
  options: SelectOption[]
): string {
  if (chapterValue === "all") return "all";
  const chapter = options.find((option) => option.value === chapterValue);
  if (!chapter) return "all";
  if (classValue === "all") return chapterValue;
  return chapter.classSlug === classValue ? chapterValue : "all";
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTag(value: string): string {
  return normalizeText(value);
}

function formatTagLabel(tag: string): string {
  return tag
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function splitTokens(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function extractKeywordTags(values: string[], maxCount: number): string[] {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    splitTokens(value).forEach((token) => {
      if (token.length < 3) return;
      if (STOP_WORDS.has(token)) return;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, maxCount)
    .map(([token]) => token);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function uniqueOptionsByValue(options: SelectOption[]): SelectOption[] {
  const seen = new Set<string>();
  const result: SelectOption[] = [];
  options.forEach((option) => {
    if (seen.has(option.value)) return;
    seen.add(option.value);
    result.push(option);
  });
  return result;
}

function makeChapterKey(classSlug: string, chapterSlug: string): string {
  return `${classSlug}::${chapterSlug}`;
}

function containsWord(value: string, token: string): boolean {
  if (!value || !token) return false;
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`);
  return regex.test(value);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, (_, i) => [i]);

  for (let j = 1; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractTextFromBlocks(blocks: PageLayoutBlock[]): string[] {
  const values: string[] = [];

  for (const block of blocks) {
    if (block.blockType === "heroBlock") {
      values.push(
        block.title ?? "",
        block.subtitle ?? "",
        block.buttonLabel ?? ""
      );
    }
    if (block.blockType === "sectionTitle") {
      values.push(block.title ?? "", block.subtitle ?? "");
    }
    if (block.blockType === "sectionBlock") {
      values.push(block.title ?? "", extractTextFromRichText(block.text));
    }
    if (block.blockType === "richTextBlock") {
      values.push(extractTextFromRichText(block.body));
    }
    if (block.blockType === "textBlock") {
      values.push(block.text ?? "");
    }
    if (block.blockType === "videoBlock") {
      values.push(block.caption ?? "", block.url ?? "");
    }
    if (block.blockType === "listBlock") {
      values.push(block.title ?? "");
      (block.items ?? []).forEach((item) => values.push(item.text ?? ""));
    }
    if (block.blockType === "stepsList") {
      values.push(block.title ?? "");
      (block.steps ?? []).forEach((step) => {
        values.push(step.heading ?? "");
        values.push(extractTextFromRichText(step.description));
      });
    }
    if (block.blockType === "buttonBlock") {
      values.push(block.label ?? "", block.href ?? "");
    }
    if (block.blockType === "resourcesList") {
      values.push(block.title ?? "", block.description ?? "");
      (block.resources ?? []).forEach((resource) => {
        values.push(
          resource.title ?? "",
          resource.description ?? "",
          resource.url ?? "",
          resource.type ?? ""
        );
      });
    }
    if (block.blockType === "contactsList") {
      values.push(block.title ?? "", block.description ?? "");
      (block.contacts ?? []).forEach((person) => {
        values.push(
          person.name ?? "",
          person.title ?? "",
          person.email ?? "",
          person.phone ?? "",
          person.category ?? ""
        );
      });
    }
  }

  return values.filter(Boolean);
}

function extractTextFromRichText(value?: unknown): string {
  if (!value || typeof value !== "object") return "";
  const root = value as { root?: { children?: unknown[] } };
  if (!root.root || !Array.isArray(root.root.children)) return "";
  return root.root.children.map(extractTextFromLexicalNode).join(" ").trim();
}

function extractTextFromLexicalNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const current = node as {
    type?: string;
    text?: string;
    children?: unknown[];
  };
  if (current.type === "text") {
    return current.text ?? "";
  }
  const children = Array.isArray(current.children) ? current.children : [];
  return children.map(extractTextFromLexicalNode).join(" ");
}
