import type { CollectionConfig } from "payload";

import { pageBlocks } from "../blocks/pageBlocks";
import { ensureUniqueSlug, slugify } from "../utils/slug";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    group: "Main Pages",
    preview: {
      url: ({ data }) => {
        const base = process.env.WEB_PREVIEW_URL ?? "http://localhost:3001";
        const secret = process.env.PREVIEW_SECRET ?? "";
        const slug = data?.slug ?? "";
        const search = new URLSearchParams({
          secret,
          type: "page",
          slug,
        });
        return `${base}/api/preview?${search.toString()}`;
      },
    },
    livePreview: {
      url: ({ data }) => {
        const base = process.env.WEB_PREVIEW_URL ?? "http://localhost:3001";
        const secret = process.env.PREVIEW_SECRET ?? "";
        const slug = data?.slug ?? "";
        const search = new URLSearchParams({
          secret,
          type: "page",
          slug,
        });
        return `${base}/api/preview?${search.toString()}`;
      },
    },
  },
  access: {
    read: () => true,
    create: ({ req }) =>
      req.user?.collection === "users" ||
      ["admin", "staff"].includes(req.user?.role ?? ""),
    update: ({ req }) =>
      req.user?.collection === "users" ||
      ["admin", "staff"].includes(req.user?.role ?? ""),
    delete: ({ req }) =>
      req.user?.collection === "users" ||
      ["admin", "staff"].includes(req.user?.role ?? ""),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc, id }) => {
        if (!data) return data;
        if (!data.slug) {
          const title = data.title ?? originalDoc?.title ?? "";
          const normalizedTitle = String(title).trim().toLowerCase();
          const base =
            normalizedTitle === "home" || normalizedTitle === "home page"
              ? "home"
              : slugify(String(title));
          data.slug = await ensureUniqueSlug({
            base,
            collection: "pages",
            req,
            id,
          });
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "Auto-generated from the page title. Use 'Home' to create the homepage slug.",
        hidden: true,
      },
    },
    {
      name: "layout",
      label: "Page Layout",
      type: "blocks",
      labels: {
        singular: "Section",
        plural: "Sections",
      },
      blocks: pageBlocks,
      admin: {
        description: "Build the page by adding and reordering content blocks.",
      },
    },
  ],
};
