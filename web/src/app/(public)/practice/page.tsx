import Link from "next/link";
import { notFound } from "next/navigation";
import { practiceEnabled, practicePath, problems } from "@/lib/practice/library";

export const dynamic = "force-dynamic";
export const metadata = { title: "Engineering Practice" };

export default function PracticePage() {
  if (!practiceEnabled()) notFound();
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold">Engineering Practice</h1>
        <p className="mt-2 text-muted-foreground">Work through randomized problems and explore interactive simulations.</p>
      </div>
      {["Static_problems", "Mechanics_of_materials_problems"].map((subject) => {
        const items = problems.filter((problem) => problem.subject === subject);
        const chapters = [...new Set(items.map((problem) => problem.chapter))]
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        return (
          <section key={subject} className="space-y-3">
            <h2 className="text-2xl font-semibold">{subject === "Static_problems" ? "Statics" : "Mechanics of Materials"}</h2>
            {chapters.map((chapter) => (
              <details key={chapter} className="rounded-md border px-4 py-3">
                <summary className="cursor-pointer font-medium">{chapter.replace(/_\s*/g, " · ")}</summary>
                <ul className="mt-3 space-y-2 pl-4">
                  {items.filter((problem) => problem.chapter === chapter).map((problem) => (
                    <li key={problem.id}>
                      <Link href={practicePath(problem.id)} prefetch={false} className="text-primary underline underline-offset-4">
                        {problem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </section>
        );
      })}
    </main>
  );
}
