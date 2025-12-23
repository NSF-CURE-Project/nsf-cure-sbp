import Link from "next/link";
import { draftMode } from "next/headers";

import { getClassesTree } from "@/lib/payloadSdk/classes";
import { getHomePage, type HomePageData } from "@/lib/payloadSdk/home";
import { getResourcesPage, type ResourcesPageData } from "@/lib/payloadSdk/resources";
import { getContactPage, type ContactPageData } from "@/lib/payloadSdk/contacts";
import type {
  ClassDoc,
  ChapterDoc,
  LessonDoc,
  PageLayoutBlock,
  ResourceItem,
  ContactPerson,
} from "@/lib/payloadSdk/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Result = {
  id: string;
  title: string;
  type: "class" | "chapter" | "lesson" | "home" | "resource" | "contact";
  href: string;
  subtitle?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const { isEnabled: isPreview } = await draftMode();
  const sp = (await searchParams) ?? {};
  const rawQ = sp.q;
  const query = Array.isArray(rawQ) ? rawQ[0] : rawQ;
  const term = (query ?? "").trim().toLowerCase();

  const [classes, home, resources, contacts] = term
    ? await Promise.all([
        getClassesTree({ draft: isPreview }),
        getHomePage({ draft: isPreview }).catch(() => null),
        getResourcesPage({ draft: isPreview }).catch(() => null),
        getContactPage({ draft: isPreview }).catch(() => null),
      ])
    : [[], null, null, null];

  const results = term
    ? buildResults(classes, term, { home, resources, contacts })
    : [];

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
        <input
          name="q"
          defaultValue={query ?? ""}
          placeholder="Search titles, chapters, or lessons..."
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Search
        </button>
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
    home: HomePageData | null;
    resources: ResourcesPageData | null;
    contacts: ContactPageData | null;
  },
): Result[] {
  const matches: Result[] = [];

  const includes = (value?: unknown) =>
    typeof value === "string" && value.toLowerCase().includes(term);

  const { home, resources, contacts } = extra;
  const homeBlocks = Array.isArray(home?.layout) ? home.layout : [];
  const resourceBlocks = Array.isArray(resources?.layout) ? resources.layout : [];
  const contactBlocks = Array.isArray(contacts?.layout) ? contacts.layout : [];

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

  if (resources) {
    if (blocksContainTerm(resourceBlocks, term) || includes("resources")) {
      matches.push({
        id: "resources-page",
        title: "Resources",
        type: "resource",
        href: "/resources",
        subtitle: "Page content",
      });
    }

    const resourceItems = extractResourceItems(resourceBlocks);
    for (const item of resourceItems) {
      if (includes(item.title) || includes(item.description) || includes(item.url)) {
        matches.push({
          id: `resource-${item.id ?? item.url ?? item.title}`,
          title: item.title ?? "Resource",
          type: "resource",
          subtitle: item.context ?? "Resources",
          href: item.url ?? "/resources",
        });
      }
    }
  }

  if (contacts) {
    if (blocksContainTerm(contactBlocks, term) || includes("contact")) {
      matches.push({
        id: "contact-page",
        title: "Contact Us",
        type: "contact",
        href: "/contact-us",
        subtitle: "Page content",
      });
    }

    const people: ContactPerson[] = extractContactPeople(contactBlocks);

    for (const person of people) {
      if (
        includes(person.name) ||
        includes(person.title) ||
        includes(person.email) ||
        includes(person.phone) ||
        includes(person.category)
      ) {
        matches.push({
          id: `contact-${person.id ?? person.email ?? person.phone ?? person.name}`,
          title: person.name,
          type: "contact",
          subtitle: person.title || person.category || "Contact",
          href: "/contact-us",
        });
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
      values.push(block.title ?? "", block.subtitle ?? "", block.buttonLabel ?? "");
    }
    if (block.blockType === "sectionTitle") {
      values.push(block.title ?? "", block.subtitle ?? "");
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
  const current = node as { type?: string; text?: string; children?: unknown[] };
  if (current.type === "text") {
    return current.text ?? "";
  }
  const children = Array.isArray(current.children) ? current.children : [];
  return children.map(extractTextFromLexicalNode).join(" ");
}

function extractResourceItems(blocks: PageLayoutBlock[]): (ResourceItem & { context?: string })[] {
  const items: (ResourceItem & { context?: string })[] = [];
  for (const block of blocks) {
    if (block.blockType !== "resourcesList") continue;
    const context = block.title ?? "Resources";
    (block.resources ?? []).forEach((resource) => {
      items.push({ ...resource, context });
    });
  }
  return items;
}

function extractContactPeople(blocks: PageLayoutBlock[]): ContactPerson[] {
  const people: ContactPerson[] = [];
  for (const block of blocks) {
    if (block.blockType !== "contactsList") continue;
    (block.contacts ?? []).forEach((person) => {
      people.push(person);
    });
  }
  return people;
}
