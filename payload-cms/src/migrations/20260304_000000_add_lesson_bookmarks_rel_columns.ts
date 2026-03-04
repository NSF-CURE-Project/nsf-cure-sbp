import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "lesson_bookmarks_id" integer;

    ALTER TABLE IF EXISTS "payload_preferences_rels"
      ADD COLUMN IF NOT EXISTS "lesson_bookmarks_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_lesson_bookmarks_fk"
        FOREIGN KEY ("lesson_bookmarks_id") REFERENCES "public"."lesson_bookmarks"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_lesson_bookmarks_fk"
        FOREIGN KEY ("lesson_bookmarks_id") REFERENCES "public"."lesson_bookmarks"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_lesson_bookmarks_id_idx"
      ON "payload_locked_documents_rels" USING btree ("lesson_bookmarks_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_lesson_bookmarks_id_idx"
      ON "payload_preferences_rels" USING btree ("lesson_bookmarks_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
