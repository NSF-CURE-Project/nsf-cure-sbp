"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FooterProps = {
  contentOffsetClassName?: string;
};

export default function Footer({ contentOffsetClassName }: FooterProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const payloadUrl =
        process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";
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
            <div>
              <h3 className="font-semibold text-foreground mb-3">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/learning" className="hover:underline">
                    Learning
                  </Link>
                </li>
                <li>
                  <Link href="/directory" className="hover:underline">
                    Directory
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:underline">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact / Branding */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:cnsfcuresbp@gmail.com"
                    className="hover:underline"
                  >
                    nsfcuresbp@gmail.com
                  </a>
                </li>
                <li>3801 W Temple Ave, Pomona, CA 91768</li>
                <li>
                  <a
                    href="https://www.cpp.edu/engineering/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    College of Engineering
                  </a>
                </li>
              </ul>
            </div>

            {/* Feedback */}
            <div className="sm:justify-self-start">
              <h3 className="font-semibold text-foreground mb-3">Feedback</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Share ideas, report issues, or tell us what to improve.
              </p>
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg border-border/60 bg-background/60 text-xs font-semibold"
                  >
                    Open feedback
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
                      Share feedback
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Let us know what’s working and where we can improve.
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
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground/80">
            <div>
              <p>
                © {new Date().getFullYear()} Cal Poly Pomona Engineering — NSF
                CURE Summer Bridge Program
              </p>
              <p className="mt-1">
                Built using Next.js, Tailwind CSS, and Payload.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
