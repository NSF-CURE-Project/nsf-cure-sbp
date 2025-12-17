// cms-payload/src/globals/HomePage.ts
import type { GlobalConfig } from "payload";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Home Page",
  access: {
    read: () => true, // public
  },
  versions: {
    drafts: true,
  },
  admin: {
    preview: {
      url: () => {
        const base = process.env.WEB_PREVIEW_URL ?? "http://localhost:3001";
        const search = new URLSearchParams({
          secret: process.env.PREVIEW_SECRET ?? "",
          type: "home",
        });
        return `${base}/api/preview?${search.toString()}`;
      },
    },
  },
  hooks: {
    beforeChange: [
      ({ data }) => ({
        ...data,
        _status: "published",
      }),
    ],
  },
  fields: [
    // HERO SECTION
    {
      name: "heroTitle",
      label: "Hero title",
      type: "text",
      required: true,
      defaultValue: "NSF CURE Summer Bridge Program",
    },
    {
      name: "heroSubtitle",
      label: "Hero subtitle",
      type: "textarea",
      required: true,
    },
    {
      name: "heroButtonLabel",
      type: "text",
      label: "Hero button label",
      defaultValue: "Getting Started",
    },
    {
      name: "heroButtonHref",
      type: "text",
      label: "Hero button link",
      defaultValue: "/getting-started",
    },

    // “OUR PURPOSE” SECTION
    {
      name: "purposeTitle",
      type: "text",
      label: "Purpose heading",
      defaultValue: "Our Purpose at NSF CURE SBP",
    },
    {
      name: "purposeBody",
      type: "richText", // or lexicalEditor if you're using that
      label: "Purpose text",
    },

    // “PROGRAM GOALS” SECTION
    {
      name: "goalsTitle",
      type: "text",
      label: "Goals heading",
      defaultValue: "Program Goals",
    },
    {
      name: "goalsIntroRich",
      type: "richText",
      label: "Goals intro (rich text)",
    },
    {
      name: "goals",
      label: "Program goals list",
      type: "array",
      fields: [
        {
          name: "item",
          type: "text",
          label: "Goal",
          required: true,
        },
      ],
    },

    // GETTING STARTED SECTION
    {
      name: "gettingStartedTitle",
      type: "text",
      label: "Getting Started heading",
      defaultValue: "Getting Started",
    },
    {
      name: "gettingStartedBody",
      type: "richText",
      label: "Getting Started content",
    },
    {
      name: "gettingStartedSteps",
      type: "array",
      label: "Getting Started steps",
      fields: [
        {
          name: "step",
          type: "text",
          label: "Step text",
          required: true,
        },
      ],
    },
  ],
};
