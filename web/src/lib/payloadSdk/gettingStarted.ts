import { payload } from "./payloadClient";

export type GettingStartedResource = {
  label: string;
  url: string;
};

export type GettingStartedStep = {
  id?: string;
  heading: string;
  description?: any;
};

export type GettingStartedPage = {
  title: string;
  intro?: any;
  steps?: GettingStartedStep[];
  resources?: GettingStartedResource[];
};

export async function getGettingStarted(): Promise<GettingStartedPage> {
  return payload.get<GettingStartedPage>("/globals/getting-started");
}
