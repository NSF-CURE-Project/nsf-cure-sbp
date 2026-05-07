import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "quiz_questions"
      ADD COLUMN IF NOT EXISTS "question_type" varchar DEFAULT 'single-select',
      ADD COLUMN IF NOT EXISTS "true_false_answer" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "accepted_answers" jsonb,
      ADD COLUMN IF NOT EXISTS "text_match_mode" varchar DEFAULT 'normalized',
      ADD COLUMN IF NOT EXISTS "numeric_correct_value" numeric,
      ADD COLUMN IF NOT EXISTS "numeric_tolerance" numeric,
      ADD COLUMN IF NOT EXISTS "numeric_unit" varchar;

    ALTER TABLE IF EXISTS "_quiz_questions_v"
      ADD COLUMN IF NOT EXISTS "version_question_type" varchar DEFAULT 'single-select',
      ADD COLUMN IF NOT EXISTS "version_true_false_answer" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_accepted_answers" jsonb,
      ADD COLUMN IF NOT EXISTS "version_text_match_mode" varchar DEFAULT 'normalized',
      ADD COLUMN IF NOT EXISTS "version_numeric_correct_value" numeric,
      ADD COLUMN IF NOT EXISTS "version_numeric_tolerance" numeric,
      ADD COLUMN IF NOT EXISTS "version_numeric_unit" varchar;

    UPDATE "quiz_questions"
    SET "question_type" = CASE
      WHEN COALESCE((
        SELECT COUNT(*)
        FROM "quiz_questions_options" qqo
        WHERE qqo."_parent_id" = "quiz_questions"."id"
          AND COALESCE(qqo."is_correct", false) = true
      ), 0) > 1 THEN 'multi-select'
      ELSE 'single-select'
    END
    WHERE "question_type" IS NULL;

    ALTER TABLE IF EXISTS "quiz_attempts_answers"
      ADD COLUMN IF NOT EXISTS "response_kind" varchar,
      ADD COLUMN IF NOT EXISTS "text_answer" varchar,
      ADD COLUMN IF NOT EXISTS "numeric_answer" numeric,
      ADD COLUMN IF NOT EXISTS "normalized_answer" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "quiz_attempts_answers"
      DROP COLUMN IF EXISTS "normalized_answer",
      DROP COLUMN IF EXISTS "numeric_answer",
      DROP COLUMN IF EXISTS "text_answer",
      DROP COLUMN IF EXISTS "response_kind";

    ALTER TABLE IF EXISTS "_quiz_questions_v"
      DROP COLUMN IF EXISTS "version_numeric_unit",
      DROP COLUMN IF EXISTS "version_numeric_tolerance",
      DROP COLUMN IF EXISTS "version_numeric_correct_value",
      DROP COLUMN IF EXISTS "version_text_match_mode",
      DROP COLUMN IF EXISTS "version_accepted_answers",
      DROP COLUMN IF EXISTS "version_true_false_answer",
      DROP COLUMN IF EXISTS "version_question_type";

    ALTER TABLE IF EXISTS "quiz_questions"
      DROP COLUMN IF EXISTS "numeric_unit",
      DROP COLUMN IF EXISTS "numeric_tolerance",
      DROP COLUMN IF EXISTS "numeric_correct_value",
      DROP COLUMN IF EXISTS "text_match_mode",
      DROP COLUMN IF EXISTS "accepted_answers",
      DROP COLUMN IF EXISTS "true_false_answer",
      DROP COLUMN IF EXISTS "question_type";
  `)
}
