/** Split catalog titles like "Practice Problem 5: Cantilever Beam, Point Load…" */
export function splitPracticeTitle(title: string) {
  const match = title.match(/^Practice Problem\s+(\d+)\s*:\s*(.+)$/i);
  if (match) {
    return {
      badge: `Problem ${match[1]}`,
      identity: match[2]!.replace(/,\s*/g, " · ").trim(),
    };
  }
  return { badge: null as string | null, identity: title };
}
