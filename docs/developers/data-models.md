## Data Models — NSF CURE SBP (high-level)

Overview
- The canonical data models live in `payload-cms/src/collections/`. Payload collections define schema, access rules, and admin UI behavior.

Key collections
- `Users` — authentication and roles (`admin|professor|staff`). See `payload-cms/src/collections/Users.ts` for cookie and access logic.
- `Classes`, `Chapters`, `Lessons` — course hierarchy used to render learning content.
- `Pages`, `Media` — CMS pages and uploaded assets.
- `Quizzes`, `QuizQuestions`, `QuizAttempts` — assessment models.
- `LessonProgress`, `Feedback`, `LessonFeedback` — tracking student progress and feedback.

Relationships & access
- Many collections reference others by `relationship` fields (e.g., lessons → chapters → classes). Inspect collection `fields` for `relation` types.
- Access control: collections use `access` functions that check `req.user` and roles; reuse these patterns when adding protected collections.

Adding or changing models
1. Add/modify `payload-cms/src/collections/MyCollection.ts` (export a `CollectionConfig`).
2. Create a migration in `payload-cms/src/migrations/` describing the DB change.
3. Run migrations against your Postgres DB.
4. Regenerate types: `cd payload-cms && pnpm generate:types`.

Where to inspect sample fields
- Example user/role logic: `payload-cms/src/collections/Users.ts`.
- Example content fields: `payload-cms/src/collections/Lessons.ts` and `Pages.ts`.

If you want, I can generate a visual ER diagram from the collection files — tell me if you'd like that and I'll add a script to output relationships.

