// src/app/(public)/contact-us/page.tsx
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export const metadata = buildMetadata({
  title: "Contacts",
  description: "Staff and program contacts for NSF CURE SBP.",
  path: "/contacts",
});

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const IS_PROD = process.env.NODE_ENV === "production";
const PUB = IS_PROD ? "live" : "preview";

// Type for each contact
type Contact = {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  photo?: string | null;
};

// Build API URL
function buildUrl() {
  const url = new URL(`${STRAPI_URL}/api/contacts`);
  url.searchParams.set("publicationState", PUB);
  url.searchParams.set("populate[photo][fields][0]", "url");
  url.searchParams.set("fields[0]", "name");
  url.searchParams.set("fields[1]", "phone");
  url.searchParams.set("fields[2]", "email");
  return url.toString();
}

// Normalize Strapi response
function normalizeContact(item: unknown): Contact {
  if (!item || typeof item !== "object") return { id: 0, name: "Unknown" };
  const base = item as {
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
    photo?: { url?: string | null } | null;
    attributes?: {
      name?: string;
      phone?: string;
      email?: string;
      photo?: { data?: { attributes?: { url?: string | null } } };
    };
  };

  // v5 flat
  if (!("attributes" in base)) {
    return {
      id: base.id ?? 0,
      name: base.name ?? "Unnamed",
      phone: base.phone ?? "",
      email: base.email ?? "",
      photo: absUrl(base.photo?.url ?? null),
    };
  }

  // v4 nested
  const a = base.attributes ?? {};
  return {
    id: base.id ?? 0,
    name: a.name ?? "Unnamed",
    phone: a.phone ?? "",
    email: a.email ?? "",
    photo: absUrl(a.photo?.data?.attributes?.url ?? null),
  };
}

function absUrl(u?: string | null) {
  return u ? (u.startsWith("http") ? u : `${STRAPI_URL}${u}`) : null;
}

export default async function ContactUsPage() {
  const res = await fetch(buildUrl(), { cache: "no-store" });
  if (!res.ok) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-6 text-center text-red-600">
        Failed to load contacts (HTTP {res.status})
      </main>
    );
  }

  const json = await res.json();
  const contacts = Array.isArray(json?.data)
    ? json.data.map(normalizeContact)
    : [];

  return (
    <main className="max-w-6xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold text-center mb-10">Contact Us</h1>

      {contacts.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No contact information available.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((person: Contact) => (
            <div
              key={person.id}
              className="rounded-lg border border-border/40 bg-muted/20 backdrop-blur-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all duration-200 hover:bg-muted/30"
            >
              {person.photo ? (
                <div className="w-32 h-32 relative mb-4">
                  <Image
                    src={person.photo}
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

              <h2 className="text-xl font-semibold mb-1">{person.name}</h2>

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
          ))}
        </div>
      )}
    </main>
  );
}
