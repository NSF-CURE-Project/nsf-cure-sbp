import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "lessons_blocks_practice_problem" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "assignment_key" varchar,
      "problem_id" varchar,
      "required_practice" boolean DEFAULT false,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "lessons_blocks_practice_problem_order_idx" ON "lessons_blocks_practice_problem" ("_order");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_practice_problem_parent_id_idx" ON "lessons_blocks_practice_problem" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_practice_problem_path_idx" ON "lessons_blocks_practice_problem" ("_path");

    CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_practice_problem" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "_lessons_v"("id") ON DELETE CASCADE,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "assignment_key" varchar,
      "problem_id" varchar,
      "required_practice" boolean DEFAULT false,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_practice_problem_order_idx" ON "_lessons_v_blocks_practice_problem" ("_order");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_practice_problem_parent_id_idx" ON "_lessons_v_blocks_practice_problem" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_practice_problem_path_idx" ON "_lessons_v_blocks_practice_problem" ("_path");

    CREATE TABLE IF NOT EXISTS "practice_attempts" (
      "id" serial PRIMARY KEY NOT NULL,
      "lesson_id" integer NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
      "learner_id" integer NOT NULL REFERENCES "accounts"("id") ON DELETE CASCADE,
      "assignment_key" varchar NOT NULL,
      "problem_id" varchar NOT NULL,
      "key" varchar NOT NULL,
      "submitted" boolean DEFAULT false,
      "completed" boolean DEFAULT false,
      "score" numeric,
      "max_score" numeric,
      "snapshot" jsonb,
      "updated_at" timestamptz(3) DEFAULT now() NOT NULL,
      "created_at" timestamptz(3) DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "practice_attempts_key_idx" ON "practice_attempts" ("key");
    CREATE INDEX IF NOT EXISTS "practice_attempts_lesson_idx" ON "practice_attempts" ("lesson_id");
    CREATE INDEX IF NOT EXISTS "practice_attempts_learner_idx" ON "practice_attempts" ("learner_id");
    CREATE INDEX IF NOT EXISTS "practice_attempts_updated_at_idx" ON "practice_attempts" ("updated_at");
    CREATE INDEX IF NOT EXISTS "practice_attempts_created_at_idx" ON "practice_attempts" ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Keep submissions and authored assignments recoverable during an app rollback.
  await db.execute(sql`SELECT 1`)
}
