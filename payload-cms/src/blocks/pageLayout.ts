import type { Block } from "payload";

export const pageLayoutBlocks: Block[] = [
  {
    slug: "heroBlock",
    interfaceName: "HeroBlock",
    labels: { singular: "Hero", plural: "Hero Blocks" },
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
      },
      {
        name: "subtitle",
        type: "textarea",
      },
      {
        name: "buttonLabel",
        type: "text",
      },
      {
        name: "buttonHref",
        type: "text",
      },
    ],
  },
  {
    slug: "sectionTitle",
    interfaceName: "SectionTitleBlock",
    labels: { singular: "Section Title", plural: "Section Titles" },
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
      },
      {
        name: "subtitle",
        type: "textarea",
      },
      {
        name: "size",
        type: "select",
        defaultValue: "md",
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
    ],
  },
  {
    slug: "richTextBlock",
    interfaceName: "RichTextBlock",
    labels: { singular: "Rich Text", plural: "Rich Text" },
    fields: [
      {
        name: "body",
        type: "richText",
        required: true,
        admin: {
          description: "Use $...$ for inline math and $$...$$ for display math.",
        },
      },
    ],
  },
  {
    slug: "textBlock",
    interfaceName: "TextBlock",
    labels: { singular: "Text", plural: "Text" },
    fields: [
      {
        name: "text",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    slug: "videoBlock",
    interfaceName: "VideoBlock",
    labels: { singular: "Video", plural: "Videos" },
    fields: [
      {
        name: "video",
        type: "upload",
        relationTo: "media" as any,
        required: false,
      },
      {
        name: "url",
        label: "External URL (optional)",
        type: "text",
      },
      {
        name: "caption",
        type: "text",
      },
    ],
  },
  {
    slug: "listBlock",
    interfaceName: "ListBlock",
    labels: { singular: "List", plural: "Lists" },
    fields: [
      {
        name: "title",
        type: "text",
      },
      {
        name: "listStyle",
        type: "select",
        defaultValue: "unordered",
        options: [
          { label: "Bulleted", value: "unordered" },
          { label: "Numbered", value: "ordered" },
        ],
      },
      {
        name: "items",
        label: "Items",
        type: "array",
        fields: [
          {
            name: "text",
            type: "text",
            required: true,
          },
        ],
      },
    ],
  },
  {
    slug: "stepsList",
    interfaceName: "StepsListBlock",
    labels: { singular: "Steps List", plural: "Steps Lists" },
    fields: [
      {
        name: "title",
        type: "text",
      },
      {
        name: "steps",
        label: "Steps",
        type: "array",
        fields: [
          {
            name: "heading",
            type: "text",
            required: true,
          },
          {
            name: "description",
            type: "richText",
            admin: {
              description: "Use $...$ for inline math and $$...$$ for display math.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "buttonBlock",
    interfaceName: "ButtonBlock",
    labels: { singular: "Button", plural: "Buttons" },
    fields: [
      {
        name: "label",
        type: "text",
        required: true,
      },
      {
        name: "href",
        type: "text",
        required: true,
      },
    ],
  },
  {
    slug: "resourcesList",
    interfaceName: "ResourcesListBlock",
    labels: { singular: "Resources List", plural: "Resources Lists" },
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
      },
      {
        name: "description",
        type: "textarea",
      },
      {
        name: "resources",
        label: "Resources",
        type: "array",
        fields: [
          {
            name: "title",
            label: "Resource title",
            type: "text",
            required: true,
          },
          {
            name: "description",
            label: "Resource description",
            type: "textarea",
          },
          {
            name: "url",
            label: "URL",
            type: "text",
            required: true,
          },
          {
            name: "type",
            label: "Type",
            type: "text",
          },
        ],
      },
    ],
  },
  {
    slug: "contactsList",
    interfaceName: "ContactsListBlock",
    labels: { singular: "Contacts List", plural: "Contacts Lists" },
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
      },
      {
        name: "description",
        type: "textarea",
      },
      {
        name: "groupByCategory",
        type: "checkbox",
        defaultValue: true,
      },
      {
        name: "contacts",
        label: "Contacts",
        type: "array",
        fields: [
          {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
          },
          {
            name: "title",
            label: "Title",
            type: "text",
          },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              { label: "Staff", value: "staff" },
              { label: "Technical", value: "technical" },
            ],
            defaultValue: "staff",
          },
          {
            name: "phone",
            label: "Phone",
            type: "text",
          },
          {
            name: "email",
            label: "Email",
            type: "text",
          },
          {
            name: "photo",
            label: "Photo",
            type: "upload",
            relationTo: "media" as any,
          },
        ],
      },
    ],
  },
];
