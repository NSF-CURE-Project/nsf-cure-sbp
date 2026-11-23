import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProblem, instantiate, practiceEnabled, prepareSimulation, renderPracticeHtml } from "@/lib/practice/library";
import { hasNumericVariants } from "@/lib/practice/presentation";
import { practiceUuid, type PracticeAssignment } from "@/lib/practice/assignment";
import { gradePractice } from "./actions";
import { PracticeForm } from "./PracticeForm";
import { SimulationFrame } from "./SimulationFrame";
import { PracticeOpened } from "./PracticeOpened";
import { NativeSimulation } from "./NativeSimulation";
import simulations from "@/lib/practice/simulations/metadata.generated.json";

export const dynamic = "force-dynamic";

export default async function PracticeProblemPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ variant?: string; lesson?: string; assignment?: string; level?: string; from?: string }>;
}) {
  const [{ id }, { variant, lesson, assignment, level, from }] = await Promise.all([params, searchParams]);
  const problem = getProblem(id);
  if (!practiceEnabled() || !problem) notFound();
  const randomized = hasNumericVariants(problem);
  const simulation = process.env.DISABLE_NATIVE_PRACTICE_SIMULATIONS === "true" ? undefined :
    (simulations as Record<string, { html: string; css: string; version: string } | undefined>)[id];
  const lessonId = typeof lesson === "string" && /^\d+$/.test(lesson) ? Number(lesson) : 0;
  const context: PracticeAssignment | null = Number.isSafeInteger(lessonId) && lessonId > 0 &&
    typeof assignment === "string" && practiceUuid.test(assignment)
    ? { lessonId, assignmentKey: assignment, problemId: id }
    : null;
  const lessonHref = context && typeof from === "string" && /^\/classes\/[a-z\d-]+\/lessons\/[a-z\d-]+$/i.test(from) ? from : null;
  function variantHref(seed: string) {
    const query = new URLSearchParams({ variant: seed });
    if (context) {
      query.set("lesson", String(context.lessonId));
      query.set("assignment", context.assignmentKey);
    }
    if (lessonHref) query.set("from", lessonHref);
    if (level === "medium" || level === "hard") query.set("level", level);
    return `/practice/${id}?${query}`;
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
    <main className="mx-auto w-full min-w-0 max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
      {context ? <PracticeOpened {...context} /> : null}
      <Link href={lessonHref ?? "/practice"} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4">
        <ArrowLeft className="size-4" aria-hidden /> {lessonHref ? "Back to lesson" : "All practice problems"}
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
        <div className="min-w-0 flex-1 basis-64">
          <p className="mb-2 text-sm text-muted-foreground">{problem.chapter.replace(/_\s*/g, " · ")}</p>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-3xl">{problem.title}</h1>
        </div>
        {randomized ? (
          <Button asChild variant="outline">
            <Link href={variantHref(randomUUID())} prefetch={false}>
              <Shuffle className="size-4" aria-hidden /> New variant
            </Link>
          </Button>
        ) : null}
      </header>
      {problem.simulation ? (
        simulation && variant ? <NativeSimulation key={id} id={id} title={problem.title} seed={variant}
          level={level === "medium" || level === "hard" ? level : "easy"} content={simulation}
          fallback={prepareSimulation(problem.simulation)} assignment={context} />
          : <SimulationFrame key={id} title={problem.title} document={prepareSimulation(problem.simulation)} />
      ) : form}
    </main>
  );
}
