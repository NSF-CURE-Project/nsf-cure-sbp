// web/src/lib/payloadSdk/home.ts
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { payload } from "./payloadClient";

export type HomePageData = {
  heroTitle: string;
  heroSubtitle?: string;
  heroButtonLabel?: string;
  heroButtonHref?: string;
  purposeTitle?: string;
  purposeBody?: SerializedEditorState; // richText JSON
  goalsTitle?: string;
  goalsIntro?: SerializedEditorState; // legacy plain string
  goalsIntroRich?: SerializedEditorState; // richText JSON
  goals?: { id?: string; item: string }[];
  gettingStartedTitle?: string;
  gettingStartedBody?: SerializedEditorState; // richText JSON
  gettingStartedSteps?: { id?: string; step: string }[];
};

export async function getHomePage(options?: { draft?: boolean }): Promise<HomePageData> {
  const data = await payload.get<HomePageData>("/globals/home-page", {
    draft: options?.draft,
  });
  return data;
}
