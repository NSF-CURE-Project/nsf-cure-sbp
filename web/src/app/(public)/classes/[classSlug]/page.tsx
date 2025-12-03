import { notFound } from "next/navigation";
import { getClassBySlug } from "@/lib/payloadSdk/classes";

type Params = Promise<{ classSlug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// --- Metadata ---
export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { classSlug } = await props.params;

  const c = await getClassBySlug(classSlug);
  const title = c?.title ?? "Class";

  return {
    title: `${title} • Engineering Learning`,
  };
}

// --- Page ---
export default async function ClassPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { classSlug } = await props.params;

  const c = await getClassBySlug(classSlug);

  if (!c) return notFound();

  return (
    <article>
      <h1 className="text-3xl font-bold">{c.title}</h1>
    </article>
  );
}

// ISR (revalidate every 60s)
export const revalidate = 60;
