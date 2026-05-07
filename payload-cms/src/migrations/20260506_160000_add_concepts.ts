import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     CREATE TYPE "public"."enum_concepts_subject" AS ENUM('statics', 'mechanics', 'math', 'physics', 'general');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
     CREATE TYPE "public"."enum_concepts_bloom_level" AS ENUM('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
     CREATE TYPE "public"."enum_quiz_questions_bloom_level" AS ENUM('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
     CREATE TYPE "public"."enum__quiz_questions_v_version_bloom_level" AS ENUM('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   CREATE TABLE IF NOT EXISTS "concepts" (
     "id" serial PRIMARY KEY NOT NULL,
     "name" varchar NOT NULL,
     "slug" varchar NOT NULL,
     "subject" "enum_concepts_subject" DEFAULT 'general',
     "bloom_level" "enum_concepts_bloom_level",
     "description" varchar,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE IF NOT EXISTS "concepts_rels" (
     "id" serial PRIMARY KEY NOT NULL,
     "order" integer,
     "parent_id" integer NOT NULL,
     "path" varchar NOT NULL,
     "concepts_id" integer
   );

   CREATE UNIQUE INDEX IF NOT EXISTS "concepts_slug_idx" ON "concepts" USING btree ("slug");
   CREATE INDEX IF NOT EXISTS "concepts_updated_at_idx" ON "concepts" USING btree ("updated_at");
   CREATE INDEX IF NOT EXISTS "concepts_created_at_idx" ON "concepts" USING btree ("created_at");

   CREATE INDEX IF NOT EXISTS "concepts_rels_order_idx" ON "concepts_rels" USING btree ("order");
   CREATE INDEX IF NOT EXISTS "concepts_rels_parent_idx" ON "concepts_rels" USING btree ("parent_id");
   CREATE INDEX IF NOT EXISTS "concepts_rels_path_idx" ON "concepts_rels" USING btree ("path");
   CREATE INDEX IF NOT EXISTS "concepts_rels_concepts_id_idx" ON "concepts_rels" USING btree ("concepts_id");

   DO $$ BEGIN
     ALTER TABLE "concepts_rels" ADD CONSTRAINT "concepts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
     ALTER TABLE "concepts_rels" ADD CONSTRAINT "concepts_rels_concepts_fk" FOREIGN KEY ("concepts_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   ALTER TABLE "quiz_questions"
     ADD COLUMN IF NOT EXISTS "bloom_level" "enum_quiz_questions_bloom_level";

   ALTER TABLE "_quiz_questions_v"
     ADD COLUMN IF NOT EXISTS "version_bloom_level" "enum__quiz_questions_v_version_bloom_level";

   ALTER TABLE "quiz_questions_rels"
     ADD COLUMN IF NOT EXISTS "concepts_id" integer;

   ALTER TABLE "_quiz_questions_v_rels"
     ADD COLUMN IF NOT EXISTS "concepts_id" integer;

   CREATE INDEX IF NOT EXISTS "quiz_questions_rels_concepts_id_idx" ON "quiz_questions_rels" USING btree ("concepts_id");
   CREATE INDEX IF NOT EXISTS "_quiz_questions_v_rels_concepts_id_idx" ON "_quiz_questions_v_rels" USING btree ("concepts_id");

   DO $$ BEGIN
     ALTER TABLE "quiz_questions_rels" ADD CONSTRAINT "quiz_questions_rels_concepts_fk" FOREIGN KEY ("concepts_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
     ALTER TABLE "_quiz_questions_v_rels" ADD CONSTRAINT "_quiz_questions_v_rels_concepts_fk" FOREIGN KEY ("concepts_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_quiz_questions_v_rels" DROP CONSTRAINT IF EXISTS "_quiz_questions_v_rels_concepts_fk";
   ALTER TABLE "quiz_questions_rels" DROP CONSTRAINT IF EXISTS "quiz_questions_rels_concepts_fk";
   ALTER TABLE "_quiz_questions_v_rels" DROP COLUMN IF EXISTS "concepts_id";
   ALTER TABLE "quiz_questions_rels" DROP COLUMN IF EXISTS "concepts_id";
   ALTER TABLE "_quiz_questions_v" DROP COLUMN IF EXISTS "version_bloom_level";
   ALTER TABLE "quiz_questions" DROP COLUMN IF EXISTS "bloom_level";
   DROP TABLE IF EXISTS "concepts_rels" CASCADE;
   DROP TABLE IF EXISTS "concepts" CASCADE;
   DROP TYPE IF EXISTS "public"."enum__quiz_questions_v_version_bloom_level";
   DROP TYPE IF EXISTS "public"."enum_quiz_questions_bloom_level";
   DROP TYPE IF EXISTS "public"."enum_concepts_bloom_level";
   DROP TYPE IF EXISTS "public"."enum_concepts_subject";
  `)
}
