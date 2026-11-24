export type PracticeField = {
  index: number;
  label: string;
  title: string;
  unit: string | null;
  digits: number;
};

export type SplitPracticePrompt = {
  diagramHtml: string | null;
  statementHtml: string;
  fields: PracticeField[];
};

const IMG_RE = /<img\b[^>]*>/i;
const UNIT_RE = /\bin\s*\(([^)]+)\)\s*=?\s*$/i;
const TRAILING_EQ_RE = /\s*=\s*$/;

/** Pull a display title + trailing unit from catalog labels like
 *  "The magnitude of the resultant force in (N) = ". */
export function parseFieldLabel(labelHtml: string): { title: string; unit: string | null } {
  const plain = labelHtml
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) =>
      ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" })[entity] ?? entity
    )
    .replace(/\s+/g, " ")
    .trim();

  const unitMatch = plain.match(UNIT_RE);
  if (unitMatch) {
    const unit = unitMatch[1]!.trim();
    const title = plain
      .slice(0, unitMatch.index)
      .replace(TRAILING_EQ_RE, "")
      .replace(/[,\s]+$/g, "")
      .trim();
    return { title: title || plain, unit: unit || null };
  }

  return {
    title: plain.replace(TRAILING_EQ_RE, "").trim() || plain,
    unit: null,
  };
}

export function splitPracticePrompt(
  pieces: Array<{ html: string } | { index: number; label: string; digits: number }>
): SplitPracticePrompt {
  const htmlChunks: string[] = [];
  const fields: PracticeField[] = [];

  for (const piece of pieces) {
    if ("html" in piece) {
      if (piece.html.trim()) htmlChunks.push(piece.html);
      continue;
    }
    const { title, unit } = parseFieldLabel(piece.label);
    fields.push({
      index: piece.index,
      label: piece.label,
      title,
      unit,
      digits: piece.digits,
    });
  }

  const combined = htmlChunks.join("\n");
  const imgMatch = combined.match(IMG_RE);
  const diagramHtml = imgMatch?.[0] ?? null;
  const statementHtml = (diagramHtml ? combined.replace(IMG_RE, "") : combined)
    .replace(/^(?:\s|<br\s*\/?>)+/gi, "")
    .replace(/(?:\s|<br\s*\/?>)+$/gi, "")
    .trim();

  return { diagramHtml, statementHtml, fields };
}
