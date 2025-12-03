import { payload } from "./payloadClient";

export type ResourceItem = {
  id?: string;
  title: string;
  description?: string;
  url: string;
  type?: string;
};

export type ResourceSection = {
  id?: string;
  title: string;
  description?: string;
  resources?: ResourceItem[];
};

export type ResourcesPageData = {
  heroTitle: string;
  heroIntro?: string;
  sections?: ResourceSection[];
};

export async function getResourcesPage(): Promise<ResourcesPageData> {
  return payload.get<ResourcesPageData>("/globals/resources-page");
}
