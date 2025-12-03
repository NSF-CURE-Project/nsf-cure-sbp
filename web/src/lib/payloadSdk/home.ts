// web/src/lib/payloadSdk/home.ts
import { payload } from "./payloadClient";

export type HomePageData = {
  heroTitle: string;
  heroSubtitle?: string;
  heroButtonLabel?: string;
  heroButtonHref?: string;
  purposeTitle?: string;
  purposeBody?: any; // richText JSON
  goalsTitle?: string;
  goalsIntro?: any; // legacy plain string
  goalsIntroRich?: any; // richText JSON
  goals?: { id?: string; item: string }[];
};

export async function getHomePage(): Promise<HomePageData> {
  const data = await payload.get<HomePageData>("/globals/home-page");
  return data;
}
