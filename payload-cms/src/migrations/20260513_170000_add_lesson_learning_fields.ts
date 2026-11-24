import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Adds:
//   - lessons.difficulty (enum)
//   - lessons.summary (text)
//   - lessons_objectives (array child table)
//   - lessons_blocks_callout, _definition, _worked_example, _worked_example_steps,
//     _checkpoint, _lesson_summary, _lesson_summary_points (block tables + arrays)
// Schema names match the snake_case Payload would generate for the new blocks.
// We let Payload's drafts-aware drizzle adapter fill in the _v versioned
// variants on next boot; the up here covers the published-tree side.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_lessons_difficulty" AS ENUM('intro', 'easy', 'medium', 'hard');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_lessons_blocks_callout_variant" AS ENUM('info', 'tip', 'warning', 'key');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "difficulty" "enum_lessons_difficulty";
    ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "summary" varchar;

    CREATE TABLE IF NOT EXISTS "lessons_objectives" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "lessons_objectives_order_idx"
      ON "lessons_objectives" ("_order");
    CREATE INDEX IF NOT EXISTS "lessons_objectives_parent_id_idx"
      ON "lessons_objectives" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "lessons_objectives"
        ADD CONSTRAINT "lessons_objectives_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "lessons_blocks_callout" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "variant" "enum_lessons_blocks_callout_variant" DEFAULT 'info',
      "title" varchar,
      "body" varchar NOT NULL,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "lessons_blocks_callout_order_idx"
      ON "lessons_blocks_callout" ("_order");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_callout_parent_id_idx"
      ON "lessons_blocks_callout" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_callout_path_idx"
      ON "lessons_blocks_callout" ("_path");
    DO $$ BEGIN
      ALTER TABLE "lessons_blocks_callout"
        ADD CONSTRAINT "lessons_blocks_callout_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "lessons_blocks_definition" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "term" varchar NOT NULL,
      "definition" varchar NOT NULL,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "lessons_blocks_definition_order_idx"
      ON "lessons_blocks_definition" ("_order");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_definition_parent_id_idx"
      ON "lessons_blocks_definition" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_definition_path_idx"
      ON "lessons_blocks_definition" ("_path");
    DO $$ BEGIN
      ALTER TABLE "lessons_blocks_definition"
        ADD CONSTRAINT "lessons_blocks_definition_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "lessons_blocks_worked_example" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "problem" varchar NOT NULL,
      "final_answer" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "lessons_blocks_worked_example_order_idx"
      ON "lessons_blocks_worked_example" ("_order");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_worked_example_parent_id_idx"
      ON "lessons_blocks_worked_example" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_worked_example_path_idx"
      ON "lessons_blocks_worked_example" ("_path");
    DO $$ BEGIN
      ALTER TABLE "lessons_blocks_worked_example"
        ADD CONSTRAINT "lessons_blocks_worked_example_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "lessons_blocks_worked_example_steps" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "lessons_blocks_worked_example_steps_order_idx"
      ON "lessons_blocks_worked_example_steps" ("_order");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_worked_example_steps_parent_id_idx"
      ON "lessons_blocks_worked_example_steps" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "lessons_blocks_worked_example_steps"
        ADD CONSTRAINT "lessons_blocks_worked_example_steps_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "lessons_blocks_worked_example"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "lessons_blocks_checkpoint" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "prompt" varchar NOT NULL,
      "answer" varchar NOT NULL,
      "hint" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "lessons_blocks_checkpoint_order_idx"
      ON "lessons_blocks_checkpoint" ("_order");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_checkpoint_parent_id_idx"
      ON "lessons_blocks_checkpoint" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_checkpoint_path_idx"
      ON "lessons_blocks_checkpoint" ("_path");
    DO $$ BEGIN
      ALTER TABLE "lessons_blocks_checkpoint"
        ADD CONSTRAINT "lessons_blocks_checkpoint_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "lessons_blocks_lesson_summary" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "lessons_blocks_lesson_summary_order_idx"
      ON "lessons_blocks_lesson_summary" ("_order");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_lesson_summary_parent_id_idx"
      ON "lessons_blocks_lesson_summary" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_lesson_summary_path_idx"
      ON "lessons_blocks_lesson_summary" ("_path");
    DO $$ BEGIN
      ALTER TABLE "lessons_blocks_lesson_summary"
        ADD CONSTRAINT "lessons_blocks_lesson_summary_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "lessons_blocks_lesson_summary_points" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "lessons_blocks_lesson_summary_points_order_idx"
      ON "lessons_blocks_lesson_summary_points" ("_order");
    CREATE INDEX IF NOT EXISTS "lessons_blocks_lesson_summary_points_parent_id_idx"
      ON "lessons_blocks_lesson_summary_points" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "lessons_blocks_lesson_summary_points"
        ADD CONSTRAINT "lessons_blocks_lesson_summary_points_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "lessons_blocks_lesson_summary"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "lessons_blocks_lesson_summary_points" CASCADE;
    DROP TABLE IF EXISTS "lessons_blocks_lesson_summary" CASCADE;
    DROP TABLE IF EXISTS "lessons_blocks_checkpoint" CASCADE;
    DROP TABLE IF EXISTS "lessons_blocks_worked_example_steps" CASCADE;
    DROP TABLE IF EXISTS "lessons_blocks_worked_example" CASCADE;
    DROP TABLE IF EXISTS "lessons_blocks_definition" CASCADE;
    DROP TABLE IF EXISTS "lessons_blocks_callout" CASCADE;
    DROP TABLE IF EXISTS "lessons_objectives" CASCADE;
    ALTER TABLE "lessons" DROP COLUMN IF EXISTS "summary";
    ALTER TABLE "lessons" DROP COLUMN IF EXISTS "difficulty";
    DROP TYPE IF EXISTS "public"."enum_lessons_blocks_callout_variant";
    DROP TYPE IF EXISTS "public"."enum_lessons_difficulty";
  `)
}
