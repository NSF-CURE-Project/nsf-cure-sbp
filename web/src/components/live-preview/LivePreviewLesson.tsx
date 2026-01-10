"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import type { LessonDoc, PageLayoutBlock } from "@/lib/payloadSdk/types";
import { usePayloadLivePreview } from "./usePayloadLivePreview";
import { LessonQuestionDrawer } from "@/components/questions/LessonQuestionDrawer";
import { LessonQuestionList } from "@/components/questions/LessonQuestionList";
import { LessonProgressControls } from "@/components/progress/LessonProgressControls";
import { LessonHelpfulFeedback } from "@/components/lessons/LessonHelpfulFeedback";

type Props = {
  initialData: LessonDoc | null;
  className?: string;
  lessonNav?: {
    lessons: { slug: string; title: string }[];
    currentSlug?: string;
    hrefPrefix: string;
  };
};

export function LivePreviewLesson({
  initialData,
  className,
  lessonNav,
}: Props) {
  const data = usePayloadLivePreview(initialData, {
    collectionSlug: "lessons",
  });
  const [questionRefresh, setQuestionRefresh] = useState(0);
  const title = data?.title ?? "Untitled lesson";
  const updatedAt = data?.updatedAt || data?.createdAt || null;
  const blocks = Array.isArray(data?.layout)
    ? (data?.layout as PageLayoutBlock[])
    : [];
  const lessonSlug = data?.slug ?? lessonNav?.currentSlug;
  const normalizedNav = useMemo(() => {
    if (!lessonNav?.lessons?.length) return null;
    const lessons = lessonNav.lessons.filter((item) => item.slug);
    if (lessons.length < 2) return null;
    const currentIndex = lessonSlug
      ? lessons.findIndex((item) => item.slug === lessonSlug)
      : -1;
    return {
      lessons,
      currentIndex,
      hrefPrefix: lessonNav.hrefPrefix,
    };
  }, [lessonNav, lessonSlug]);

  const navTop = normalizedNav ? (
    <LessonNavSimple
      lessons={normalizedNav.lessons}
      currentIndex={normalizedNav.currentIndex}
      hrefPrefix={normalizedNav.hrefPrefix}
      placement="top"
    />
  ) : null;
  const navBottom = normalizedNav ? (
    <LessonNavSimple
      lessons={normalizedNav.lessons}
      currentIndex={normalizedNav.currentIndex}
      hrefPrefix={normalizedNav.hrefPrefix}
      placement="bottom"
      extraContent={
        data?.id ? (
          <LessonProgressControls
            lessonId={String(data.id)}
            lessonTitle={title}
          />
        ) : null
      }
    />
  ) : null;

  return (
    <article className={className}>
      {navTop}
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {updatedAt && (
        <p className="text-sm text-muted-foreground mb-6">
          Last updated {formatDate(updatedAt)}
        </p>
      )}
      {blocks.length > 0 ? (
        <PageLayout blocks={blocks} className="space-y-10" />
      ) : (
        <p className="text-sm text-muted-foreground">
          No content yet. Add blocks to this lesson.
        </p>
      )}
      {data?.id ? (
        <>
          <LessonQuestionDrawer
            lessonId={String(data.id)}
            lessonTitle={title}
            onSubmitted={() => setQuestionRefresh((value) => value + 1)}
          />
          <LessonQuestionList
            lessonId={String(data.id)}
            refreshKey={questionRefresh}
          />
        </>
      ) : null}
      {navBottom}
      {data?.id ? <LessonHelpfulFeedback lessonId={String(data.id)} /> : null}
    </article>
  );
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type LessonNavSimpleProps = {
  lessons: { slug: string; title: string }[];
  currentIndex: number;
  hrefPrefix: string;
  placement: "top" | "bottom";
  extraContent?: React.ReactNode;
};

function LessonNavSimple({
  lessons,
  currentIndex,
  hrefPrefix,
  placement,
  extraContent,
}: LessonNavSimpleProps) {
  const prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;

  return (
    <div
      className={
        placement === "top"
          ? "mb-2 border-b border-border/60 pb-3"
          : "mt-4 border-t border-border/60 pt-2"
      }
    >
      {placement === "bottom" ? (
        <div className="mb-4">{extraContent}</div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {prev ? (
          <Link
            href={`${hrefPrefix}/${prev.slug}`}
            className="group inline-flex items-center gap-3 text-left"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground transition group-hover:-translate-x-0.5 group-hover:text-foreground" />
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Previous
              </div>
              <div className="text-base font-semibold text-foreground transition group-hover:text-foreground/90">
                {prev.title}
              </div>
            </div>
          </Link>
        ) : (
          <div className="inline-flex items-center gap-3 text-left text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
            <div className="text-sm">No previous lesson</div>
          </div>
        )}

        {next ? (
          <Link
            href={`${hrefPrefix}/${next.slug}`}
            className="group inline-flex items-center gap-3 text-right sm:ml-auto"
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Next
              </div>
              <div className="text-base font-semibold text-foreground transition group-hover:text-foreground/90">
                {next.title}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ) : (
          <div className="inline-flex items-center gap-3 text-right text-muted-foreground sm:ml-auto">
            <div className="text-sm">No more lessons</div>
            <ChevronRight className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
