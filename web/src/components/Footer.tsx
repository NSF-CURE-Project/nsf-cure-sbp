"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePayloadLivePreview } from "@/components/live-preview/usePayloadLivePreview";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

type FooterProps = {
  contentOffsetClassName?: string;
};

type FooterLink = {
  label?: string | null;
  href?: string | null;
};

type FooterData = {
  exploreLinks?: FooterLink[] | null;
  resourcesLinks?: FooterLink[] | null;
  connect?: {
    email?: string | null;
    address?: string | null;
    externalLabel?: string | null;
    externalUrl?: string | null;
  } | null;
  feedback?: {
    enabled?: boolean | null;
    title?: string | null;
    description?: string | null;
    buttonLabel?: string | null;
  } | null;
  bottom?: {
    copyrightLine?: string | null;
    subLine?: string | null;
  } | null;
};

const defaultFooter: FooterData = {
  exploreLinks: [
    { label: "Home", href: "/" },
    { label: "Learning", href: "/learning" },
    { label: "Directory", href: "/directory" },
  ],
  resourcesLinks: [
    { label: "FAQ", href: "/faq" },
    { label: "Resources", href: "/resources" },
  ],
  connect: {
    email: "nsfcuresbp@gmail.com",
    address: "3801 W Temple Ave, Pomona, CA\n91768",
    externalLabel: "College of Engineering",
    externalUrl: "https://www.cpp.edu/engineering/",
  },
  feedback: {
    enabled: true,
    title: "Feedback",
    description: "Share ideas, report issues, or tell us what to improve.",
    buttonLabel: "Open feedback",
  },
  bottom: {
    copyrightLine:
      "© {year} Cal Poly Pomona Engineering — NSF CURE Summer Bridge Program",
    subLine: "Built using Next.js, Tailwind CSS, and Payload.",
  },
};

const isExternalHref = (href?: string | null) =>
  Boolean(href && (href.startsWith("http") || href.startsWith("mailto:")));

