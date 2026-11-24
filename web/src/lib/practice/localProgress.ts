export type PracticeProgressStatus = "not-started" | "in-progress" | "completed";

export type LocalPracticeProgress = {
  status: Exclude<PracticeProgressStatus, "not-started">;
  seed?: string | null;
  updatedAt: string;
  score?: number | null;
  maxScore?: number | null;
};

const STORAGE_KEY = "sbp-practice-library-progress-v1";

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function readLocalPracticeProgress(): Record<string, LocalPracticeProgress> {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LocalPracticeProgress>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function writeLocalPracticeProgress(
  problemId: string,
  next: Omit<LocalPracticeProgress, "updatedAt"> & { updatedAt?: string }
) {
  if (!canUseStorage()) return;
  const current = readLocalPracticeProgress();
  const previous = current[problemId];
  const status =
    previous?.status === "completed" || next.status === "completed"
      ? "completed"
      : next.status;
  current[problemId] = {
    status,
    seed: next.seed ?? previous?.seed ?? null,
    score: next.score ?? previous?.score ?? null,
    maxScore: next.maxScore ?? previous?.maxScore ?? null,
    updatedAt: next.updatedAt ?? new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Ignore quota / private-mode failures.
  }
}
