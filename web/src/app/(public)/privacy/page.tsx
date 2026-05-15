import Link from "next/link";
import { Shield } from "lucide-react";

import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How NSF CURE SBP collects, uses, stores, and protects participant data.",
  path: "/privacy",
});

const LAST_UPDATED = "May 14, 2026";
const CONTACT_EMAIL = "sbp@cpp.edu";

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section
    id={id}
    className="scroll-mt-24 rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-7"
  >
    <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
    <div className="mt-3 space-y-3 text-[14.5px] leading-7 text-foreground/85">
      {children}
    </div>
  </section>
);

const SECTIONS: Array<{ id: string; title: string }> = [
  { id: "overview", title: "Overview" },
  { id: "what-we-collect", title: "What we collect" },
  { id: "how-we-use-it", title: "How we use it" },
  { id: "who-sees-it", title: "Who can see it" },
  { id: "where-stored", title: "Where it's stored" },
  { id: "cookies", title: "Cookies" },
  { id: "retention", title: "Retention" },
  { id: "your-rights", title: "Your rights" },
  { id: "children", title: "Minors" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-[var(--content-max,80ch)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <Shield className="h-3.5 w-3.5" aria-hidden="true" />
          Privacy
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated {LAST_UPDATED}
        </p>
      </header>

      <nav
        aria-label="On this page"
        className="mb-8 rounded-xl border border-border/50 bg-background/50 p-4"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          On this page
        </p>
        <ul className="grid gap-1 text-[13.5px] sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-5">
        <Section id="overview" title="Overview">
          <p>
            NSF CURE SBP is an educational platform operated as part of an NSF-funded
            research and curriculum project at California State Polytechnic University,
            Pomona. This policy explains what information we collect when you use the
            site, how we use it, and the choices you have. It applies to all pages
            served under this domain.
          </p>
          <p>
            We do not sell personal data, and we do not load third-party advertising or
            tracking scripts.
          </p>
        </Section>

        <Section id="what-we-collect" title="What we collect">
          <p>We collect only what's needed to run the platform:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>Account information</strong> — name, email address, and the
              password hash used to sign you in.
            </li>
            <li>
              <strong>Participant profile</strong> — optional fields such as
              participant type, organization, project role, and demographic indicators
              (e.g. first-generation or transfer student) that you choose to provide.
              These support NSF research reporting.
            </li>
            <li>
              <strong>Classroom membership</strong> — which classrooms you've joined
              and the join codes you've used.
            </li>
            <li>
              <strong>Learning activity</strong> — lessons completed, quiz attempts,
              and your current and longest streak.
            </li>
            <li>
              <strong>Technical data</strong> — basic server logs (IP address,
              timestamp, request path) generated automatically when you load a page,
              used for security and debugging.
            </li>
          </ul>
        </Section>

        <Section id="how-we-use-it" title="How we use it">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>To keep you signed in and to show your progress across sessions.</li>
            <li>
              To allow instructors and administrators to see student progress within
              their own classrooms.
            </li>
            <li>
              To produce aggregated, de-identified statistics for NSF reporting
              (e.g. participant counts, completion rates).
            </li>
            <li>
              To investigate abuse, security incidents, and bugs through server logs.
            </li>
          </ul>
          <p>
            We do not use your data to train external AI models, and we do not share
            it with advertising networks.
          </p>
        </Section>

        <Section id="who-sees-it" title="Who can see it">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>You</strong> — you can review the data we have on file at any
              time on your{" "}
              <Link
                href="/data-transparency"
                className="text-primary underline-offset-4 hover:underline"
              >
                data transparency
              </Link>{" "}
              page (sign-in required).
            </li>
            <li>
              <strong>Instructors and administrators</strong> — staff for the
              classrooms you join can see your name, email, and your progress within
              those classrooms.
            </li>
            <li>
              <strong>The project team and authorized NSF reviewers</strong> — may
              access data in aggregate form for evaluation and reporting purposes.
            </li>
            <li>
              <strong>Service providers</strong> — our hosting provider (Railway) and
              database provider process data on our behalf under their own security
              and confidentiality terms. They do not use your data for their own
              purposes.
            </li>
          </ul>
        </Section>

        <Section id="where-stored" title="Where it's stored">
          <p>
            Data is stored in a managed PostgreSQL database hosted in the United
            States. Application traffic is served over HTTPS, and passwords are stored
            only as salted hashes — never in plain text.
          </p>
        </Section>

        <Section id="cookies" title="Cookies">
          <p>We use a small number of strictly necessary cookies:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>Session cookie</strong> — keeps you signed in across pages.
            </li>
            <li>
              <strong>UI preference cookies</strong> — remember small choices such as
              whether your sidebar is open and whether you've dismissed the cookie
              notice.
            </li>
          </ul>
          <p>
            We don't use third-party analytics, advertising, or social-media tracking
            cookies. Because these cookies are required for the site to function,
            there's no opt-out — but you can clear them at any time from your
            browser's settings.
          </p>
        </Section>

        <Section id="retention" title="Retention">
          <p>
            Account and learning-activity data is kept while your account remains
            active and for as long as needed for NSF research reporting. Server logs
            are retained for a short rolling window (typically under 30 days) for
            security and debugging.
          </p>
          <p>
            If you would like your account deleted, contact us at the address below
            and we'll remove personally identifying fields. Aggregated, de-identified
            statistics already included in published reporting cannot be reversed.
          </p>
        </Section>

        <Section id="your-rights" title="Your rights">
          <p>You can:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>Access</strong> the personal data we store about you on your{" "}
              <Link
                href="/data-transparency"
                className="text-primary underline-offset-4 hover:underline"
              >
                data transparency
              </Link>{" "}
              page.
            </li>
            <li>
              <strong>Correct</strong> profile fields from your account{" "}
              <Link
                href="/settings"
                className="text-primary underline-offset-4 hover:underline"
              >
                settings
              </Link>
              .
            </li>
            <li>
              <strong>Delete</strong> your account by emailing the address below.
            </li>
            <li>
              <strong>Ask questions</strong> about how your data is used, including
              for residents of California (CCPA/CPRA) and other jurisdictions with
              similar rights.
            </li>
          </ul>
        </Section>

        <Section id="children" title="Minors">
          <p>
            The platform is built for university-level coursework and is not directed
            at children under 13. We don't knowingly collect data from children under
            13. If you believe a minor has created an account, contact us and we'll
            remove the account.
          </p>
        </Section>

        <Section id="changes" title="Changes to this policy">
          <p>
            We may update this policy as the platform evolves. Material changes will
            be reflected in the "Last updated" date at the top of this page, and where
            appropriate we'll surface a notice in the app.
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <p>
            Questions about this policy, or requests related to your data, can be
            sent to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            . You can also{" "}
            <Link
              href="/contact-us"
              className="text-primary underline-offset-4 hover:underline"
            >
              reach the project team
            </Link>{" "}
            through the contact page.
          </p>
        </Section>
      </div>
    </main>
  );
}
