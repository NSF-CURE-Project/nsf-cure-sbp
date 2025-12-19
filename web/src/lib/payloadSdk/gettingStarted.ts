import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { payload } from "./payloadClient";

export type GettingStartedResource = {
  label: string;
  url: string;
};

export type GettingStartedStep = {
  id?: string;
  heading: string;
  description?: SerializedEditorState;
};

export type GettingStartedPage = {
  title: string;
  intro?: SerializedEditorState;
  steps?: GettingStartedStep[];
  resources?: GettingStartedResource[];
};

export async function getGettingStarted(options?: { draft?: boolean }): Promise<GettingStartedPage> {
  return payload.get<GettingStartedPage>("/globals/getting-started", {
    draft: options?.draft,
  });
}
