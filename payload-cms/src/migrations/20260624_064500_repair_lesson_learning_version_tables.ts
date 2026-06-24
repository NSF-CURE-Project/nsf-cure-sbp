import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// The 20260513 lesson-learning migration created the published-tree tables,
// but production had no matching _lessons_v draft/version tables. Draft saves
// and autosaves write through _lessons_v, so create the missing version side.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum__lessons_v_version_difficulty" AS ENUM('intro', 'easy', 'medium', 'hard');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__lessons_v_blocks_callout_variant" AS ENUM('info', 'tip', 'warning', 'key');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "_lessons_v"
      ADD COLUMN IF NOT EXISTS "version_difficulty" "enum__lessons_v_version_difficulty";
    ALTER TABLE "_lessons_v"
      ADD COLUMN IF NOT EXISTS "version_summary" varchar;

    CREATE TABLE IF NOT EXISTS "_lessons_v_version_objectives" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "text" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_lessons_v_version_objectives_order_idx"
      ON "_lessons_v_version_objectives" ("_order");
    CREATE INDEX IF NOT EXISTS "_lessons_v_version_objectives_parent_id_idx"
      ON "_lessons_v_version_objectives" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "_lessons_v_version_objectives"
        ADD CONSTRAINT "_lessons_v_version_objectives_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_lessons_v"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_callout" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "variant" "enum__lessons_v_blocks_callout_variant" DEFAULT 'info',
      "title" varchar,
      "body" varchar,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_callout_order_idx"
      ON "_lessons_v_blocks_callout" ("_order");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_callout_parent_id_idx"
      ON "_lessons_v_blocks_callout" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_callout_path_idx"
      ON "_lessons_v_blocks_callout" ("_path");
    DO $$ BEGIN
      ALTER TABLE "_lessons_v_blocks_callout"
        ADD CONSTRAINT "_lessons_v_blocks_callout_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_lessons_v"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_definition" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "term" varchar,
      "definition" varchar,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_definition_order_idx"
      ON "_lessons_v_blocks_definition" ("_order");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_definition_parent_id_idx"
      ON "_lessons_v_blocks_definition" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_definition_path_idx"
      ON "_lessons_v_blocks_definition" ("_path");
    DO $$ BEGIN
      ALTER TABLE "_lessons_v_blocks_definition"
        ADD CONSTRAINT "_lessons_v_blocks_definition_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_lessons_v"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_worked_example" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "problem" varchar,
      "final_answer" varchar,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_worked_example_order_idx"
      ON "_lessons_v_blocks_worked_example" ("_order");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_worked_example_parent_id_idx"
      ON "_lessons_v_blocks_worked_example" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_worked_example_path_idx"
      ON "_lessons_v_blocks_worked_example" ("_path");
    DO $$ BEGIN
      ALTER TABLE "_lessons_v_blocks_worked_example"
        ADD CONSTRAINT "_lessons_v_blocks_worked_example_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_lessons_v"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_worked_example_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "text" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_worked_example_steps_order_idx"
      ON "_lessons_v_blocks_worked_example_steps" ("_order");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_worked_example_steps_parent_id_idx"
      ON "_lessons_v_blocks_worked_example_steps" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "_lessons_v_blocks_worked_example_steps"
        ADD CONSTRAINT "_lessons_v_blocks_worked_example_steps_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_lessons_v_blocks_worked_example"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_checkpoint" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "prompt" varchar,
      "answer" varchar,
      "hint" varchar,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_checkpoint_order_idx"
      ON "_lessons_v_blocks_checkpoint" ("_order");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_checkpoint_parent_id_idx"
      ON "_lessons_v_blocks_checkpoint" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_checkpoint_path_idx"
      ON "_lessons_v_blocks_checkpoint" ("_path");
    DO $$ BEGIN
      ALTER TABLE "_lessons_v_blocks_checkpoint"
        ADD CONSTRAINT "_lessons_v_blocks_checkpoint_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_lessons_v"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_lesson_summary" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_lesson_summary_order_idx"
      ON "_lessons_v_blocks_lesson_summary" ("_order");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_lesson_summary_parent_id_idx"
      ON "_lessons_v_blocks_lesson_summary" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_lesson_summary_path_idx"
      ON "_lessons_v_blocks_lesson_summary" ("_path");
    DO $$ BEGIN
      ALTER TABLE "_lessons_v_blocks_lesson_summary"
        ADD CONSTRAINT "_lessons_v_blocks_lesson_summary_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_lessons_v"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_lesson_summary_points" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "text" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_lesson_summary_points_order_idx"
      ON "_lessons_v_blocks_lesson_summary_points" ("_order");
    CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_lesson_summary_points_parent_id_idx"
      ON "_lessons_v_blocks_lesson_summary_points" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "_lessons_v_blocks_lesson_summary_points"
        ADD CONSTRAINT "_lessons_v_blocks_lesson_summary_points_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_lessons_v_blocks_lesson_summary"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_lessons_v_blocks_lesson_summary_points" CASCADE;
    DROP TABLE IF EXISTS "_lessons_v_blocks_lesson_summary" CASCADE;
    DROP TABLE IF EXISTS "_lessons_v_blocks_checkpoint" CASCADE;
    DROP TABLE IF EXISTS "_lessons_v_blocks_worked_example_steps" CASCADE;
    DROP TABLE IF EXISTS "_lessons_v_blocks_worked_example" CASCADE;
    DROP TABLE IF EXISTS "_lessons_v_blocks_definition" CASCADE;
    DROP TABLE IF EXISTS "_lessons_v_blocks_callout" CASCADE;
    DROP TABLE IF EXISTS "_lessons_v_version_objectives" CASCADE;
    ALTER TABLE "_lessons_v" DROP COLUMN IF EXISTS "version_summary";
    ALTER TABLE "_lessons_v" DROP COLUMN IF EXISTS "version_difficulty";
    DROP TYPE IF EXISTS "public"."enum__lessons_v_blocks_callout_variant";
    DROP TYPE IF EXISTS "public"."enum__lessons_v_version_difficulty";
  `)
}
