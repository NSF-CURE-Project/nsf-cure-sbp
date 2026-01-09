import Link from "next/link";
import { getClassesTree } from "@/lib/payloadSdk/classes";
import { getPageBySlug, type PageDoc } from "@/lib/payloadSdk/pages";
import type {
  ClassDoc,
  ChapterDoc,
  LessonDoc,
  PageLayoutBlock,
} from "@/lib/payloadSdk/types";
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

type Result = {
  id: string;
  title: string;
  type: "class" | "chapter" | "lesson" | "home";
  href: string;
  subtitle?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);
  const rawQ = sp.q;
  const query = Array.isArray(rawQ) ? rawQ[0] : rawQ;
  const term = (query ?? "").trim().toLowerCase();

  const [classes, home] = term
    ? await Promise.all([
        getClassesTree({ draft: isPreview }),
        getPageBySlug("home", { draft: isPreview }).catch(() => null),
      ])
    : [[], null];

  const results = term ? buildResults(classes, term, { home }) : [];

  return (
    <main
      className="mx-auto w-full max-w-[var(--content-max,100ch)] py-10 px-4 sm:px-6 space-y-8"
      style={{ "--content-max": "100%" } as React.CSSProperties}
    >
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.08em] text-muted-foreground">
          Search
        </p>
        <h1 className="text-3xl font-bold leading-tight">Find content</h1>
        <p className="text-muted-foreground">
          Search across classes, chapters, and lessons.
        </p>
      </header>

      <form
        role="search"
        action="/search"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Input
          name="q"
          defaultValue={query ?? ""}
          placeholder="Search titles, chapters, or lessons..."
          className="w-full text-base"
        />
        <Button
          type="submit"
          className="h-11 px-5"
        >
          Search
        </Button>
      </form>

      {!term ? (
        <p className="text-muted-foreground">
          Enter a search term to find matching content.
        </p>
      ) : results.length === 0 ? (
        <p className="text-muted-foreground">
          No results for <span className="font-semibold">{query}</span>.
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"} for{" "}
            <span className="font-semibold text-foreground">{query}</span>
          </p>
          <ul className="space-y-3">
            {results.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="block rounded-lg border border-border/70 bg-muted/20 px-4 py-3 hover:border-primary/60 hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold uppercase tracking-wide">
                      {item.type}
                    </span>
                    {item.subtitle && (
                      <span className="truncate">{item.subtitle}</span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {item.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

function buildResults(
  classes: ClassDoc[],
  term: string,
  extra: {
    home: PageDoc | null;
  }
): Result[] {
  const matches: Result[] = [];

  const includes = (value?: unknown) =>
    typeof value === "string" && value.toLowerCase().includes(term);

  const { home } = extra;
  const homeBlocks = Array.isArray(home?.layout) ? home.layout : [];

  if (home && blocksContainTerm(homeBlocks, term)) {
    matches.push({
      id: "home",
      title: "Home",
      type: "home",
      href: "/",
      subtitle: "Page content",
    });
  }

  for (const c of classes) {
    const classTitle = c.title ?? "Untitled class";
    if (includes(c.title) || includes(c.description) || includes(c.slug)) {
      matches.push({
        id: `class-${c.id ?? c.slug}`,
        title: classTitle,
        type: "class",
        href: `/classes/${c.slug}`,
      });
    }

    const chapters: ChapterDoc[] = Array.isArray(c.chapters)
      ? (c.chapters as ChapterDoc[])
      : [];

    for (const ch of chapters) {
      const chapterTitle = ch.title ?? "Untitled chapter";
      if (includes(ch.title) || includes(ch.slug)) {
        matches.push({
          id: `chapter-${c.id ?? c.slug}-${ch.id ?? ch.slug}`,
          title: chapterTitle,
          type: "chapter",
          subtitle: classTitle,
          href: `/classes/${c.slug}/chapters/${ch.slug}`,
        });
      }

      const lessons: LessonDoc[] = Array.isArray(ch.lessons)
        ? (ch.lessons as LessonDoc[])
        : [];

      for (const l of lessons) {
        const lessonTitle = l.title ?? "Untitled lesson";
        const lessonBlocks = Array.isArray(l.layout) ? l.layout : [];
        if (
          includes(l.title) ||
          includes(l.slug) ||
          blocksContainTerm(lessonBlocks, term)
        ) {
          matches.push({
            id: `lesson-${c.id ?? c.slug}-${ch.id ?? ch.slug}-${
              l.id ?? l.slug
            }`,
            title: lessonTitle,
            type: "lesson",
            subtitle: `${classTitle} • ${chapterTitle}`,
            href: `/classes/${c.slug}/lessons/${l.slug}`,
          });
        }
      }
    }
  }

  return matches;
}

function blocksContainTerm(blocks: PageLayoutBlock[], term: string): boolean {
  const values = extractTextFromBlocks(blocks).filter(Boolean);
  return values.some((value) => value.toLowerCase().includes(term));
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
