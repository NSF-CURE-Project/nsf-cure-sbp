"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type DownloadCertificateButtonProps = {
  classroomId: string | number;
};

export function DownloadCertificateButton({
  classroomId,
}: DownloadCertificateButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/classrooms/${classroomId}/certificate`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Unable to download certificate.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = "certificate.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download certificate."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2">
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={handleDownload}
        disabled={busy}
      >
        {busy ? "Preparing..." : "Download certificate"}
      </Button>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
