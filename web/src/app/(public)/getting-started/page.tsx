import React from "react";
import { PayloadRichText as RichText } from "@/components/ui/payloadRichText";
import {
  getGettingStarted,
  type GettingStartedPage,
} from "@/lib/payloadSdk/gettingStarted";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default async function GettingStartedPage() {
  const data: GettingStartedPage | null = await getGettingStarted().catch(
    () => null,
  );

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,110ch)] px-6 pt-6 pb-12 space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          {data?.title ?? "Getting Started"}
        </h1>
        {data?.intro && (
          <RichText
            content={data.intro}
            className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
          />
        )}
      </header>

      {data?.steps?.length ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Steps</h2>
          <ol className="list-decimal pl-6 space-y-4 text-foreground">
            {data.steps.map((step, idx) => (
              <li key={step.id ?? idx} className="space-y-2">
                <div className="text-lg font-semibold">{step.heading}</div>
                {step.description && (
                  <RichText
                    content={step.description}
                    className="prose dark:prose-invert prose-invert leading-7 max-w-none text-muted-foreground"
                  />
                )}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {data?.resources?.length ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Helpful Resources</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {data.resources.map((res, idx) => (
              <li
                key={`${res.url}-${idx}`}
                className="rounded-lg border border-border/60 bg-card/60 p-4 shadow-sm"
              >
                <a
                  href={res.url}
                  className="text-primary font-semibold underline underline-offset-4 hover:no-underline"
                >
                  {res.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
