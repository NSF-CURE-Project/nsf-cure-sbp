// src/app/(public)/contact-us/page.tsx
import Image from "next/image";
import { draftMode } from "next/headers";
import {
  getContactPage,
  type ContactPageData,
  type ContactPerson,
} from "@/lib/payloadSdk/contacts";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

const BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "";

function buildImageUrl(photo?: ContactPerson["photo"]): string | null {
  const url = typeof photo === "string" ? photo : photo?.url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

export default async function ContactUsPage() {
  const { isEnabled: isPreview } = await draftMode();
  const data: ContactPageData | null = await getContactPage({
    draft: isPreview,
  }).catch(() => null);
  const contacts = data?.contacts ?? [];

  const staffContacts = contacts.filter(
    (c) => (c.category ?? "").toLowerCase() === "staff"
  );
  const technicalContacts = contacts.filter(
    (c) => (c.category ?? "").toLowerCase() === "technical"
  );
  const otherContacts = contacts.filter(
    (c) => !["staff", "technical"].includes((c.category ?? "").toLowerCase())
  );

  const sections = [
    { label: "Staff Contact Information", items: staffContacts },
    { label: "Technical Staff Contact Information", items: technicalContacts },
    { label: "Other Contacts", items: otherContacts },
  ].filter((s) => s.items.length > 0);

  return (
    <main className="max-w-6xl mx-auto pt-6 pb-10 px-6">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-3">
          {data?.heroTitle ?? "Contact Us"}
        </h1>
        {data?.heroIntro && (
          <p className="text-muted-foreground max-w-2xl mb-8 leading-7">
            {data.heroIntro}
          </p>
        )}
      </div>

      {contacts.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No contact information available.
        </p>
      ) : (
        <div className="space-y-10">
          {sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight text-foreground/90">
                {section.label}
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((person, i) => {
                  const photoUrl = buildImageUrl(person.photo);
                  return (
                    <div
                      key={person.id ?? `${idx}-${i}`}
                      className="rounded-lg border border-border/40 bg-muted/20 backdrop-blur-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all duration-200 hover:bg-muted/30"
                    >
                      {photoUrl ? (
                        <div className="w-32 h-32 relative mb-4">
                          <Image
                            src={photoUrl}
                            alt={person.name}
                            fill
                            className="object-cover rounded-full border border-border/40"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 mb-4 rounded-full bg-muted flex items-center justify-center text-3xl">
                          👤
                        </div>
                      )}

                      <h3 className="text-xl font-semibold mb-1">{person.name}</h3>

                      {person.title && (
                        <p className="text-sm font-bold text-foreground mb-2">
                          {person.title}
                        </p>
                      )}

                      {person.email && (
                        <p className="text-sm text-muted-foreground">
                          <a
                            href={`mailto:${person.email}`}
                            className="hover:text-foreground transition-colors"
                          >
                            {person.email}
                          </a>
                        </p>
                      )}

                      {person.phone && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <a
                            href={`tel:${person.phone}`}
                            className="hover:text-foreground transition-colors"
                          >
                            {person.phone}
                          </a>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
