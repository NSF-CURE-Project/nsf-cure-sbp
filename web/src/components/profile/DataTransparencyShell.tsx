import Link from "next/link";

type DataTransparencyShellProps = {
  data: {
    profile: {
      name: string | null;
      email: string | null;
      participantType: string | null;
      organizationName: string | null;
      firstGenCollegeStudent: boolean;
      transferStudent: boolean;
      projectRole: string | null;
    };
    participation: {
      participationStartDate: string | null;
      participationEndDate: string | null;
      contributionSummary: string | null;
      includeInRppr: boolean;
    };
    activity: {
      currentStreak: number;
      longestStreak: number;
    };
    counts: {
      lessonsCompleted: number;
      quizAttempts: number;
    };
  };
};

const renderValue = (value: string | number | boolean | null) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null || value === "") return "Not provided";
  return String(value);
};

export function DataTransparencyShell({ data }: DataTransparencyShellProps) {
  return (
    <main className="mx-auto w-full max-w-[var(--content-max,96ch)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Data transparency
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            What we store about your participation
          </h1>
        </header>

        <section className="rounded-xl border border-border/60 bg-card/50 p-5">
          <h2 className="text-base font-semibold text-foreground">Your Profile Data</h2>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>Name: {renderValue(data.profile.name)}</div>
            <div>Email: {renderValue(data.profile.email)}</div>
            <div>Participant type: {renderValue(data.profile.participantType)}</div>
            <div>Organization: {renderValue(data.profile.organizationName)}</div>
            <div>
              First-generation college student:{" "}
              {renderValue(data.profile.firstGenCollegeStudent)}
            </div>
            <div>Transfer student: {renderValue(data.profile.transferStudent)}</div>
            <div>Project role: {renderValue(data.profile.projectRole)}</div>
          </div>
        </section>

        <section className="rounded-xl border border-border/60 bg-card/50 p-5">
          <h2 className="text-base font-semibold text-foreground">
            Your Participation Data
          </h2>
          <div className="mt-3 grid gap-2 text-sm">
            <div>
              Participation start date:{" "}
              {renderValue(data.participation.participationStartDate)}
            </div>
            <div>
              Participation end date: {renderValue(data.participation.participationEndDate)}
            </div>
            <div>Included in NSF reporting: {renderValue(data.participation.includeInRppr)}</div>
            <div>
              Contribution summary: {renderValue(data.participation.contributionSummary)}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border/60 bg-card/50 p-5">
          <h2 className="text-base font-semibold text-foreground">Your Activity Data</h2>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>Lessons completed: {data.counts.lessonsCompleted}</div>
            <div>Quiz attempts: {data.counts.quizAttempts}</div>
            <div>Current streak: {data.activity.currentStreak}</div>
            <div>Longest streak: {data.activity.longestStreak}</div>
          </div>
        </section>

        <section className="rounded-xl border border-border/60 bg-card/50 p-5 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">
            What this data is used for
          </h2>
          <p className="mt-3">
            This data is reported to the National Science Foundation as part of the
            NSF CURE SBP grant requirements. It is used to measure student
            participation, learning outcomes, and workforce development impact.
          </p>
          <div className="mt-4">
            <Link
              href="/settings/participant-info"
              className="font-semibold text-primary underline underline-offset-4"
            >
              Edit my profile info
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
