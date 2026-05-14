"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileQuestion,
  Sparkles,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/page-layout";
import type { LessonDoc, PageLayoutBlock } from "@/lib/payloadSdk/types";
import { usePayloadLivePreview } from "./usePayloadLivePreview";
import { LessonQuestionDrawer } from "@/components/questions/LessonQuestionDrawer";
import { LessonQuestionList } from "@/components/questions/LessonQuestionList";
import { LessonProgressControls } from "@/components/progress/LessonProgressControls";
import { LessonHelpfulFeedback } from "@/components/lessons/LessonHelpfulFeedback";
import { QuizBlock as QuizBlockComponent } from "@/components/quiz/QuizBlock";
import LessonSidebar from "@/components/lessons/LessonSidebar";
import LessonFinishCard from "@/components/lessons/LessonFinishCard";
import { extractLessonSections } from "@/lib/lessons/toc";

type Props = {
  initialData: LessonDoc | null;
  className?: string;
  lessonNav?: {
    lessons: { slug: string; title: string }[];
    currentSlug?: string;
    hrefPrefix: string;
  };
  breadcrumb?: {
    classTitle?: string | null;
    classSlug?: string | null;
    chapterTitle?: string | null;
    chapterSlug?: string | null;
    chapterNumber?: number | null;
  };
};

