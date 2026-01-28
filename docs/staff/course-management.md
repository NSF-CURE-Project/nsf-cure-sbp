## Course Management — Staff Guide

Where to edit curriculum
- `Classes`, `Chapters`, and `Lessons` collections in the admin UI control course structure and content. Each `Lesson` can include blocks, media, and quizzes.

Creating a new class
1. In the admin, create a new `Class` record with title and description.
2. Add `Chapters` linked to the class.
3. Create `Lessons` and link them to chapters. Lessons may include media, content blocks, and quizzes.

Assessments
- Create `Quizzes` and `QuizQuestions` in the admin. Assign quizzes to lessons or classes as appropriate.
- Student attempts are recorded in `QuizAttempts`.

Student tracking
- `LessonProgress` and `QuizAttempts` show student progress and scores. Use filters in the admin to view per-student or per-class reports.

Publishing workflow
- Draft and preview content using the live preview. When ready, publish via the admin UI — publishing options appear on collection entries.

If you want automated course imports or exports, I can add an endpoint or migration to support CSV/JSON ingestion.
