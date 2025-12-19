import React from "react";
import { draftMode } from "next/headers";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { PayloadRichText as RichText } from "@/components/ui/payloadRichText";
import { getHomePage, type HomePageData } from "@/lib/payloadSdk/home";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default async function Landing() {
  const { isEnabled: isPreview } = await draftMode();
  const home: HomePageData | null = await getHomePage({ draft: isPreview }).catch(() => null);

  return (
    <div
      className="mx-auto w-full max-w-[var(--content-max)] px-6"
      style={{ "--content-max": "100%" } as React.CSSProperties}
    >
      <header>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {home?.heroTitle ?? "NSF CURE Summer Bridge Program"}
        </h1>

        {home?.heroSubtitle && (
          <p className="mt-3 text-muted-foreground leading-7">
            {home.heroSubtitle}
          </p>
        )}
      </header>

      <section className="mt-10 space-y-10">
        {home?.purposeBody && (
          <div>
            <h2 className="text-2xl font-semibold mb-3">
              {home.purposeTitle ?? "Our Purpose at NSF CURE SBP"}
            </h2>
            <RichText
              content={home.purposeBody}
              className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
            />
          </div>
        )}

        {(home?.goalsIntroRich || home?.goalsIntro || home?.goals?.length) && (
          <div>
            <h2 className="text-2xl font-semibold mb-3">
              {home.goalsTitle ?? "Program Goals"}
            </h2>

            {home.goalsIntroRich ? (
              <RichText
                content={home.goalsIntroRich}
                className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
              />
            ) : home.goalsIntro ? (
              <RichText
                content={home.goalsIntro}
                className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
              />
            ) : null}

            {home.goals?.length ? (
              <ul className="list-disc pl-6 mt-3 space-y-1">
                {home.goals.map((g, i) => (
                  <li key={g.id ?? i}>{g.item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </section>

      {home?.gettingStartedBody ||
      home?.gettingStartedSteps?.length ||
      home?.gettingStartedTitle ? (
        <section className="mt-12 space-y-3">
          <h2 className="text-2xl font-semibold">
            {home?.gettingStartedTitle ?? "Getting Started"}
          </h2>
          {home?.gettingStartedBody && (
            <RichText
              content={home.gettingStartedBody}
              className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
            />
          )}
          {home?.gettingStartedSteps?.length ? (
            <ul className="list-decimal pl-6 space-y-1 text-muted-foreground">
              {home.gettingStartedSteps.map((s, idx) => (
                <li key={s.id ?? idx}>{s.step}</li>
              ))}
            </ul>
          ) : null}
          <div className="pt-2">
            <ThemedButton href={home?.heroButtonHref ?? "/getting-started"}>
              {home?.heroButtonLabel ?? "Getting Started"}
            </ThemedButton>
          </div>
        </section>
      ) : null}
    </div>
  );
}
