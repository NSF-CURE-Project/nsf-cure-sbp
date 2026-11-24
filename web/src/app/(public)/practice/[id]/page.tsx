import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPracticeSlug,
  getProblem,
  instantiate,
  practiceEnabled,
  practicePath,
  prepareSimulation,
  renderPracticeHtml,
  resolvePracticeId,
} from "@/lib/practice/library";
import { hasNumericVariants } from "@/lib/practice/presentation";
import { practiceUuid, type PracticeAssignment } from "@/lib/practice/assignment";
import { gradePractice } from "./actions";
import { PracticeForm } from "./PracticeForm";
import { SimulationFrame } from "./SimulationFrame";
import { PracticeOpened } from "./PracticeOpened";
import { NativeSimulation } from "./NativeSimulation";
import { PracticeFocusMode } from "./PracticeFocusMode";
import { PracticeLessonNav } from "./PracticeLessonNav";
import { splitPracticeTitle } from "./practiceTitle";
import simulations from "@/lib/practice/simulations/metadata.generated.json";

export const dynamic = "force-dynamic";

export default async function PracticeProblemPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ variant?: string; lesson?: string; assignment?: string; level?: string; from?: string }>;
}) {
  const [{ id: param }, search] = await Promise.all([params, searchParams]);
  const { variant, lesson, assignment, level, from } = search;
  const resolvedId = resolvePracticeId(param);
  const problem = resolvedId ? getProblem(resolvedId) : null;
  if (!practiceEnabled() || !problem) notFound();
  const id = problem.id;
  const slug = getPracticeSlug(id);

  // Canonicalize hash IDs (and any non-canonical param) to the human-readable slug.
  if (param !== slug) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (typeof value === "string" && value) query.set(key, value);
    }
    redirect(practicePath(id, query));
  }

  const randomized = hasNumericVariants(problem);
  const simulation = process.env.DISABLE_NATIVE_PRACTICE_SIMULATIONS === "true" ? undefined :
    (simulations as Record<string, { html: string; css: string; version: string } | undefined>)[id];
  const interactive = Boolean(problem.simulation);
  const workspace = interactive || Boolean(problem.parts);
  const { badge, identity } = splitPracticeTitle(problem.title);
  const lessonId = typeof lesson === "string" && /^\d+$/.test(lesson) ? Number(lesson) : 0;
  const context: PracticeAssignment | null = Number.isSafeInteger(lessonId) && lessonId > 0 &&
    typeof assignment === "string" && practiceUuid.test(assignment)
    ? { lessonId, assignmentKey: assignment, problemId: id }
    : null;
  const lessonHref = context && typeof from === "string" && /^\/classes\/[a-z\d-]+\/lessons\/[a-z\d-]+$/i.test(from) ? from : null;
  function variantHref(seed: string) {
    return practicePath(id, {
      variant: seed,
      lesson: context ? String(context.lessonId) : undefined,
      assignment: context?.assignmentKey,
      from: lessonHref ?? undefined,
      level: level === "medium" || level === "hard" ? level : undefined,
    });
  }
  if ((!problem.simulation || simulation) && (typeof variant !== "string" || !practiceUuid.test(variant))) {
    redirect(variantHref(randomUUID()));
  }

  const form = problem.parts && variant ? (() => {
    const { data } = instantiate(problem, variant);
    const parts = problem.parts;
    const prompt = renderPracticeHtml(problem.prompt, data);
    const chunks = prompt.split(/<div data-practice-part="(\d+)"><\/div>/);
    const pieces = chunks.map((chunk, position) => {
      if (position % 2 === 0) return { html: chunk };
      const index = Number(chunk);
      return { index, label: renderPracticeHtml(parts[index].label, data, true), digits: parts[index].digits };
    });
    return <PracticeForm key={variant} action={gradePractice.bind(null, id, variant, context)}
      pieces={pieces} initialSubmissionId={randomUUID()} />;
  })() : null;

  return (
    <main className={workspace
      ? interactive
        ? `mx-auto w-full min-w-0 max-w-[1680px] space-y-2 px-2 py-2 sm:px-4 lg:px-5 lg:py-3${lessonHref ? " pb-24" : ""}`
        : `mx-auto w-full min-w-0 max-w-[1200px] space-y-2 px-2 py-2 sm:px-4 lg:px-5 lg:py-3${lessonHref ? " pb-24" : ""}`
      : `mx-auto w-full min-w-0 max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:py-12${lessonHref ? " pb-24" : ""}`}>
      {workspace ? <PracticeFocusMode /> : null}
      {context ? <PracticeOpened {...context} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <PracticeLessonNav lessonHref={lessonHref} />
        </div>
        {randomized && !interactive ? (
          <Button asChild variant="ghost" size="sm" className="h-8 rounded-md px-2 text-xs">
            <Link href={variantHref(randomUUID())} prefetch={false}>
              <Shuffle className="size-3.5" aria-hidden /> New variant
            </Link>
          </Button>
        ) : null}
      </div>
      <header className={workspace ? "space-y-0.5" : "flex flex-wrap items-start justify-between gap-4 border-b pb-5"}>
        <div className="min-w-0 flex-1">
          <p className={`text-muted-foreground ${workspace ? "mb-0 text-[11px] font-medium uppercase tracking-[0.06em]" : "mb-1 text-sm"}`}>
            {problem.chapter.replace(/_\s*/g, " / ")}
            {badge ? <span className="normal-case tracking-normal text-muted-foreground/80"> · {badge}</span> : null}
          </p>
          <h1 className={workspace
            ? "text-pretty text-base font-semibold tracking-tight sm:text-lg"
            : "text-pretty text-2xl font-semibold tracking-tight sm:text-3xl"}>
            {identity}
          </h1>
        </div>
      </header>
      {problem.simulation ? (
        simulation && variant ? <NativeSimulation key={id} id={id} title={problem.title} seed={variant}
          level={level === "medium" || level === "hard" ? level : "easy"} content={simulation}
          fallback={prepareSimulation(problem.simulation)} assignment={context}
          lessonHref={lessonHref} />
          : <SimulationFrame key={id} title={problem.title} document={prepareSimulation(problem.simulation)} />
      ) : form}
    </main>
  );
}
