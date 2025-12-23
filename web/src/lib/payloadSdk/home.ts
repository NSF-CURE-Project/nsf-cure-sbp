// web/src/lib/payloadSdk/home.ts
import type { PageLayoutBlock } from "./types";
import { payload } from "./payloadClient";

export type HomePageData = {
  layout?: PageLayoutBlock[] | null;
};

export async function getHomePage(options?: { draft?: boolean }): Promise<HomePageData> {
  const data = await payload.get<HomePageData>("/globals/home-page", {
    draft: options?.draft,
  });
  return data;
}
