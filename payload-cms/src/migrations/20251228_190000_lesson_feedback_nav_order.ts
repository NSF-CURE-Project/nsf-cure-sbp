import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_lesson_feedback_rating') THEN
      CREATE TYPE "public"."enum_lesson_feedback_rating__new" AS ENUM (
        'not_helpful',
        'somewhat_helpful',
        'helpful',
        'very_helpful'
      );

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'lesson_feedback' AND column_name = 'rating'
      ) THEN
        ALTER TABLE "lesson_feedback"
          ALTER COLUMN "rating"
          TYPE "public"."enum_lesson_feedback_rating__new"
          USING (
            CASE
              WHEN "rating"::text IN ('1', 'not_helpful') THEN 'not_helpful'
              WHEN "rating"::text IN ('2', 'somewhat_helpful') THEN 'somewhat_helpful'
              WHEN "rating"::text IN ('3', 'helpful') THEN 'helpful'
              WHEN "rating"::text IN ('4', 'very_helpful') THEN 'very_helpful'
              ELSE 'not_helpful'
            END
          )::"public"."enum_lesson_feedback_rating__new";
      END IF;

      DROP TYPE "public"."enum_lesson_feedback_rating";
      ALTER TYPE "public"."enum_lesson_feedback_rating__new" RENAME TO "enum_lesson_feedback_rating";
    ELSE
      CREATE TYPE "public"."enum_lesson_feedback_rating" AS ENUM (
        'not_helpful',
        'somewhat_helpful',
        'helpful',
        'very_helpful'
      );
    END IF;
  END $$;

  CREATE TABLE IF NOT EXISTS "lesson_feedback" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer,
    "lesson_id" integer,
    "chapter_id" integer,
    "class_id" integer,
    "rating" "enum_lesson_feedback_rating",
    "message" varchar,
    "reply" varchar,
    "replied_at" timestamp(3) with time zone,
    "replied_by_id" integer,
    "page_url" varchar,
    "user_agent" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "user_id" integer;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "lesson_id" integer;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "chapter_id" integer;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "class_id" integer;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "rating" "enum_lesson_feedback_rating";
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "message" varchar;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "reply" varchar;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "replied_at" timestamp(3) with time zone;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "replied_by_id" integer;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "page_url" varchar;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "user_agent" varchar;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL;
  ALTER TABLE "lesson_feedback" ADD COLUMN IF NOT EXISTS "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL;

  DO $$ BEGIN
    ALTER TABLE "lesson_feedback"
      ADD CONSTRAINT "lesson_feedback_user_id_accounts_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "lesson_feedback"
      ADD CONSTRAINT "lesson_feedback_lesson_id_lessons_id_fk"
      FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "lesson_feedback"
      ADD CONSTRAINT "lesson_feedback_chapter_id_chapters_id_fk"
      FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "lesson_feedback"
      ADD CONSTRAINT "lesson_feedback_class_id_classes_id_fk"
      FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "lesson_feedback"
      ADD CONSTRAINT "lesson_feedback_replied_by_id_users_id_fk"
      FOREIGN KEY ("replied_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "lesson_feedback_lesson_id_idx" ON "lesson_feedback" USING btree ("lesson_id");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_rating_idx" ON "lesson_feedback" USING btree ("rating");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_created_at_idx" ON "lesson_feedback" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_user_id_idx" ON "lesson_feedback" USING btree ("user_id");

  ALTER TABLE "payload_locked_documents_rels"
    ADD COLUMN IF NOT EXISTS "lesson_feedback_id" integer;
  ALTER TABLE "payload_preferences_rels"
    ADD COLUMN IF NOT EXISTS "lesson_feedback_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_lesson_feedback_fk"
      FOREIGN KEY ("lesson_feedback_id") REFERENCES "public"."lesson_feedback"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_preferences_rels"
      ADD CONSTRAINT "payload_preferences_rels_lesson_feedback_fk"
      FOREIGN KEY ("lesson_feedback_id") REFERENCES "public"."lesson_feedback"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_lesson_feedback_id_idx"
    ON "payload_locked_documents_rels" USING btree ("lesson_feedback_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_lesson_feedback_id_idx"
    ON "payload_preferences_rels" USING btree ("lesson_feedback_id");

  ALTER TABLE IF EXISTS "pages"
    ADD COLUMN IF NOT EXISTS "nav_order" numeric DEFAULT 0;
  ALTER TABLE IF EXISTS "_pages_v"
    ADD COLUMN IF NOT EXISTS "version_nav_order" numeric DEFAULT 0;

  CREATE INDEX IF NOT EXISTS "pages_nav_order_idx" ON "pages" USING btree ("nav_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_nav_order_idx" ON "_pages_v" USING btree ("version_nav_order");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP COLUMN IF EXISTS "lesson_feedback_id";
  ALTER TABLE IF EXISTS "payload_preferences_rels" DROP COLUMN IF EXISTS "lesson_feedback_id";
  ALTER TABLE IF EXISTS "pages" DROP COLUMN IF EXISTS "nav_order";
  ALTER TABLE IF EXISTS "_pages_v" DROP COLUMN IF EXISTS "version_nav_order";

  DROP TABLE IF EXISTS "lesson_feedback" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_lesson_feedback_rating";
  `)
}
