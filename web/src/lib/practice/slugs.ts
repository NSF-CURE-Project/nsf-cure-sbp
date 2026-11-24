import catalog from "./catalog.generated.json";

const problems = catalog.problems;
const HASH_ID = /^[a-f0-9]{20}$/i;

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^practice\s+problem\s+\d+\s*:\s*/i, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 72)
    .replace(/-+$/g, "");

const chapterToken = (chapter: string) => {
  const match = chapter.match(/chapter\s*(\d+)/i);
  return match ? `ch${match[1]}` : slugify(chapter).slice(0, 24) || "topic";
};

const buildSlugMaps = () => {
  const byId = new Map<string, string>();
  const bySlug = new Map<string, string>();
  const used = new Map<string, number>();

  for (const problem of problems) {
    const base = slugify(problem.title) || `problem-${problem.id.slice(0, 8)}`;
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const slug =
      count === 0
        ? base
        : `${base}-${chapterToken(problem.chapter)}-${problem.id.slice(0, 6)}`;
    byId.set(problem.id, slug);
    bySlug.set(slug, problem.id);
  }

  return { byId, bySlug };
};

const maps = buildSlugMaps();

/** Prefer human slug; fall back to hash id if unknown. */
export const getPracticeSlug = (id: string) => maps.byId.get(id) ?? id;

/** Resolve a URL segment that may be a hash id or a slug. */
export const resolvePracticeId = (param: string) => {
  if (maps.byId.has(param)) return param;
  const fromSlug = maps.bySlug.get(param);
  if (fromSlug) return fromSlug;
  if (HASH_ID.test(param)) return param;
  return null;
};

export const isPracticeHashId = (value: string) => HASH_ID.test(value);

export const practicePath = (
  idOrSlug: string,
  query?: Record<string, string | undefined> | URLSearchParams,
) => {
  const id = resolvePracticeId(idOrSlug) ?? idOrSlug;
  const slug = getPracticeSlug(id);
  const params =
    query instanceof URLSearchParams
      ? query
      : new URLSearchParams(
          Object.entries(query ?? {}).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0,
          ),
        );
  const qs = params.toString();
  return qs ? `/practice/${slug}?${qs}` : `/practice/${slug}`;
};
