import type { PageLayoutBlock } from "./types";
import { payload } from "./payloadClient";

export type ResourcesPageData = {
  layout?: PageLayoutBlock[] | null;
};

export async function getResourcesPage(options?: { draft?: boolean }): Promise<ResourcesPageData> {
  return payload.get<ResourcesPageData>("/globals/resources-page", {
    draft: options?.draft,
  });
}
