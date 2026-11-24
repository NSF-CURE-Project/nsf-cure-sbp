import {
  BookOpen,
  LineChart,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: BookOpen,
    title: "Learn at your own pace",
    description: "Access course materials and interactive engineering practice.",
  },
  {
    icon: LineChart,
    title: "Track your progress",
    description: "Stay organized with assignments and learning milestones.",
  },
  {
    icon: MessageCircle,
    title: "Stay connected",
    description: "Access classrooms, ask questions, and find program resources.",
  },
];

type StudentPortalIntroProps = {
  className?: string;
};

export function StudentPortalIntro({ className }: StudentPortalIntroProps) {
  return (
    <div
      className={
        className ??
        "flex h-full flex-col justify-center gap-6 py-2 md:gap-7 md:py-2 lg:gap-8 lg:py-4"
      }
    >
      <div className="space-y-3.5 md:space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Student portal
        </p>
        <div className="space-y-3 md:space-y-3.5">
          <h1 className="max-w-[16ch] text-balance text-[2rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-[2.25rem] lg:text-[2.45rem]">
            Your learning, all in one place.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
            Access course materials, complete assignments, and track your
            progress throughout the Summer Bridge Program.
          </p>
        </div>
      </div>

      <ul
        className="hidden space-y-4 lg:block"
        aria-label="Student portal features"
      >
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-3">
            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-primary">
              <Icon className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-semibold leading-snug text-foreground">
                {title}
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
