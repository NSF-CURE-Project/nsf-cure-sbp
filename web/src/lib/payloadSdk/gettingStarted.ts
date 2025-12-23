import type { PageLayoutBlock } from "./types";
import { payload } from "./payloadClient";

export type GettingStartedPage = {
  layout?: PageLayoutBlock[] | null;
};

export async function getGettingStarted(options?: { draft?: boolean }): Promise<GettingStartedPage> {
  return payload.get<GettingStartedPage>("/globals/getting-started", {
    draft: options?.draft,
  });
}
