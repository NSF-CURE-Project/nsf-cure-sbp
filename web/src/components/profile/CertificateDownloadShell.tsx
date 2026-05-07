"use client";

import { DownloadCertificateButton } from "@/components/profile/DownloadCertificateButton";

type CertificateDownloadShellProps = {
  classroomId: string;
  classroomTitle: string;
  classTitle: string;
  completionRate: number;
};

export function CertificateDownloadShell({
  classroomId,
  classroomTitle,
  classTitle,
  completionRate,
}: CertificateDownloadShellProps) {
  const completionPercent = Math.max(
    0,
    Math.min(100, Math.round((completionRate || 0) * 100))
  );

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,72ch)] px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-border/60 bg-card/50 p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Certificate
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">{classroomTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{classTitle}</p>

        <div className="mt-4 inline-flex items-center rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
          {completionPercent}% complete
        </div>

        {completionRate < 1 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Complete all lessons to unlock your certificate.
          </p>
        ) : (
          <div className="mt-4">
            <DownloadCertificateButton classroomId={classroomId} />
          </div>
        )}
      </section>
    </main>
  );
}
