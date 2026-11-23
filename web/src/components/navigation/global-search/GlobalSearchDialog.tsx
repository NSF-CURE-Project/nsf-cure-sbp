"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CornerDownLeft,
  FolderOpen,
  GraduationCap,
  Loader2,
  Search,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getRecentSearchItems, recordSearchVisit } from "./searchRecent";
import type { SearchResultItem, SearchSection, SuggestResponse } from "./types";

type GlobalSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const QUICK_ACCESS: SearchResultItem[] = [
  {
    id: "quick:learning",
    title: "Continue learning",
    href: "/learning",
    kind: "quick",
    subtitle: "Pick up where you left off",
    badge: "Learning",
    keywords: ["learn", "courses", "study"],
  },
  {
    id: "quick:practice",
    title: "Practice problems",
    href: "/practice",
    kind: "practice",
    subtitle: "Interactive exercises",
    badge: "Practice",
    keywords: ["practice", "problems", "exercises", "quiz"],
  },
  {
    id: "quick:classes",
    title: "Browse classes",
    href: "/classes",
    kind: "class",
    subtitle: "Explore courses and chapters",
    badge: "Courses",
    keywords: ["classes", "courses", "browse"],
  },
  {
    id: "quick:directory",
    title: "Site directory",
    href: "/directory",
    kind: "page",
    subtitle: "All public pages",
    badge: "Navigation",
    keywords: ["directory", "sitemap", "index"],
  },
];

function iconFor(kind: SearchResultItem["kind"]) {
  switch (kind) {
    case "practice":
      return Calculator;
    case "class":
    case "topic":
      return GraduationCap;
    case "lesson":
    case "chapter":
      return BookOpen;
    case "page":
    case "quick":
      return FolderOpen;
    case "action":
      return Search;
    default:
      return FileText;
  }
}

