import { notFound } from "next/navigation";

import { PracticeLibrary } from "@/components/practice/PracticeLibrary";
import { practiceEnabled, problems } from "@/lib/practice/library";

export const dynamic = "force-dynamic";
export const metadata = { title: "Engineering Practice" };

export default function PracticePage() {
  if (!practiceEnabled()) notFound();

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Engineering Practice
        </h1>
        <p className="mt-2 text-muted-foreground">
          Work through randomized problems and explore interactive simulations.
        </p>
      </div>
      <PracticeLibrary
        problems={problems.map((problem) => ({
          id: problem.id,
          title: problem.title,
          chapter: problem.chapter,
          subject: problem.subject,
        }))}
      />
    </main>
  );
}
