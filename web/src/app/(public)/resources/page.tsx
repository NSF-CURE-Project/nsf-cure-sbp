// app/resources/page.tsx
import Link from "next/link";
import {
  getResourcesPage,
  type ResourcesPageData,
  type ResourceSection,
  type ResourceItem,
} from "@/lib/payloadSdk/resources";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

const ResourceCard = ({ item }: { item: ResourceItem }) => (
  <li className="rounded-lg border border-border/60 bg-card/60 px-4 py-3 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold leading-tight">{item.title}</p>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        )}
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {item.type ?? "link"}
      </span>
    </div>
    <Link
      href={item.url}
      className="mt-2 inline-flex text-primary text-sm underline underline-offset-4 hover:no-underline"
    >
      Open
    </Link>
  </li>
);

const ResourceSectionBlock = ({ section }: { section: ResourceSection }) => (
  <section className="space-y-2">
    <div>
      <h2 className="text-xl font-semibold leading-tight">{section.title}</h2>
      {section.description && (
        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
      )}
    </div>
    <ul className="space-y-3">
      {section.resources?.length ? (
        section.resources.map((item, idx) => (
          <ResourceCard key={item.id ?? idx} item={item} />
        ))
      ) : (
        <li className="text-sm text-muted-foreground">No resources yet.</li>
      )}
    </ul>
  </section>
);

export default async function ResourcesPage() {
  const data: ResourcesPageData | null = await getResourcesPage().catch(() => null);

  return (
    <main className="min-w-0 overflow-x-hidden p-6 lg:px-8">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            {data?.heroTitle ?? "Additional Resources"}
          </h1>
          {data?.heroIntro && (
            <p className="mt-3 text-muted-foreground leading-7">{data.heroIntro}</p>
          )}
        </header>

        <div className="space-y-8">
          {data?.sections?.length ? (
            data.sections.map((section, idx) => (
              <ResourceSectionBlock key={section.id ?? idx} section={section} />
            ))
          ) : (
            <p className="text-muted-foreground">No resources published yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
