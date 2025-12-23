import type { Payload } from "payload";

type LayoutBlock = Record<string, unknown>;

const toTextBlock = (text?: unknown): LayoutBlock | null =>
  typeof text === "string" && text.trim()
    ? { blockType: "textBlock", text }
    : null;

const toRichTextBlock = (value?: unknown): LayoutBlock | null =>
  value && typeof value === "object" ? { blockType: "richTextBlock", body: value } : null;

const toListBlock = (items?: Array<{ text: string }>, listStyle: "ordered" | "unordered" = "unordered", title?: string) => {
  if (!items || items.length === 0) return null;
  return {
    blockType: "listBlock",
    title,
    listStyle,
    items,
  };
};

const isLayoutEmpty = (layout?: unknown) =>
  !Array.isArray(layout) || layout.length === 0;

const toSectionTitle = (title?: string | null, subtitle?: string | null) => {
  if (!title && !subtitle) return null;
  return {
    blockType: "sectionTitle",
    title: title ?? "",
    subtitle: subtitle ?? undefined,
  };
};

const toHeroBlock = (data: {
  title?: string | null;
  subtitle?: string | null;
  buttonLabel?: string | null;
  buttonHref?: string | null;
}) => {
  if (!data.title && !data.subtitle && !data.buttonLabel) return null;
  return {
    blockType: "heroBlock",
    title: data.title ?? "",
    subtitle: data.subtitle ?? undefined,
    buttonLabel: data.buttonLabel ?? undefined,
    buttonHref: data.buttonHref ?? undefined,
  };
};

const toButtonBlock = (label?: string | null, href?: string | null) => {
  if (!label || !href) return null;
  return {
    blockType: "buttonBlock",
    label,
    href,
  };
};

