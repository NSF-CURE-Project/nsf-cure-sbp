// cms-payload/src/globals/HomePage.ts
import type { GlobalConfig } from "payload";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Home Page",
  access: {
    read: () => true, // public
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
      defaultValue: "/resources",
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

    // You can add more sections later (testimonials, timeline, etc.)
  ],
};
