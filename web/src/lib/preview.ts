import { draftMode } from "next/headers";

type SearchParams = Record<string, string | string[] | undefined>;

const getParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

export async function resolvePreview(searchParams?: SearchParams) {
  const { isEnabled } = await draftMode();
  if (isEnabled) return true;

  const preview = getParam(searchParams?.preview);
  const secret = getParam(searchParams?.secret);
  if (preview === "1" && secret && secret === process.env.PREVIEW_SECRET) {
    return true;
  }

  return false;
}
