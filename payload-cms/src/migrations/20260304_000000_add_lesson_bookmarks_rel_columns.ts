import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "lesson_bookmarks" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "lesson_id" integer NOT NULL,
      "chapter_id" integer,
      "class_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "lesson_bookmarks"
        ADD CONSTRAINT "lesson_bookmarks_user_id_accounts_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "lesson_bookmarks"
        ADD CONSTRAINT "lesson_bookmarks_lesson_id_lessons_id_fk"
        FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "lesson_bookmarks"
        ADD CONSTRAINT "lesson_bookmarks_chapter_id_chapters_id_fk"
        FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "lesson_bookmarks"
        ADD CONSTRAINT "lesson_bookmarks_class_id_classes_id_fk"
        FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "lesson_bookmarks_user_id_idx"
      ON "lesson_bookmarks" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "lesson_bookmarks_lesson_id_idx"
      ON "lesson_bookmarks" USING btree ("lesson_id");
    CREATE INDEX IF NOT EXISTS "lesson_bookmarks_chapter_id_idx"
      ON "lesson_bookmarks" USING btree ("chapter_id");
    CREATE INDEX IF NOT EXISTS "lesson_bookmarks_class_id_idx"
      ON "lesson_bookmarks" USING btree ("class_id");

    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "lesson_bookmarks_id" integer;

    ALTER TABLE IF EXISTS "payload_preferences_rels"
      ADD COLUMN IF NOT EXISTS "lesson_bookmarks_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_lesson_bookmarks_fk"
        FOREIGN KEY ("lesson_bookmarks_id") REFERENCES "public"."lesson_bookmarks"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_lesson_bookmarks_fk"
        FOREIGN KEY ("lesson_bookmarks_id") REFERENCES "public"."lesson_bookmarks"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_lesson_bookmarks_id_idx"
      ON "payload_locked_documents_rels" USING btree ("lesson_bookmarks_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_lesson_bookmarks_id_idx"
      ON "payload_preferences_rels" USING btree ("lesson_bookmarks_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "lesson_bookmarks"
      DROP CONSTRAINT IF EXISTS "lesson_bookmarks_user_id_accounts_id_fk";
    ALTER TABLE IF EXISTS "lesson_bookmarks"
      DROP CONSTRAINT IF EXISTS "lesson_bookmarks_lesson_id_lessons_id_fk";
    ALTER TABLE IF EXISTS "lesson_bookmarks"
      DROP CONSTRAINT IF EXISTS "lesson_bookmarks_chapter_id_chapters_id_fk";
    ALTER TABLE IF EXISTS "lesson_bookmarks"
      DROP CONSTRAINT IF EXISTS "lesson_bookmarks_class_id_classes_id_fk";

    DROP INDEX IF EXISTS "lesson_bookmarks_user_id_idx";
    DROP INDEX IF EXISTS "lesson_bookmarks_lesson_id_idx";
    DROP INDEX IF EXISTS "lesson_bookmarks_chapter_id_idx";
    DROP INDEX IF EXISTS "lesson_bookmarks_class_id_idx";

    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_lesson_bookmarks_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_lesson_bookmarks_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_lesson_bookmarks_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_lesson_bookmarks_id_idx";

    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "lesson_bookmarks_id";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP COLUMN IF EXISTS "lesson_bookmarks_id";
  `)
}
