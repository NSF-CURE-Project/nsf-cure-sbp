## Course Management — Staff Guide

This guide covers how staff and professors author the course catalog. For the broader admin tour, see [`payload-admin-handbook.md`](./payload-admin-handbook.md).

## Where to edit curriculum

- `/admin/courses` — the central workspace. Drag-and-drop classes and chapters, expand a chapter to see lessons, and edit inline.
- Underlying collections: `Classes`, `Chapters`, `Lessons` (in `payload-cms/src/collections/`).
- Media lives in `Media`; figures use `EngineeringFigures` (free-body diagrams, plots, etc.).

## Creating a new class

1. From `/admin/courses`, click `+ Add course` to open the create form (`/admin/courses/new`).
2. Fill in the title, slug, description, and any class-level metadata.
3. Save. The new class appears at the bottom of the outline; drag it into position and confirm `Save order`.
4. Click `+ Add chapter` under the new class to create chapters inline.
5. Inside each chapter, click `+ Add lesson` to open the scaffold editor in create mode.

## Lesson scaffold editor

The lesson editor is a 3-column scaffold (left outline, center block canvas, right inspector) at `/admin/courses/[courseId]/lessons/[lessonId]/edit`.

- **Outline panel** — jump to a block, see chapter/lesson context.
- **Block canvas** — stack of block cards. Each card has a drag handle, inline editor, and overflow menu (duplicate, delete, move).
- **Inspector panel** — settings for the selected block plus lesson-level fields (title, assessment, status).
- **Sticky toolbar** — `Cancel`, auto-save indicator (`Auto-saving…` / `Saved Xs ago` / `Save failed`), `Save draft`, `Publish`.
- **Publish review modal** — opens before publish; shows an embedded preview iframe (when `WEB_PREVIEW_URL` + `PREVIEW_SECRET` are set) and a summary of changes.

Behaviour notes:
- Create-mode defers the database write until you `Save draft` or `Publish`.
- Edit-mode auto-saves drafts in the background; the indicator surfaces success/failure.
- Drafts persist in `sessionStorage` keyed by lesson/chapter, so a refresh during create won't lose your work.

## Lesson block types

Available on lessons and pages (defined in `payload-cms/src/blocks/pageBlocks.ts`):

| Slug | Use it for |
| --- | --- |
| `sectionTitle` | Visual divider between sections. |
| `richTextBlock` | Lexical rich text with math (`MathFeature`) and figure support. |
| `textSection` | Short prose with optional heading. |
| `videoBlock` | Embedded video. |
| `listBlock` | Bulleted or numbered list. |
| `stepsList` | Ordered step-by-step instructions. |
| `buttonBlock` | Call-to-action button (links to internal or external URLs). |
| `quizBlock` | Embedded quiz reference, rendered inline in the lesson. |
| `heroBlock` | Page hero with title, subtitle, and CTA (Pages). |
| `resourcesList` | Curated list of resources (Pages). |
| `contactsList` | Contact directory rendering (Pages). |

## Assessments

- Create `Quizzes` and `QuizQuestions` in the admin, or use the **Quiz Bank** (`/admin/quiz-bank`) to filter, duplicate, and CSV-import.
- Attach a quiz to a lesson on the lesson's `Assessment` tab. You can override max attempts, show-answers behaviour, and time limit per lesson.
- Use **Problem Sets** (`/admin/collections/problem-sets`) and `Problems` for templated practice problems served via `/api/public/problem-sets`.
- Use **Pre/Post Assessments** (`/admin/pre-post`) to pair a pre-quiz with a post-quiz for normalized-gain research analysis.
- Learner attempts are recorded in `QuizAttempts` and `ProblemAttempts`.

## Concept mapping

Use the **Concept Library** (`/admin/concepts`) to define learning outcomes and tag them onto questions, problems, and lessons. Reporting endpoints (`/api/staff/concept-list`, `/api/staff/concept-detail`) read these mappings to surface concept-level mastery.

## Student tracking

- `LessonProgress` and `QuizAttempts` show per-learner completion and scores.
- The **Student Performance** workspace (`/admin/student-performance`) aggregates these into roster views with filters.
- The **User Analytics** workspace (`/admin/user-analytics`) surfaces per-instructor metrics for managing professor performance.

## Publishing workflow

- Draftable content: `lessons`, `pages`, `quizzes`, `quiz-questions`, `problems`, `rppr-reports`.
- Save a draft from the scaffold toolbar (or the standard Payload document controls); the publish action opens the review modal before going live.
- Non-draft collections (classes, chapters, classrooms, learner records) save immediately.

## Reordering content

- Reorder classes from `/admin/courses`. Confirm the `Save order` modal.
- Reorder chapters inside a class with the same drag-and-drop.
- Reorder lessons inside a chapter from the chapter card.
- Reorder navigation pages from `/admin/site-management`.

If you need automated course imports/exports, raise the request with the project owner — endpoint hooks exist for CSV question import and product-record capture already, and additional ingestion paths can be added.
