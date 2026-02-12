import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "classrooms_id" integer,
      ADD COLUMN IF NOT EXISTS "classroom_memberships_id" integer;

    ALTER TABLE IF EXISTS "payload_preferences_rels"
      ADD COLUMN IF NOT EXISTS "classrooms_id" integer,
      ADD COLUMN IF NOT EXISTS "classroom_memberships_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_classrooms_fk"
        FOREIGN KEY ("classrooms_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_classroom_memberships_fk"
        FOREIGN KEY ("classroom_memberships_id") REFERENCES "public"."classroom_memberships"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_classrooms_fk"
        FOREIGN KEY ("classrooms_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_classroom_memberships_fk"
        FOREIGN KEY ("classroom_memberships_id") REFERENCES "public"."classroom_memberships"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_classrooms_id_idx"
      ON "payload_locked_documents_rels" USING btree ("classrooms_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_classroom_memberships_id_idx"
      ON "payload_locked_documents_rels" USING btree ("classroom_memberships_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_classrooms_id_idx"
      ON "payload_preferences_rels" USING btree ("classrooms_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_classroom_memberships_id_idx"
      ON "payload_preferences_rels" USING btree ("classroom_memberships_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_classrooms_fk";
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_classroom_memberships_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_classrooms_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_classroom_memberships_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_classrooms_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_classroom_memberships_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_classrooms_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_classroom_memberships_id_idx";

    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "classrooms_id",
      DROP COLUMN IF EXISTS "classroom_memberships_id";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP COLUMN IF EXISTS "classrooms_id",
      DROP COLUMN IF EXISTS "classroom_memberships_id";
  `)
}
