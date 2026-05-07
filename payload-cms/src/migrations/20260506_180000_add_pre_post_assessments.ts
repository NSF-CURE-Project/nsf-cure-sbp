import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "pre_post_assessments" (
     "id" serial PRIMARY KEY NOT NULL,
     "title" varchar NOT NULL,
     "description" varchar,
     "pre_quiz_id" integer,
     "post_quiz_id" integer,
     "classroom_id" integer,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE IF NOT EXISTS "pre_post_assessments_rels" (
     "id" serial PRIMARY KEY NOT NULL,
     "order" integer,
     "parent_id" integer NOT NULL,
     "path" varchar NOT NULL,
     "concepts_id" integer
   );

   CREATE INDEX IF NOT EXISTS "pre_post_assessments_pre_quiz_idx" ON "pre_post_assessments" USING btree ("pre_quiz_id");
   CREATE INDEX IF NOT EXISTS "pre_post_assessments_post_quiz_idx" ON "pre_post_assessments" USING btree ("post_quiz_id");
   CREATE INDEX IF NOT EXISTS "pre_post_assessments_classroom_idx" ON "pre_post_assessments" USING btree ("classroom_id");
   CREATE INDEX IF NOT EXISTS "pre_post_assessments_updated_at_idx" ON "pre_post_assessments" USING btree ("updated_at");
   CREATE INDEX IF NOT EXISTS "pre_post_assessments_created_at_idx" ON "pre_post_assessments" USING btree ("created_at");

   CREATE INDEX IF NOT EXISTS "pre_post_assessments_rels_order_idx" ON "pre_post_assessments_rels" USING btree ("order");
   CREATE INDEX IF NOT EXISTS "pre_post_assessments_rels_parent_idx" ON "pre_post_assessments_rels" USING btree ("parent_id");
   CREATE INDEX IF NOT EXISTS "pre_post_assessments_rels_path_idx" ON "pre_post_assessments_rels" USING btree ("path");
   CREATE INDEX IF NOT EXISTS "pre_post_assessments_rels_concepts_id_idx" ON "pre_post_assessments_rels" USING btree ("concepts_id");

   DO $$ BEGIN
     ALTER TABLE "pre_post_assessments" ADD CONSTRAINT "pre_post_assessments_pre_quiz_fk" FOREIGN KEY ("pre_quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
     ALTER TABLE "pre_post_assessments" ADD CONSTRAINT "pre_post_assessments_post_quiz_fk" FOREIGN KEY ("post_quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
     ALTER TABLE "pre_post_assessments" ADD CONSTRAINT "pre_post_assessments_classroom_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
     ALTER TABLE "pre_post_assessments_rels" ADD CONSTRAINT "pre_post_assessments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pre_post_assessments"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
     ALTER TABLE "pre_post_assessments_rels" ADD CONSTRAINT "pre_post_assessments_rels_concepts_fk" FOREIGN KEY ("concepts_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "pre_post_assessments_rels" CASCADE;
   DROP TABLE IF EXISTS "pre_post_assessments" CASCADE;
  `)
}
