import Link from "next/link";
import { draftMode } from "next/headers";

import { getClassesTree } from "@/lib/payloadSdk/classes";
import { getHomePage, type HomePageData } from "@/lib/payloadSdk/home";
import {
  getResourcesPage,
  type ResourcesPageData,
  type ResourceItem,
  type ResourceSection,
} from "@/lib/payloadSdk/resources";
import {
  getContactPage,
  type ContactPageData,
  type ContactPerson,
} from "@/lib/payloadSdk/contacts";
import type {
  ClassDoc,
  ChapterDoc,
  LessonDoc,
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

  if (
    home &&
    (includes(home.heroTitle) ||
      includes(home.heroSubtitle) ||
      includes(home.purposeTitle) ||
      includes(home.goalsTitle) ||
      includes(home.gettingStartedTitle))
  ) {
    matches.push({
      id: "home",
      title: home.heroTitle || "Home",
      type: "home",
      href: "/",
      subtitle: "Hero and intro content",
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
        if (includes(l.title) || includes(l.slug) || includes(l.textContent)) {
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
    if (
      includes(resources.heroTitle) ||
      includes("resources") ||
      includes(resources.heroIntro)
    ) {
      matches.push({
        id: "resources-page",
        title: resources.heroTitle || "Resources",
        type: "resource",
        href: "/resources",
        subtitle: "Full resources page",
      });
    }

    const sections: ResourceSection[] = Array.isArray(resources.sections)
      ? resources.sections
      : [];

    for (const section of sections) {
      const sectionTitle = section.title ?? "Resources";
      const resourcesList: ResourceItem[] = Array.isArray(section.resources)
        ? section.resources
        : [];

      for (const item of resourcesList) {
        if (includes(item.title) || includes(item.description) || includes(item.url)) {
          matches.push({
            id: `resource-${section.id ?? sectionTitle}-${item.id ?? item.url}`,
            title: item.title,
            type: "resource",
            subtitle: sectionTitle,
            href: item.url,
          });
        }
      }
    }
  }

  if (contacts) {
    if (
      includes(contacts.heroTitle) ||
      includes("contact") ||
      includes(contacts.heroIntro)
    ) {
      matches.push({
        id: "contact-page",
        title: contacts.heroTitle || "Contact Us",
        type: "contact",
        href: "/contact-us",
        subtitle: "Full contact page",
      });
    }

    const people: ContactPerson[] = Array.isArray(contacts.contacts)
      ? contacts.contacts
      : [];

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
