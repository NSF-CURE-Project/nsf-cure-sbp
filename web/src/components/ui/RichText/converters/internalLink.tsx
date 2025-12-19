import { SerializedLinkNode } from '@payloadcms/richtext-lexical'

export const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!

  const slug =
    typeof value === "object" &&
    value !== null &&
    "slug" in value &&
    typeof value.slug === "string"
      ? value.slug
      : ""

  if (relationTo === "posts") {
    return slug ? `/posts/${slug}` : "/posts";
  } else if (relationTo === "users") {
    return slug ? `/users/${slug}` : "/users";
  }
  return slug ? `/${slug}` : "/";
}
