// web/src/lib/payloadSdk/home.ts
import type { PageLayoutBlock } from "./types";
import { getPageBySlug } from "./pages";

export type HomePageData = {
  layout?: PageLayoutBlock[] | null;
};

export async function getHomePage(options?: { draft?: boolean }): Promise<HomePageData> {
  const page = await getPageBySlug("home", { draft: options?.draft });
  return { layout: page?.layout ?? null };
}