function matchesQuery(item: SearchResultItem, query: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = [item.title, item.subtitle, item.badge, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-[3px] bg-primary/15 px-0.5 text-foreground">
        {text.slice(index, index + trimmed.length)}
      </mark>
      {text.slice(index + trimmed.length)}
    </>
  );
}

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.25rem] items-center justify-center rounded border border-border/70 bg-muted/50 px-1 py-0.5 text-[10px] font-semibold leading-none text-muted-foreground">
      {children}
    </kbd>
  );
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recent, setRecent] = useState<SearchResultItem[]>([]);
  const [topics, setTopics] = useState<SearchResultItem[]>([]);
  const [remoteResults, setRemoteResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery("");
    setSelectedIndex(0);
    setRemoteResults([]);
    setError(null);
    setRecent(getRecentSearchItems());
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    const controller = new AbortController();
    void fetch("/api/search/suggest?mode=topics", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as SuggestResponse;
        setTopics((data.results ?? []).slice(0, 6));
      })
      .catch(() => undefined);

    return () => {
      cancelAnimationFrame(frame);
      controller.abort();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    const target = returnFocusRef.current;
    if (target && document.contains(target)) {
      target.focus();
    }
  }, [open]);

  useEffect(() => {
    const title = document.title.replace(/\s*[·|].*$/, "").trim() || pathname;
    let kind: SearchResultItem["kind"] | undefined;
    let badge: string | undefined;
    let subtitle: string | undefined;

    if (pathname.startsWith("/practice/")) {
      kind = "practice";
      badge = "Practice";
      subtitle = "Practice problem";
    } else if (/^\/classes\/[^/]+\/lessons\//.test(pathname)) {
      kind = "lesson";
      badge = "Lesson";
    } else if (/^\/classes\/[^/]+\/chapters\//.test(pathname)) {
      kind = "chapter";
      badge = "Chapter";
    } else if (/^\/classes\/[^/]+$/.test(pathname)) {
      kind = "class";
      badge = "Course";
    } else if (pathname === "/practice") {
      kind = "practice";
      badge = "Practice";
    } else if (pathname !== "/") {
      kind = "page";
      badge = "Page";
    }

    if (kind) {
      recordSearchVisit({ href: pathname, title, kind, badge, subtitle });
    }
  }, [pathname]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!open || trimmed.length < 2) {
      setRemoteResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as SuggestResponse;
        if (!res.ok) {
          setRemoteResults([]);
          setError(data.error || "Search is temporarily unavailable.");
          return;
        }
        setRemoteResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setRemoteResults([]);
        setError("Search is temporarily unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query, retryToken]);

  const sections = useMemo<SearchSection[]>(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      const next: SearchSection[] = [
        { id: "quick", label: "Quick access", items: QUICK_ACCESS },
      ];
      if (recent.length) {
        next.push({ id: "recent", label: "Recently visited", items: recent.slice(0, 5) });
      }
      if (topics.length) {
        next.push({ id: "topics", label: "Suggested topics", items: topics });
      }
      return next;
    }

    const localMatches = [...QUICK_ACCESS, ...recent, ...topics].filter((item) =>
      matchesQuery(item, trimmed)
    );
    const seen = new Set(localMatches.map((item) => item.href));
    const remote = remoteResults.filter((item) => !seen.has(item.href));
    const grouped = new Map<string, SearchResultItem[]>();

    const push = (label: string, item: SearchResultItem) => {
      const bucket = grouped.get(label) ?? [];
      bucket.push(item);
      grouped.set(label, bucket);
    };

    for (const item of [...localMatches, ...remote]) {
      if (item.kind === "lesson") push("Lessons", item);
      else if (item.kind === "practice") push("Practice", item);
      else if (item.kind === "class" || item.kind === "topic") push("Courses", item);
      else if (item.kind === "chapter") push("Chapters", item);
      else push("Pages", item);
    }

    const next = [...grouped.entries()].map(([label, items]) => ({
      id: label.toLowerCase(),
      label,
      items,
    }));

    next.push({
      id: "action",
      label: "Search",
      items: [
        {
          id: `action:search:${trimmed}`,
          title: `Search for “${trimmed}”`,
          href: `/search?q=${encodeURIComponent(trimmed)}`,
          kind: "action",
          subtitle: "Open full search results",
          badge: "Search",
        },
      ],
    });

    return next;
  }, [query, recent, remoteResults, topics]);

  const displayedSections = useMemo(() => {
    if (!query.trim()) return sections;
    if (!loading && !error && sections.every((section) => section.id === "action" || section.items.length === 0)) {
      return sections.filter((section) => section.id === "action");
    }
    const hasContent = sections.some(
      (section) => section.id !== "action" && section.items.length > 0
    );
    if (!hasContent && !loading) {
      return sections.filter((section) => section.id === "action");
    }
    return sections;
  }, [error, loading, query, sections]);

  const flatItems = useMemo(
    () => displayedSections.flatMap((section) => section.items),
    [displayedSections]
  );

  const showEmpty =
    Boolean(query.trim()) &&
    !loading &&
    !error &&
    !displayedSections.some((section) => section.id !== "action" && section.items.length > 0);

  useEffect(() => {
    setSelectedIndex((current) => {
      if (flatItems.length === 0) return 0;
      return Math.min(current, flatItems.length - 1);
    });
  }, [flatItems]);

  useEffect(() => {
    if (!open) return;
    const selected = listRef.current?.querySelector<HTMLElement>(
      `[data-search-index="${selectedIndex}"]`
    );
    selected?.scrollIntoView({ block: "nearest" });
  }, [open, selectedIndex]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const navigateTo = useCallback(
    (item: SearchResultItem) => {
      recordSearchVisit({
        href: item.href,
        title: item.title,
        kind: item.kind === "action" ? "page" : item.kind,
        subtitle: item.subtitle,
        badge: item.badge,
      });
      close();
      router.push(item.href);
    },
    [close, router]
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!flatItems.length) return;
      setSelectedIndex((index) => (index + 1) % flatItems.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!flatItems.length) return;
      setSelectedIndex((index) => (index - 1 + flatItems.length) % flatItems.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const selected = flatItems[selectedIndex];
      if (selected) {
        navigateTo(selected);
        return;
      }
      const trimmed = query.trim();
      if (trimmed) {
        close();
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  if (!open) return null;
  if (typeof document === "undefined") return null;

  let runningIndex = -1;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center px-3 pt-[12vh] sm:px-4 sm:pt-[15vh]"
      role="presentation"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/[0.08] dark:bg-black/45"
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative z-10 flex w-full max-w-[40rem] flex-col overflow-hidden rounded-[14px] border border-border/70 bg-background shadow-[0_18px_50px_rgba(15,23,42,0.18)] dark:border-border/60 dark:bg-background dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-150 max-sm:max-h-[min(88dvh,720px)] sm:max-h-[min(72vh,640px)]"
      >
        <div className="flex items-center gap-3 border-b border-border/60 px-3.5 py-3 sm:px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search lessons, topics, and resources..."
            className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/80 sm:text-base"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              flatItems[selectedIndex] ? `${listId}-option-${selectedIndex}` : undefined
            }
            role="combobox"
            aria-expanded="true"
            autoComplete="off"
            spellCheck={false}
          />
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
          ) : (
            <button
              type="button"
              onClick={close}
              className="shrink-0 rounded-md border border-border/70 bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground transition hover:bg-muted/70"
              aria-label="Close search"
            >
              Esc
            </button>
          )}
        </div>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
        >
          {error ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm font-medium text-foreground">{error}</p>
              <button
                type="button"
                className="mt-3 text-sm font-semibold text-primary hover:bg-transparent hover:text-primary hover:underline"
                onClick={() => setRetryToken((value) => value + 1)}
              >
                Retry
              </button>
            </div>
          ) : null}

          {showEmpty ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-semibold text-foreground">
                No results for “{query.trim()}”
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another keyword or browse the{" "}
                <Link
                  href="/directory"
                  className="font-medium text-primary hover:underline"
                  onClick={close}
                >
                  directory
                </Link>
                .
              </p>
            </div>
          ) : null}

          {!error
            ? displayedSections.map((section) => (
                <section key={section.id} className="mb-1.5">
                  <h2 className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {section.label}
                  </h2>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      runningIndex += 1;
                      const index = runningIndex;
                      const selected = index === selectedIndex;
                      const Icon = iconFor(item.kind);
                      return (
                        <li key={item.id} role="presentation">
                          <button
                            type="button"
                            id={`${listId}-option-${index}`}
                            role="option"
                            aria-selected={selected}
                            data-search-index={index}
                            className={cn(
                              "group flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left transition-colors",
                              selected
                                ? "bg-muted/80 hover:bg-muted/80 ring-1 ring-primary/20"
                                : "hover:bg-muted/50"
                            )}
                            onMouseEnter={() => setSelectedIndex(index)}
                            onClick={() => navigateTo(item)}
                          >
                            <span
                              className={cn(
                                "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground",
                                selected && "border-primary/25 text-primary"
                              )}
                            >
                              <Icon className="size-3.5" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13.5px] font-medium text-foreground sm:text-sm">
                                {highlightMatch(item.title, query)}
                              </span>
                              {item.subtitle ? (
                                <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
                                  {item.subtitle}
                                </span>
                              ) : null}
                            </span>
                            {item.badge ? (
                              <span className="hidden shrink-0 text-[11px] font-medium text-muted-foreground sm:inline">
                                {item.badge}
                              </span>
                            ) : null}
                            <ArrowRight
                              className={cn(
                                "size-3.5 shrink-0 text-muted-foreground/70 opacity-0 transition",
                                selected && "opacity-100"
                              )}
                              aria-hidden
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            : null}
        </div>

        <div className="flex items-center gap-3 border-t border-border/60 px-3.5 py-2 text-[11px] text-muted-foreground sm:px-4">
          <span className="inline-flex items-center gap-1.5">
            <Keycap>↑</Keycap>
            <Keycap>↓</Keycap>
            <span>Navigate</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Keycap>
              <CornerDownLeft className="size-2.5" aria-hidden />
            </Keycap>
            <span>Open</span>
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <Keycap>Esc</Keycap>
            <span>Close</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
