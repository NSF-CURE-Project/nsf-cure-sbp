import type { SearchResultItem } from "./types";

const STORAGE_KEY = "sbp-search-recent";
const MAX_ITEMS = 8;

type StoredRecent = {
  id: string;
  title: string;
  href: string;
  kind: SearchResultItem["kind"];
  subtitle?: string;
  badge?: string;
  visitedAt: number;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readAll(): StoredRecent[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredRecent[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.href === "string" &&
        typeof item.kind === "string" &&
        typeof item.visitedAt === "number"
    );
  } catch {
    return [];
  }
}

function writeAll(items: StoredRecent[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export function getRecentSearchItems(): SearchResultItem[] {
  return readAll().map(({ visitedAt: _visitedAt, ...item }) => item);
}

export function recordSearchVisit(input: {
  href: string;
  title: string;
  kind?: SearchResultItem["kind"];
  subtitle?: string;
  badge?: string;
}) {
  if (!canUseStorage()) return;
  const href = input.href.split("?")[0]?.split("#")[0] || input.href;
  if (!href || href === "/") return;

  const kind = input.kind ?? inferKind(href);
  if (!kind) return;

  const next: StoredRecent = {
    id: `recent:${href}`,
    title: input.title.trim() || href,
    href,
    kind,
    subtitle: input.subtitle,
    badge: input.badge ?? badgeForKind(kind),
    visitedAt: Date.now(),
  };

  const existing = readAll().filter((item) => item.href !== href);
  writeAll([next, ...existing]);
}

function inferKind(href: string): SearchResultItem["kind"] | null {
  if (href.startsWith("/practice")) return "practice";
  if (/^\/classes\/[^/]+\/lessons\//.test(href)) return "lesson";
  if (/^\/classes\/[^/]+\/chapters\//.test(href)) return "chapter";
  if (/^\/classes\/[^/]+$/.test(href)) return "class";
  if (href === "/directory" || href === "/learning" || href === "/resources" || href === "/faq") {
    return "page";
  }
  if (href.startsWith("/") && href.split("/").length === 2) return "page";
  return null;
}

function badgeForKind(kind: SearchResultItem["kind"]) {
  switch (kind) {
    case "lesson":
      return "Lesson";
    case "chapter":
      return "Chapter";
    case "class":
      return "Course";
    case "practice":
      return "Practice";
    case "page":
      return "Page";
    default:
      return undefined;
  }
}
