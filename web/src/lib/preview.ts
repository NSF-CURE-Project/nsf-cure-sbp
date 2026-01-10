import { draftMode } from "next/headers";

type SearchParams = Record<string, string | string[] | undefined>;

const resolveSearchParams = async (
  searchParams?: SearchParams | Promise<SearchParams>
) => {
  if (!searchParams) return undefined;
  return (await Promise.resolve(searchParams)) as SearchParams;
};

const getParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

export async function resolvePreview(
  searchParams?: SearchParams | Promise<SearchParams>
) {
  const { isEnabled } = await draftMode();
  if (isEnabled) return true;

  const params = await resolveSearchParams(searchParams);
  const preview = getParam(params?.preview);
  const secret = getParam(params?.secret);
  if (preview === "1" && secret && secret === process.env.PREVIEW_SECRET) {
    return true;
  }

  return false;
}
