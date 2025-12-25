import type { PageLayoutBlock } from "./types";
import { payload } from "./payloadClient";

export type ContactPageData = {
  layout?: PageLayoutBlock[] | null;
};

export async function getContactPage(options?: { draft?: boolean }): Promise<ContactPageData> {
  return payload.get<ContactPageData>("/globals/contact-page", {
    draft: options?.draft,
  });
}
