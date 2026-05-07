import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The earlier migrations that introduced the `concepts`, `pre-post-assessments`,
// and `saved-views` collections created the collection tables but forgot to
// extend payload_locked_documents_rels with the matching foreign-key columns.
// Payload generates SQL that selects every <collection>_id from that table,
// so the missing columns crash the admin with column does not exist.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels"
     ADD COLUMN IF NOT EXISTS "concepts_id" integer,
     ADD COLUMN IF NOT EXISTS "pre_post_assessments_id" integer,
     ADD COLUMN IF NOT EXISTS "saved_views_id" integer;

   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_concepts_id_idx"
     ON "payload_locked_documents_rels" USING btree ("concepts_id");
   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pre_post_assessments_id_idx"
     ON "payload_locked_documents_rels" USING btree ("pre_post_assessments_id");
   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_saved_views_id_idx"
     ON "payload_locked_documents_rels" USING btree ("saved_views_id");

   DO $$ BEGIN
     ALTER TABLE "payload_locked_documents_rels"
       ADD CONSTRAINT "payload_locked_documents_rels_concepts_fk"
       FOREIGN KEY ("concepts_id") REFERENCES "public"."concepts"("id")
       ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
     ALTER TABLE "payload_locked_documents_rels"
       ADD CONSTRAINT "payload_locked_documents_rels_pre_post_assessments_fk"
       FOREIGN KEY ("pre_post_assessments_id") REFERENCES "public"."pre_post_assessments"("id")
       ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
     ALTER TABLE "payload_locked_documents_rels"
       ADD CONSTRAINT "payload_locked_documents_rels_saved_views_fk"
       FOREIGN KEY ("saved_views_id") REFERENCES "public"."saved_views"("id")
       ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels"
     DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_concepts_fk",
     DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_pre_post_assessments_fk",
     DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_saved_views_fk",
     DROP COLUMN IF EXISTS "concepts_id",
     DROP COLUMN IF EXISTS "pre_post_assessments_id",
     DROP COLUMN IF EXISTS "saved_views_id";
  `)
}