export default function Footer({ contentOffsetClassName }: FooterProps) {
  const [footer, setFooter] = useState<FooterData | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadFooter = async () => {
      try {
        const payloadUrl = getPayloadBaseUrl();
        const res = await fetch(`${payloadUrl}/api/globals/footer`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const body = await res.json();
        const next = (body?.global ?? body) as FooterData;
        if (active) {
          setFooter(next);
        }
      } catch {
        if (active) {
          setFooter(null);
        }
      }
    };

    loadFooter();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const payloadUrl = getPayloadBaseUrl();
      const res = await fetch(`${payloadUrl}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim() || undefined,
          message: message.trim(),
          pageUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not send feedback.");
      }

      setEmail("");
      setMessage("");
      setSuccess("Thanks! Your feedback was sent.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const markdownSupported = false;
  const year = new Date().getFullYear();
  const previewData = usePayloadLivePreview(footer, { globalSlug: "footer" });
  const content = useMemo(() => {
    const exploreLinks =
      previewData?.exploreLinks && previewData.exploreLinks.length
        ? previewData.exploreLinks
        : defaultFooter.exploreLinks;
    const resourcesLinks =
      previewData?.resourcesLinks && previewData.resourcesLinks.length
        ? previewData.resourcesLinks
        : defaultFooter.resourcesLinks;
    const connect = {
      ...defaultFooter.connect,
      ...(previewData?.connect ?? {}),
    };
    const feedback = {
      ...defaultFooter.feedback,
      ...(previewData?.feedback ?? {}),
    };
    const bottom = {
      ...defaultFooter.bottom,
      ...(previewData?.bottom ?? {}),
    };

    return { exploreLinks, resourcesLinks, connect, feedback, bottom };
  }, [previewData]);

  const addressLines = (content.connect?.address ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <footer className="w-full border-t bg-muted/30 text-sm text-muted-foreground">
      <div className="w-full">
        <div
          className={cn(
            "mx-auto w-full max-w-6xl px-4 py-10 pb-6 sm:px-6 lg:px-8",
            contentOffsetClassName
          )}
        >
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-4 sm:justify-items-center">
            {/* Site links */}
            <div className="text-center sm:text-left">
              <h2 className="font-semibold text-foreground mb-3">Explore</h2>
              <ul className="space-y-2">
                {(content.exploreLinks ?? []).map((link, index) => {
                  const href = link?.href ?? "#";
                  const label = link?.label ?? "Untitled";
                  const external = isExternalHref(href);
                  return (
                    <li key={`${label}-${index}`}>
                      {external ? (
                        <a
                          href={href}
                          className="hover:underline"
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel={
                            href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {label}
                        </a>
                      ) : (
                        <Link href={href} className="hover:underline">
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Resources */}
            <div className="text-center sm:text-left">
              <h2 className="font-semibold text-foreground mb-3">Resources</h2>
              <ul className="space-y-2">
                {(content.resourcesLinks ?? []).map((link, index) => {
                  const href = link?.href ?? "#";
                  const label = link?.label ?? "Untitled";
                  const external = isExternalHref(href);
                  return (
                    <li key={`${label}-${index}`}>
                      {external ? (
                        <a
                          href={href}
                          className="hover:underline"
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel={
                            href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {label}
                        </a>
                      ) : (
                        <Link href={href} className="hover:underline">
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact / Branding */}
            <div className="text-center sm:text-left">
              <h2 className="font-semibold text-foreground mb-3">Connect</h2>
              <ul className="space-y-2">
                {content.connect?.email ? (
                  <li>
                    <a
                      href={`mailto:${content.connect.email}`}
                      className="hover:underline"
                    >
                      {content.connect.email}
                    </a>
                  </li>
                ) : null}
                {addressLines.length ? (
                  <li>
                    {addressLines.map((line, index) => (
                      <div key={`${line}-${index}`}>{line}</div>
                    ))}
                  </li>
                ) : null}
                {content.connect?.externalUrl ? (
                  <li>
                    <a
                      href={content.connect.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {content.connect.externalLabel ??
                        content.connect.externalUrl}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>

            {/* Feedback */}
            {content.feedback?.enabled !== false ? (
              <div className="text-center sm:text-left sm:justify-self-start">
                <h2 className="font-semibold text-foreground mb-3">
                  {content.feedback?.title ?? "Feedback"}
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  {content.feedback?.description ??
                    "Share ideas, report issues, or tell us what to improve."}
                </p>
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg border-border/60 bg-background/60 text-xs font-semibold mx-auto sm:mx-0"
                    >
                      {content.feedback?.buttonLabel ?? "Open feedback"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="end"
                    sideOffset={8}
                    className="w-[min(92vw,360px)] rounded-xl border border-border/70 bg-background p-4 shadow-xl"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {content.feedback?.title ?? "Share feedback"}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {content.feedback?.description ??
                          "Let us know what’s working and where we can improve."}
                      </p>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <label
                          className="sr-only"
                          htmlFor="footer-feedback-email"
                        >
                          Email address (optional)
                        </label>
                        <Input
                          id="footer-feedback-email"
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          disabled={sending}
                          className="rounded-xl border-border/70 bg-background shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          className="sr-only"
                          htmlFor="footer-feedback-message"
                        >
                          Feedback
                        </label>
                        <Textarea
                          id="footer-feedback-message"
                          rows={6}
                          placeholder="Your feedback..."
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          disabled={sending}
                          className="rounded-xl border-border/70 bg-background shadow-sm"
                        />
                        {markdownSupported ? (
                          <div className="flex justify-end text-xs text-muted-foreground">
                            Markdown supported.
                          </div>
                        ) : (
                          <div className="flex justify-end text-xs text-muted-foreground">
                            Plain text only.
                          </div>
                        )}
                      </div>

                      {error ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          {error}
                        </div>
                      ) : null}
                      {success ? (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                          {success}
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="h-8 w-8 rounded-full border border-border/60 bg-background text-base text-muted-foreground"
                            aria-label="Reaction: confused"
                          >
                            😕
                          </button>
                          <button
                            type="button"
                            className="h-8 w-8 rounded-full border border-border/60 bg-background text-base text-muted-foreground"
                            aria-label="Reaction: neutral"
                          >
                            😐
                          </button>
                          <button
                            type="button"
                            className="h-8 w-8 rounded-full border border-border/60 bg-background text-base text-muted-foreground"
                            aria-label="Reaction: happy"
                          >
                            🙂
                          </button>
                          <button
                            type="button"
                            className="h-8 w-8 rounded-full border border-border/60 bg-background text-base text-muted-foreground"
                            aria-label="Reaction: delighted"
                          >
                            😍
                          </button>
                        </div>
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={sending || !message.trim()}
                          className="rounded-lg px-5"
                        >
                          {sending ? "Sending..." : "Send"}
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground/80">
            <div>
              <p>
                {(content.bottom?.copyrightLine ??
                  defaultFooter.bottom?.copyrightLine ??
                  "")
                  .replace("{year}", String(year))
                  .trim()}
              </p>
              {content.bottom?.subLine ? (
                <p className="mt-1">{content.bottom.subLine}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
