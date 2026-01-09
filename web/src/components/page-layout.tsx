import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { PayloadRichText } from "@/components/ui/payloadRichText";
import type { PageLayoutBlock } from "@/lib/payloadSdk/types";

const CMS_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

const resolveMediaUrl = (media?: unknown): string | null => {
  if (!media) return null;
  if (typeof media === "string") {
    return media.startsWith("http") ? media : `${CMS_URL}${media}`;
  }
  if (typeof media === "object" && "url" in media) {
    const url = (media as { url?: string }).url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${CMS_URL}${url}`;
  }
  return null;
};

const resolveContactPhoto = (photo?: unknown): string | null =>
  resolveMediaUrl(photo);

const VIDEO_SNAP_WIDTHS = [480, 720, 960];

type SectionTitleSize = "sm" | "md" | "lg";

const getTitleTag = (size?: SectionTitleSize) => {
  if (size === "lg") return "h2";
  if (size === "sm") return "h4";
  return "h3";
};

const getTitleClass = (size?: SectionTitleSize) => {
  if (size === "lg") return "text-3xl";
  if (size === "sm") return "text-lg";
  return "text-2xl";
};

const isRichTextValue = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object";

const renderText = (value?: string) =>
  value ? <p className="text-foreground leading-7">{value}</p> : null;

const renderRichTextOrText = (value?: unknown, className?: string) => {
  if (!value) return null;
  if (isRichTextValue(value)) {
    return (
      <PayloadRichText
        content={value as Parameters<typeof PayloadRichText>[0]["content"]}
        className={
          className ??
          "prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
        }
      />
    );
  }
  if (typeof value === "string") {
    return <div className="text-muted-foreground leading-7">{value}</div>;
  }
  return null;
};

const getSnappedWidth = (current: number, max: number) => {
  const candidates = VIDEO_SNAP_WIDTHS.filter((width) => width <= max);
  const options = candidates.length ? candidates : [max];
  if (max && !options.includes(max)) {
    options.push(max);
  }
  return options.reduce((closest, width) => {
    return Math.abs(width - current) < Math.abs(closest - current)
      ? width
      : closest;
  }, options[0]);
};

function SnappingVideo({
  url,
  caption,
}: {
  url: string;
  caption?: string | null;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [snappedWidth, setSnappedWidth] = useState<number | null>(null);

  const snapToNearest = useCallback(() => {
    const frame = frameRef.current;
    if (!frame || !frame.parentElement) return;
    const parentWidth = frame.parentElement.getBoundingClientRect().width;
    const currentWidth = frame.getBoundingClientRect().width;
    const nextWidth = getSnappedWidth(currentWidth, parentWidth);
    setSnappedWidth(nextWidth);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const frame = frameRef.current;
      if (!frame || !frame.parentElement) return;
      const parentWidth = frame.parentElement.getBoundingClientRect().width;
      if (snappedWidth && snappedWidth > parentWidth) {
        setSnappedWidth(getSnappedWidth(parentWidth, parentWidth));
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [snappedWidth]);

  return (
    <section className="space-y-3">
      <div
        ref={frameRef}
        className="w-full min-w-[280px] max-w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-muted/50 to-muted/20 p-1 shadow-lg"
        style={{
          resize: "horizontal",
          width: snappedWidth ? `${snappedWidth}px` : undefined,
        }}
        onPointerUp={snapToNearest}
        onMouseUp={snapToNearest}
        onTouchEnd={snapToNearest}
      >
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <video
            src={url}
            controls
            playsInline
            className="h-full w-full object-contain"
            onEnded={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("lesson-progress", {
                    detail: { type: "video-ended" },
                  })
                );
              }
            }}
          />
        </div>
      </div>
      {caption && <p className="text-sm text-muted-foreground">{caption}</p>}
    </section>
  );
}

export function PageLayout({
  blocks,
  className = "space-y-10",
  heroLogo,
}: {
  blocks?: PageLayoutBlock[] | null;
  className?: string;
  heroLogo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  };
}) {
  if (!blocks?.length) return null;
  let heroLogoRendered = false;

  return (
    <div className={className}>
      {blocks.map((block, idx) => {
        if (block.blockType === "heroBlock") {
          const shouldShowLogo = heroLogo && !heroLogoRendered;
          if (shouldShowLogo) {
            heroLogoRendered = true;
          }
          return (
            <section key={block.id ?? idx} className="space-y-4">
              <div className="flex items-center gap-3">
                {shouldShowLogo ? (
                  <Image
                    src={heroLogo.src}
                    alt={heroLogo.alt}
                    width={heroLogo.width ?? 48}
                    height={heroLogo.height ?? 48}
                    className={
                      heroLogo.className ?? "h-10 w-auto opacity-80 grayscale"
                    }
                  />
                ) : null}
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  {block.title}
                </h1>
              </div>
              {block.subtitle && (
                <p className="text-muted-foreground leading-7">
                  {block.subtitle}
                </p>
              )}
              {block.buttonLabel && block.buttonHref && (
                <a
                  href={block.buttonHref}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-md font-medium bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200"
                >
                  {block.buttonLabel}
                </a>
              )}
            </section>
          );
        }

        if (block.blockType === "sectionTitle") {
          const TitleTag = getTitleTag(block.size);
          const titleClass = getTitleClass(block.size);
          return (
            <section key={block.id ?? idx} className="space-y-2">
              <TitleTag className={`${titleClass} font-semibold`}>
                {block.title}
              </TitleTag>
              {block.subtitle && (
                <p className="text-muted-foreground leading-7">
                  {block.subtitle}
                </p>
              )}
            </section>
          );
        }

        if (block.blockType === "sectionBlock") {
          const TitleTag = getTitleTag(block.size);
          const titleClass = getTitleClass(block.size);
          return (
            <section key={block.id ?? idx} className="space-y-2">
              <TitleTag className={`${titleClass} font-semibold`}>
                {block.title}
              </TitleTag>
              {block.text &&
                renderRichTextOrText(
                  block.text,
                  "prose dark:prose-invert prose-invert leading-7 max-w-none text-muted-foreground"
                )}
            </section>
          );
        }

        if (block.blockType === "richTextBlock") {
          return (
            <section key={block.id ?? idx}>
              {renderRichTextOrText(
                block.body,
                "prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
              )}
            </section>
          );
        }

        if (block.blockType === "textBlock") {
          return (
            <section key={block.id ?? idx}>{renderText(block.text)}</section>
          );
        }

        if (block.blockType === "videoBlock") {
          const url = resolveMediaUrl(block.video ?? block.url ?? null);
          if (!url) return null;
          return (
            <SnappingVideo
              key={block.id ?? idx}
              url={url}
              caption={block.caption}
            />
          );
        }

        if (block.blockType === "listBlock") {
          const items = block.items ?? [];
          const ordered = block.listStyle === "ordered";
          const ListTag = ordered ? "ol" : "ul";
          const listClass = ordered ? "list-decimal" : "list-disc";
          return (
            <section key={block.id ?? idx} className="space-y-3">
              {block.title && (
                <h2 className="text-2xl font-semibold">{block.title}</h2>
              )}
              {items.length ? (
                <ListTag className={`${listClass} pl-6 space-y-1`}>
                  {items.map((item, itemIdx) => (
                    <li key={item.id ?? itemIdx}>{item.text}</li>
                  ))}
                </ListTag>
              ) : (
                <p className="text-sm text-muted-foreground">No items yet.</p>
              )}
            </section>
          );
        }

        if (block.blockType === "stepsList") {
          const steps = block.steps ?? [];
          return (
            <section key={block.id ?? idx} className="space-y-6">
              {block.title && (
                <h2 className="text-2xl font-semibold">{block.title}</h2>
              )}
              {steps.length ? (
                <ol className="list-decimal pl-6 space-y-4 text-foreground">
                  {steps.map((step, stepIdx) => (
                    <li key={step.id ?? stepIdx} className="space-y-2">
                      <div className="text-lg font-semibold">
                        {step.heading}
                      </div>
                      {renderRichTextOrText(
                        step.description,
                        "prose dark:prose-invert prose-invert leading-7 max-w-none text-muted-foreground"
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No steps yet.</p>
              )}
            </section>
          );
        }

        if (block.blockType === "buttonBlock") {
          return (
            <section key={block.id ?? idx}>
              <a
                href={block.href}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-md font-medium bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200"
              >
                {block.label}
              </a>
            </section>
          );
        }

        if (block.blockType === "resourcesList") {
          const resources = block.resources ?? [];
          return (
            <section key={block.id ?? idx} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {block.title ?? "Resources"}
                </h2>
                {block.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {block.description}
                  </p>
                )}
              </div>
              <ul className="space-y-3">
                {resources.length ? (
                  resources.map((item, itemIdx) => (
                    <li
                      key={item.id ?? itemIdx}
                      className="rounded-lg border border-border/60 bg-card/60 px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold leading-tight">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {item.type ?? "link"}
                        </span>
                      </div>
                      <a
                        href={item.url}
                        className="mt-2 inline-flex text-primary text-sm underline underline-offset-4 hover:no-underline"
                      >
                        Open
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">
                    No resources yet.
                  </li>
                )}
              </ul>
            </section>
          );
        }

        if (block.blockType === "contactsList") {
          const contacts = block.contacts ?? [];
          const groupByCategory = block.groupByCategory !== false;
          const staff = contacts.filter(
            (c) => (c.category ?? "").toLowerCase() === "staff"
          );
          const technical = contacts.filter(
            (c) => (c.category ?? "").toLowerCase() === "technical"
          );
          const other = contacts.filter(
            (c) =>
              !["staff", "technical"].includes((c.category ?? "").toLowerCase())
          );
          const sections = groupByCategory
            ? [
                { label: "Staff Contact Information", items: staff },
                {
                  label: "Technical Staff Contact Information",
                  items: technical,
                },
                { label: "Other Contacts", items: other },
              ].filter((section) => section.items.length > 0)
            : [{ label: block.title ?? "Contacts", items: contacts }];
          return (
            <section key={block.id ?? idx} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {block.title ?? "Contacts"}
                </h2>
                {block.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {block.description}
                  </p>
                )}
              </div>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No contact information available.
                </p>
              ) : (
                <div className="space-y-8">
                  {sections.map((section, sectionIdx) => (
                    <section key={sectionIdx} className="space-y-4">
                      {groupByCategory && (
                        <h3 className="text-lg font-semibold tracking-tight text-foreground/90">
                          {section.label}
                        </h3>
                      )}
                      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {section.items.map((person, personIdx) => {
                          const photoUrl = resolveContactPhoto(person.photo);
                          return (
                            <div
                              key={person.id ?? personIdx}
                              className="rounded-lg border border-border/40 bg-muted/20 backdrop-blur-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all duration-200 hover:bg-muted/30"
                            >
                              {photoUrl ? (
                                <div className="w-32 h-32 relative mb-4">
                                  <Image
                                    src={photoUrl}
                                    alt={person.name}
                                    fill
                                    className="object-cover rounded-full border border-border/40"
                                  />
                                </div>
                              ) : (
                                <div className="w-32 h-32 mb-4 rounded-full bg-muted flex items-center justify-center text-3xl">
                                  👤
                                </div>
                              )}

                              <h3 className="text-xl font-semibold mb-1">
                                {person.name}
                              </h3>

                              {person.title && (
                                <p className="text-sm font-bold text-foreground mb-2">
                                  {person.title}
                                </p>
                              )}

                              {person.email && (
                                <p className="text-sm text-muted-foreground">
                                  <a
                                    href={`mailto:${person.email}`}
                                    className="hover:text-foreground transition-colors"
                                  >
                                    {person.email}
                                  </a>
                                </p>
                              )}

                              {person.phone && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  <a
                                    href={`tel:${person.phone}`}
                                    className="hover:text-foreground transition-colors"
                                  >
                                    {person.phone}
                                  </a>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
