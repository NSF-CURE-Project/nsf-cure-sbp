import { payload } from "./payloadClient";

export type ContactPhoto = {
  url?: string;
};

export type ContactPerson = {
  id?: string;
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  category?: 'staff' | 'technical' | string;
  photo?: ContactPhoto | null;
};

export type ContactPageData = {
  heroTitle: string;
  heroIntro?: string;
  contacts: ContactPerson[];
};

export async function getContactPage(): Promise<ContactPageData> {
  return payload.get<ContactPageData>("/globals/contact-page");
}