export default async function migrateLayout(payload: Payload) {
  const updates: string[] = [];
  const updateGlobalBoth = async (slug: string, blocks: LayoutBlock[]) => {
    await payload.updateGlobal({ slug, data: { layout: blocks }, draft: true });
    await payload.updateGlobal({ slug, data: { layout: blocks }, draft: false });
  };

  // ----- Globals -----
  const home = await payload.findGlobal({ slug: "home-page", depth: 0 });
  if (home && isLayoutEmpty((home as any).layout)) {
    const blocks: LayoutBlock[] = [];
    const hero = toHeroBlock({
      title: (home as any).heroTitle,
      subtitle: (home as any).heroSubtitle,
      buttonLabel: (home as any).heroButtonLabel,
      buttonHref: (home as any).heroButtonHref,
    });
    if (hero) blocks.push(hero);

    const purposeTitle = (home as any).purposeTitle ?? "";
    const purposeBody = (home as any).purposeBody;
    const purposeSection = toSectionTitle(purposeTitle, null);
    if (purposeSection) blocks.push(purposeSection);
    const purposeRich = toRichTextBlock(purposeBody) || toTextBlock(purposeBody);
    if (purposeRich) blocks.push(purposeRich);

    const goalsTitle = (home as any).goalsTitle ?? "";
    const goalsIntro = (home as any).goalsIntroRich ?? (home as any).goalsIntro;
    const goalsList = Array.isArray((home as any).goals)
      ? (home as any).goals.map((g: any) => ({ text: g?.item ?? "" })).filter((g: any) => g.text)
      : [];
    const goalsSection = toSectionTitle(goalsTitle, null);
    if (goalsSection) blocks.push(goalsSection);
    const goalsIntroBlock = toRichTextBlock(goalsIntro) || toTextBlock(goalsIntro);
    if (goalsIntroBlock) blocks.push(goalsIntroBlock);
    const goalsListBlock = toListBlock(goalsList, "unordered");
    if (goalsListBlock) blocks.push(goalsListBlock);

    const gsTitle = (home as any).gettingStartedTitle ?? "";
    const gsBody = (home as any).gettingStartedBody;
    const gsSteps = Array.isArray((home as any).gettingStartedSteps)
      ? (home as any).gettingStartedSteps.map((s: any) => ({ text: s?.step ?? "" })).filter((s: any) => s.text)
      : [];
    const gsSection = toSectionTitle(gsTitle, null);
    if (gsSection) blocks.push(gsSection);
    const gsBodyBlock = toRichTextBlock(gsBody) || toTextBlock(gsBody);
    if (gsBodyBlock) blocks.push(gsBodyBlock);
    const gsStepsBlock = toListBlock(gsSteps, "ordered");
    if (gsStepsBlock) blocks.push(gsStepsBlock);

    const cta = toButtonBlock((home as any).heroButtonLabel, (home as any).heroButtonHref);
    if (cta) blocks.push(cta);

    if (blocks.length) {
      await updateGlobalBoth("home-page", blocks);
      updates.push("home-page");
    }
  }

  const resources = await payload.findGlobal({ slug: "resources-page", depth: 0 });
  if (resources && isLayoutEmpty((resources as any).layout)) {
    const blocks: LayoutBlock[] = [];
    const hero = toSectionTitle((resources as any).heroTitle ?? "", (resources as any).heroIntro ?? null);
    if (hero) blocks.push(hero);

    const sections = Array.isArray((resources as any).sections) ? (resources as any).sections : [];
    sections.forEach((section: any) => {
      blocks.push({
        blockType: "resourcesList",
        title: section?.title ?? "Resources",
        description: section?.description ?? undefined,
        resources: Array.isArray(section?.resources) ? section.resources : [],
      });
    });

    if (blocks.length) {
      await updateGlobalBoth("resources-page", blocks);
      updates.push("resources-page");
    }
  }

  const contact = await payload.findGlobal({ slug: "contact-page", depth: 0 });
  if (contact && isLayoutEmpty((contact as any).layout)) {
    const blocks: LayoutBlock[] = [];
    const hero = toSectionTitle((contact as any).heroTitle ?? "", (contact as any).heroIntro ?? null);
    if (hero) blocks.push(hero);

    blocks.push({
      blockType: "contactsList",
      title: "Contacts",
      groupByCategory: true,
      contacts: Array.isArray((contact as any).contacts) ? (contact as any).contacts : [],
    });

    if (blocks.length) {
      await updateGlobalBoth("contact-page", blocks);
      updates.push("contact-page");
    }
  }

  const gettingStarted = await payload.findGlobal({ slug: "getting-started", depth: 0 });
  if (gettingStarted && isLayoutEmpty((gettingStarted as any).layout)) {
    const blocks: LayoutBlock[] = [];
    const hero = toSectionTitle((gettingStarted as any).title ?? "", null);
    if (hero) blocks.push(hero);

    const intro = (gettingStarted as any).intro;
    const introBlock = toRichTextBlock(intro) || toTextBlock(intro);
    if (introBlock) blocks.push(introBlock);

    const steps = Array.isArray((gettingStarted as any).steps)
      ? (gettingStarted as any).steps
      : [];
    if (steps.length) {
      blocks.push({
        blockType: "stepsList",
        title: "Steps",
        steps,
      });
    }

    const resourcesList = Array.isArray((gettingStarted as any).resources)
      ? (gettingStarted as any).resources.map((r: any) => ({
          title: r?.label ?? "",
          description: undefined,
          url: r?.url ?? "",
          type: "link",
        }))
      : [];
    if (resourcesList.length) {
      blocks.push({
        blockType: "resourcesList",
        title: "Helpful Resources",
        resources: resourcesList,
      });
    }

    if (blocks.length) {
      await updateGlobalBoth("getting-started", blocks);
      updates.push("getting-started");
    }
  }

  // ----- Collections -----
  const migrateCollection = async (slug: "classes" | "chapters" | "lessons") => {
    let page = 1;
    const limit = 100;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await payload.find({
        collection: slug,
        limit,
        page,
        depth: 2,
      });

      if (!res.docs.length) break;

      for (const doc of res.docs) {
        const raw = doc as any;
        if (!isLayoutEmpty(raw.layout)) continue;

        const blocks: LayoutBlock[] = [];

        if (slug === "classes") {
          const description = raw.description;
          if (description) {
            const titleBlock = toSectionTitle("Overview", null);
            if (titleBlock) blocks.push(titleBlock);
            const textBlock = toTextBlock(description);
            if (textBlock) blocks.push(textBlock);
          }
        }

        if (slug === "chapters") {
          const objective = raw.objective;
          if (objective) {
            const titleBlock = toSectionTitle("Chapter Objectives", null);
            if (titleBlock) blocks.push(titleBlock);
            const bodyBlock = toRichTextBlock(objective) || toTextBlock(objective);
            if (bodyBlock) blocks.push(bodyBlock);
          }
        }

        if (slug === "lessons") {
          const video = raw.video;
          const textContent = raw.textContent;
          if (video) {
            blocks.push({
              blockType: "videoBlock",
              video,
            });
          }
          if (textContent) {
            const bodyBlock = toRichTextBlock(textContent) || toTextBlock(textContent);
            if (bodyBlock) blocks.push(bodyBlock);
          }
        }

        if (!blocks.length) continue;

        await payload.update({
          collection: slug,
          id: raw.id,
          data: { layout: blocks },
          draft: true,
        });
        await payload.update({
          collection: slug,
          id: raw.id,
          data: { layout: blocks },
          draft: false,
        });
        updates.push(`${slug}:${raw.id}`);
      }

      if (page * limit >= res.totalDocs) break;
      page += 1;
    }
  };

  await migrateCollection("classes");
  await migrateCollection("chapters");
  await migrateCollection("lessons");

  if (updates.length) {
    payload.logger.info(`Layout migration updated: ${updates.join(", ")}`);
  } else {
    payload.logger.info("Layout migration found nothing to update.");
  }
}