export function LivePreviewLesson({
  initialData,
  className,
  lessonNav,
  breadcrumb,
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
  const classId =
    typeof data?.chapter === "object" &&
    data?.chapter !== null &&
    "class" in data.chapter
      ? (() => {
          const classValue = (data.chapter as { class?: unknown }).class;
          if (typeof classValue === "object" && classValue !== null) {
            const id = (classValue as { id?: string | number }).id;
            return id != null ? String(id) : undefined;
          }
          if (typeof classValue === "string" || typeof classValue === "number") {
            return String(classValue);
          }
          return undefined;
        })()
      : undefined;
  const assessment = data?.assessment ?? null;
  const assessmentQuiz = assessment?.quiz ?? null;
  const hasQuizBlock = blocks.some((block) => block.blockType === "quizBlock");
  const assessmentBlock = assessmentQuiz
    ? {
        blockType: "quizBlock" as const,
        quiz: assessmentQuiz,
        showTitle: true,
        showAnswers: assessment?.showAnswers,
        maxAttempts: assessment?.maxAttempts ?? null,
        timeLimitSec: assessment?.timeLimitSec ?? null,
      }
    : null;
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

  const chapterInfo = useMemo(() => {
    const chapter = data?.chapter;
    const chapterRecord =
      typeof chapter === "object" && chapter !== null
        ? (chapter as {
            title?: string;
            slug?: string;
            chapterNumber?: number | null;
            class?: unknown;
          })
        : null;
    const classValue = chapterRecord?.class;
    const classRecord =
      typeof classValue === "object" && classValue !== null
        ? (classValue as { title?: string; slug?: string })
        : null;

    const chapterTitle =
      breadcrumb?.chapterTitle ??
      (typeof chapterRecord?.title === "string" && chapterRecord.title.trim()
        ? chapterRecord.title
        : null);
    const chapterSlug =
      breadcrumb?.chapterSlug ??
      (typeof chapterRecord?.slug === "string" ? chapterRecord.slug : null);
    const chapterNumber =
      breadcrumb?.chapterNumber ??
      (typeof chapterRecord?.chapterNumber === "number"
        ? chapterRecord.chapterNumber
        : null);
    const classTitle =
      breadcrumb?.classTitle ??
      (classRecord && typeof classRecord.title === "string"
        ? classRecord.title
        : null);
    const classSlug =
      breadcrumb?.classSlug ??
      (classRecord && typeof classRecord.slug === "string"
        ? classRecord.slug
        : null);

    if (!chapterTitle && !classTitle) return null;

    return {
      chapterTitle,
      chapterSlug,
      chapterNumber,
      classTitle,
      classSlug,
    };
  }, [data?.chapter, breadcrumb]);

  const lessonType: "Reading" | "Video" | "Quiz" = useMemo(() => {
    if (blocks.some((block) => block.blockType === "quizBlock") || assessmentQuiz) {
      return "Quiz";
    }
    if (blocks.some((block) => block.blockType === "videoBlock")) return "Video";
    return "Reading";
  }, [blocks, assessmentQuiz]);

  const estimatedMinutes =
    lessonType === "Quiz" ? 12 : lessonType === "Video" ? 10 : 8;

  const lessonTypeStyle = {
    Reading: {
      iconBg: "bg-primary/10",
      ring: "ring-primary/15",
      iconText: "text-primary",
    },
    Video: {
      iconBg: "bg-blue-500/10",
      ring: "ring-blue-500/15",
      iconText: "text-blue-600 dark:text-blue-400",
    },
    Quiz: {
      iconBg: "bg-amber-500/10",
      ring: "ring-amber-500/15",
      iconText: "text-amber-600 dark:text-amber-400",
    },
  }[lessonType];

  const LessonIcon =
    lessonType === "Video" ? Video : lessonType === "Quiz" ? FileQuestion : BookOpen;

  const sections = useMemo(() => extractLessonSections(blocks), [blocks]);

  // Compute prev/next neighbors once so both the sidebar and the bottom nav
  // share the same data without recomputing.
  const neighbors = useMemo(() => {
    if (!normalizedNav) return { prev: null, next: null };
    const { lessons, currentIndex } = normalizedNav;
    const prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const next =
      currentIndex >= 0 && currentIndex < lessons.length - 1
        ? lessons[currentIndex + 1]
        : null;
    return { prev, next };
  }, [normalizedNav]);

  const sidebarChapter = chapterInfo
    ? {
        title: chapterInfo.chapterTitle ?? null,
        slug: chapterInfo.chapterSlug ?? null,
        number: chapterInfo.chapterNumber ?? null,
        classSlug: chapterInfo.classSlug ?? null,
      }
    : undefined;
  const lessonIndexInChapter =
    normalizedNav && normalizedNav.currentIndex >= 0
      ? normalizedNav.currentIndex + 1
      : null;
  const lessonCountInChapter = normalizedNav?.lessons.length ?? null;

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
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 max-w-[72ch]">
      <header className="mb-8">
        {chapterInfo &&
        (chapterInfo.classTitle || chapterInfo.chapterTitle) ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground"
          >
            {chapterInfo.classTitle && chapterInfo.classSlug ? (
              <>
                <Link
                  href={`/classes/${chapterInfo.classSlug}`}
                  className="rounded-md px-1 py-0.5 font-medium transition-colors hover:text-foreground"
                >
                  {chapterInfo.classTitle}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              </>
            ) : null}
            {chapterInfo.chapterTitle &&
            chapterInfo.chapterSlug &&
            chapterInfo.classSlug ? (
              <Link
                href={`/classes/${chapterInfo.classSlug}/chapters/${chapterInfo.chapterSlug}`}
                className="rounded-md px-1 py-0.5 font-medium transition-colors hover:text-foreground"
              >
                {chapterInfo.chapterNumber
                  ? `Ch ${chapterInfo.chapterNumber} · `
                  : ""}
                {chapterInfo.chapterTitle}
              </Link>
            ) : null}
          </nav>
        ) : null}
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1",
              lessonTypeStyle.iconBg,
              lessonTypeStyle.ring
            )}
            aria-hidden="true"
          >
            <LessonIcon className={cn("h-5 w-5", lessonTypeStyle.iconText)} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {lessonType}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />~{estimatedMinutes} min read
              </span>
              {data?.difficulty ? (
                <>
                  <span className="text-border">·</span>
                  <DifficultyPill value={data.difficulty} />
                </>
              ) : null}
              {updatedAt ? (
                <>
                  <span className="text-border">·</span>
                  <span>Updated {formatDate(updatedAt)}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {data?.objectives && data.objectives.length > 0 ? (
          <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-primary">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              You will learn
            </div>
            <ul className="mt-2 grid gap-1.5">
              {data.objectives.map((objective, index) => (
                <li
                  key={objective.id ?? index}
                  className="flex items-start gap-2 text-[14px] leading-6 text-foreground/95"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span>{objective.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>
      {blocks.length > 0 ? (
        <PageLayout
          blocks={blocks}
          className="space-y-10"
          lessonId={data?.id ? String(data.id) : undefined}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          No content yet. Add blocks to this lesson.
        </p>
      )}
      {!hasQuizBlock && assessmentBlock ? (
        <div className="mt-12">
          <QuizBlockComponent
            block={assessmentBlock}
            lessonId={data?.id ? String(data.id) : undefined}
          />
        </div>
      ) : null}
      <LessonFinishCard
        lessonTitle={title}
        sections={sections}
        next={neighbors.next}
        hrefPrefix={normalizedNav?.hrefPrefix ?? ""}
        chapter={sidebarChapter}
        lessonIndex={lessonIndexInChapter}
        lessonCount={lessonCountInChapter}
        summary={data?.summary ?? null}
      />
      {data?.id ? (
        <>
          <LessonQuestionDrawer
            lessonId={String(data.id)}
            lessonTitle={title}
            classId={classId}
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
        </div>
        <LessonSidebar
          sections={sections}
          estimatedMinutes={estimatedMinutes}
          lessonType={lessonType}
          prev={neighbors.prev}
          next={neighbors.next}
          hrefPrefix={normalizedNav?.hrefPrefix ?? ""}
          chapter={sidebarChapter}
          lessonIndex={lessonIndexInChapter}
          lessonCount={lessonCountInChapter}
        />
      </div>
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

const DIFFICULTY_PILLS = {
  intro: { label: "Intro", tone: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  easy: { label: "Easy", tone: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  medium: { label: "Medium", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  hard: { label: "Hard", tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
} as const;

function DifficultyPill({ value }: { value: "intro" | "easy" | "medium" | "hard" }) {
  const pill = DIFFICULTY_PILLS[value];
  if (!pill) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em]",
        pill.tone,
      )}
    >
      {pill.label}
    </span>
  );
}
