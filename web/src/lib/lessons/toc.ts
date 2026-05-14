import type { PageLayoutBlock } from "@/lib/payloadSdk/types";

export type LessonSection = {
  id: string;
  title: string;
  index: number;
  // How big the heading is rendered — drives the indentation in the TOC list.
  level: "primary" | "secondary";
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

// Pull anchor-worthy sections out of a lesson's block array. The same
// algorithm runs in two places (the table-of-contents in the sidebar and
// the rendered headings in page-layout) so they stay in sync.
export function extractLessonSections(blocks: PageLayoutBlock[]): LessonSection[] {
  const sections: LessonSection[] = [];
  const used = new Set<string>();

  blocks.forEach((block, index) => {
    let rawTitle: string | undefined;
    let level: LessonSection["level"] = "secondary";

    if (block.blockType === "sectionTitle") {
      rawTitle = block.title;
      level = block.size === "lg" ? "primary" : "secondary";
    } else if (block.blockType === "textSection") {
      rawTitle = block.title;
      level = block.size === "lg" ? "primary" : "secondary";
    } else if (block.blockType === "sectionBlock") {
      rawTitle = block.title;
      level = block.size === "lg" ? "primary" : "secondary";
    }

    const trimmed = rawTitle?.trim();
    if (!trimmed) return;

    const base = slugify(trimmed) || `section-${index}`;
    let candidate = base;
    let suffix = 2;
    // Dedupe slugs in the same lesson — e.g. two "Overview" sections.
    while (used.has(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(candidate);

    sections.push({
      id: candidate,
      title: trimmed,
      index,
      level,
    });
  });

  return sections;
}

// Stable id for any block — sections get the deterministic slugged id; other
// blocks fall back to a position-keyed id. Both renderer and TOC use this
// resolver so anchor clicks always land somewhere predictable.
export function getBlockAnchorId(
  block: PageLayoutBlock,
  index: number,
  sections: LessonSection[],
): string | undefined {
  const sectionAtIndex = sections.find((entry) => entry.index === index);
  if (sectionAtIndex) return sectionAtIndex.id;
  return undefined;
}
