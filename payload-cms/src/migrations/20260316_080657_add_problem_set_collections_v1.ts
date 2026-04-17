import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
    CREATE TYPE "public"."enum_engineering_figures_type" AS ENUM('fbd', 'truss', 'beam', 'moment-diagram');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_problems_parts_tolerance_type" AS ENUM('absolute', 'relative');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_problems_difficulty" AS ENUM('intro', 'easy', 'medium', 'hard');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_problems_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__problems_v_version_parts_tolerance_type" AS ENUM('absolute', 'relative');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__problems_v_version_difficulty" AS ENUM('intro', 'easy', 'medium', 'hard');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__problems_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_problem_sets_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__problem_sets_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_branding_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__site_branding_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE TABLE "engineering_figures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_engineering_figures_type" NOT NULL,
  	"description" varchar,
  	"figure_data" jsonb NOT NULL,
  	"width" numeric DEFAULT 600,
  	"height" numeric DEFAULT 400,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "problems_parts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"prompt" jsonb,
  	"unit" varchar,
  	"correct_answer" numeric,
  	"tolerance" numeric DEFAULT 0.05,
  	"tolerance_type" "enum_problems_parts_tolerance_type" DEFAULT 'absolute',
  	"significant_figures" numeric,
  	"explanation" jsonb
  );
  
  CREATE TABLE "problems" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"prompt" jsonb,
  	"figure_id" integer,
  	"difficulty" "enum_problems_difficulty",
  	"topic" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_problems_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "problems_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_problems_v_version_parts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"prompt" jsonb,
  	"unit" varchar,
  	"correct_answer" numeric,
  	"tolerance" numeric DEFAULT 0.05,
  	"tolerance_type" "enum__problems_v_version_parts_tolerance_type" DEFAULT 'absolute',
  	"significant_figures" numeric,
  	"explanation" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_problems_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_prompt" jsonb,
  	"version_figure_id" integer,
  	"version_difficulty" "enum__problems_v_version_difficulty",
  	"version_topic" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__problems_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_problems_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "problem_sets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"show_answers" boolean DEFAULT true,
  	"max_attempts" numeric,
  	"shuffle_problems" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_problem_sets_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "problem_sets_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"problems_id" integer
  );
  
  CREATE TABLE "_problem_sets_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_show_answers" boolean DEFAULT true,
  	"version_max_attempts" numeric,
  	"version_shuffle_problems" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__problem_sets_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_problem_sets_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"problems_id" integer
  );
  
  CREATE TABLE "problem_attempts_answers_parts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"part_index" numeric NOT NULL,
  	"student_answer" numeric,
  	"is_correct" boolean,
  	"score" numeric
  );
  
  CREATE TABLE "problem_attempts_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"problem_id" integer NOT NULL
  );
  
  CREATE TABLE "problem_attempts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"problem_set_id" integer NOT NULL,
  	"lesson_id" integer,
  	"user_id" integer NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"duration_sec" numeric,
  	"score" numeric,
  	"max_score" numeric,
  	"correct_count" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lesson_bookmarks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"chapter_id" integer,
  	"class_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_branding" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"program_logo_id" integer,
  	"program_logo_alt" varchar DEFAULT 'NSF CURE Summer Bridge Program logo',
  	"_status" "enum_site_branding_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_branding_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_program_logo_id" integer,
  	"version_program_logo_alt" varchar DEFAULT 'NSF CURE Summer Bridge Program logo',
  	"version__status" "enum__site_branding_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "engineering_figures_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "problems_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "problem_sets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "problem_attempts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lesson_bookmarks_id" integer;
  ALTER TABLE "problems_parts" ADD CONSTRAINT "problems_parts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problems" ADD CONSTRAINT "problems_figure_id_engineering_figures_id_fk" FOREIGN KEY ("figure_id") REFERENCES "public"."engineering_figures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "problems_texts" ADD CONSTRAINT "problems_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problems_v_version_parts" ADD CONSTRAINT "_problems_v_version_parts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_problems_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problems_v" ADD CONSTRAINT "_problems_v_parent_id_problems_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."problems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_problems_v" ADD CONSTRAINT "_problems_v_version_figure_id_engineering_figures_id_fk" FOREIGN KEY ("version_figure_id") REFERENCES "public"."engineering_figures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_problems_v_texts" ADD CONSTRAINT "_problems_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_problems_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problem_sets_rels" ADD CONSTRAINT "problem_sets_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."problem_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problem_sets_rels" ADD CONSTRAINT "problem_sets_rels_problems_fk" FOREIGN KEY ("problems_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problem_sets_v" ADD CONSTRAINT "_problem_sets_v_parent_id_problem_sets_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."problem_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_problem_sets_v_rels" ADD CONSTRAINT "_problem_sets_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_problem_sets_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problem_sets_v_rels" ADD CONSTRAINT "_problem_sets_v_rels_problems_fk" FOREIGN KEY ("problems_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problem_attempts_answers_parts" ADD CONSTRAINT "problem_attempts_answers_parts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."problem_attempts_answers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problem_attempts_answers" ADD CONSTRAINT "problem_attempts_answers_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "problem_attempts_answers" ADD CONSTRAINT "problem_attempts_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."problem_attempts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problem_attempts" ADD CONSTRAINT "problem_attempts_problem_set_id_problem_sets_id_fk" FOREIGN KEY ("problem_set_id") REFERENCES "public"."problem_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "problem_attempts" ADD CONSTRAINT "problem_attempts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "problem_attempts" ADD CONSTRAINT "problem_attempts_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_branding" ADD CONSTRAINT "site_branding_program_logo_id_media_id_fk" FOREIGN KEY ("program_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_branding_v" ADD CONSTRAINT "_site_branding_v_version_program_logo_id_media_id_fk" FOREIGN KEY ("version_program_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "engineering_figures_updated_at_idx" ON "engineering_figures" USING btree ("updated_at");
  CREATE INDEX "engineering_figures_created_at_idx" ON "engineering_figures" USING btree ("created_at");
  CREATE INDEX "problems_parts_order_idx" ON "problems_parts" USING btree ("_order");
  CREATE INDEX "problems_parts_parent_id_idx" ON "problems_parts" USING btree ("_parent_id");
  CREATE INDEX "problems_figure_idx" ON "problems" USING btree ("figure_id");
  CREATE INDEX "problems_updated_at_idx" ON "problems" USING btree ("updated_at");
  CREATE INDEX "problems_created_at_idx" ON "problems" USING btree ("created_at");
  CREATE INDEX "problems__status_idx" ON "problems" USING btree ("_status");
  CREATE INDEX "problems_texts_order_parent" ON "problems_texts" USING btree ("order","parent_id");
  CREATE INDEX "_problems_v_version_parts_order_idx" ON "_problems_v_version_parts" USING btree ("_order");
  CREATE INDEX "_problems_v_version_parts_parent_id_idx" ON "_problems_v_version_parts" USING btree ("_parent_id");
  CREATE INDEX "_problems_v_parent_idx" ON "_problems_v" USING btree ("parent_id");
  CREATE INDEX "_problems_v_version_version_figure_idx" ON "_problems_v" USING btree ("version_figure_id");
  CREATE INDEX "_problems_v_version_version_updated_at_idx" ON "_problems_v" USING btree ("version_updated_at");
  CREATE INDEX "_problems_v_version_version_created_at_idx" ON "_problems_v" USING btree ("version_created_at");
  CREATE INDEX "_problems_v_version_version__status_idx" ON "_problems_v" USING btree ("version__status");
  CREATE INDEX "_problems_v_created_at_idx" ON "_problems_v" USING btree ("created_at");
  CREATE INDEX "_problems_v_updated_at_idx" ON "_problems_v" USING btree ("updated_at");
  CREATE INDEX "_problems_v_latest_idx" ON "_problems_v" USING btree ("latest");
  CREATE INDEX "_problems_v_texts_order_parent" ON "_problems_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "problem_sets_updated_at_idx" ON "problem_sets" USING btree ("updated_at");
  CREATE INDEX "problem_sets_created_at_idx" ON "problem_sets" USING btree ("created_at");
  CREATE INDEX "problem_sets__status_idx" ON "problem_sets" USING btree ("_status");
  CREATE INDEX "problem_sets_rels_order_idx" ON "problem_sets_rels" USING btree ("order");
  CREATE INDEX "problem_sets_rels_parent_idx" ON "problem_sets_rels" USING btree ("parent_id");
  CREATE INDEX "problem_sets_rels_path_idx" ON "problem_sets_rels" USING btree ("path");
  CREATE INDEX "problem_sets_rels_problems_id_idx" ON "problem_sets_rels" USING btree ("problems_id");
  CREATE INDEX "_problem_sets_v_parent_idx" ON "_problem_sets_v" USING btree ("parent_id");
  CREATE INDEX "_problem_sets_v_version_version_updated_at_idx" ON "_problem_sets_v" USING btree ("version_updated_at");
  CREATE INDEX "_problem_sets_v_version_version_created_at_idx" ON "_problem_sets_v" USING btree ("version_created_at");
  CREATE INDEX "_problem_sets_v_version_version__status_idx" ON "_problem_sets_v" USING btree ("version__status");
  CREATE INDEX "_problem_sets_v_created_at_idx" ON "_problem_sets_v" USING btree ("created_at");
  CREATE INDEX "_problem_sets_v_updated_at_idx" ON "_problem_sets_v" USING btree ("updated_at");
  CREATE INDEX "_problem_sets_v_latest_idx" ON "_problem_sets_v" USING btree ("latest");
  CREATE INDEX "_problem_sets_v_rels_order_idx" ON "_problem_sets_v_rels" USING btree ("order");
  CREATE INDEX "_problem_sets_v_rels_parent_idx" ON "_problem_sets_v_rels" USING btree ("parent_id");
  CREATE INDEX "_problem_sets_v_rels_path_idx" ON "_problem_sets_v_rels" USING btree ("path");
  CREATE INDEX "_problem_sets_v_rels_problems_id_idx" ON "_problem_sets_v_rels" USING btree ("problems_id");
  CREATE INDEX "problem_attempts_answers_parts_order_idx" ON "problem_attempts_answers_parts" USING btree ("_order");
  CREATE INDEX "problem_attempts_answers_parts_parent_id_idx" ON "problem_attempts_answers_parts" USING btree ("_parent_id");
  CREATE INDEX "problem_attempts_answers_order_idx" ON "problem_attempts_answers" USING btree ("_order");
  CREATE INDEX "problem_attempts_answers_parent_id_idx" ON "problem_attempts_answers" USING btree ("_parent_id");
  CREATE INDEX "problem_attempts_answers_problem_idx" ON "problem_attempts_answers" USING btree ("problem_id");
  CREATE INDEX "problem_attempts_problem_set_idx" ON "problem_attempts" USING btree ("problem_set_id");
  CREATE INDEX "problem_attempts_lesson_idx" ON "problem_attempts" USING btree ("lesson_id");
  CREATE INDEX "problem_attempts_user_idx" ON "problem_attempts" USING btree ("user_id");
  CREATE INDEX "problem_attempts_updated_at_idx" ON "problem_attempts" USING btree ("updated_at");
  CREATE INDEX "problem_attempts_created_at_idx" ON "problem_attempts" USING btree ("created_at");
  CREATE INDEX "lesson_bookmarks_user_idx" ON "lesson_bookmarks" USING btree ("user_id");
  CREATE INDEX "lesson_bookmarks_lesson_idx" ON "lesson_bookmarks" USING btree ("lesson_id");
  CREATE INDEX "lesson_bookmarks_chapter_idx" ON "lesson_bookmarks" USING btree ("chapter_id");
  CREATE INDEX "lesson_bookmarks_class_idx" ON "lesson_bookmarks" USING btree ("class_id");
  CREATE INDEX "lesson_bookmarks_updated_at_idx" ON "lesson_bookmarks" USING btree ("updated_at");
  CREATE INDEX "lesson_bookmarks_created_at_idx" ON "lesson_bookmarks" USING btree ("created_at");
  CREATE INDEX "site_branding_program_logo_idx" ON "site_branding" USING btree ("program_logo_id");
  CREATE INDEX "site_branding__status_idx" ON "site_branding" USING btree ("_status");
  CREATE INDEX "_site_branding_v_version_version_program_logo_idx" ON "_site_branding_v" USING btree ("version_program_logo_id");
  CREATE INDEX "_site_branding_v_version_version__status_idx" ON "_site_branding_v" USING btree ("version__status");
  CREATE INDEX "_site_branding_v_created_at_idx" ON "_site_branding_v" USING btree ("created_at");
  CREATE INDEX "_site_branding_v_updated_at_idx" ON "_site_branding_v" USING btree ("updated_at");
  CREATE INDEX "_site_branding_v_latest_idx" ON "_site_branding_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_engineering_figures_fk" FOREIGN KEY ("engineering_figures_id") REFERENCES "public"."engineering_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_problems_fk" FOREIGN KEY ("problems_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_problem_sets_fk" FOREIGN KEY ("problem_sets_id") REFERENCES "public"."problem_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_problem_attempts_fk" FOREIGN KEY ("problem_attempts_id") REFERENCES "public"."problem_attempts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lesson_bookmarks_fk" FOREIGN KEY ("lesson_bookmarks_id") REFERENCES "public"."lesson_bookmarks"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_engineering_figures_id_idx" ON "payload_locked_documents_rels" USING btree ("engineering_figures_id");
  CREATE INDEX "payload_locked_documents_rels_problems_id_idx" ON "payload_locked_documents_rels" USING btree ("problems_id");
  CREATE INDEX "payload_locked_documents_rels_problem_sets_id_idx" ON "payload_locked_documents_rels" USING btree ("problem_sets_id");
  CREATE INDEX "payload_locked_documents_rels_problem_attempts_id_idx" ON "payload_locked_documents_rels" USING btree ("problem_attempts_id");
  CREATE INDEX "payload_locked_documents_rels_lesson_bookmarks_id_idx" ON "payload_locked_documents_rels" USING btree ("lesson_bookmarks_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "engineering_figures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "problems_parts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "problems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "problems_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_problems_v_version_parts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_problems_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_problems_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "problem_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "problem_sets_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_problem_sets_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_problem_sets_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "problem_attempts_answers_parts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "problem_attempts_answers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "problem_attempts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lesson_bookmarks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_branding" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_branding_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "engineering_figures" CASCADE;
  DROP TABLE "problems_parts" CASCADE;
  DROP TABLE "problems" CASCADE;
  DROP TABLE "problems_texts" CASCADE;
  DROP TABLE "_problems_v_version_parts" CASCADE;
  DROP TABLE "_problems_v" CASCADE;
  DROP TABLE "_problems_v_texts" CASCADE;
  DROP TABLE "problem_sets" CASCADE;
  DROP TABLE "problem_sets_rels" CASCADE;
  DROP TABLE "_problem_sets_v" CASCADE;
  DROP TABLE "_problem_sets_v_rels" CASCADE;
  DROP TABLE "problem_attempts_answers_parts" CASCADE;
  DROP TABLE "problem_attempts_answers" CASCADE;
  DROP TABLE "problem_attempts" CASCADE;
  DROP TABLE "lesson_bookmarks" CASCADE;
  DROP TABLE "site_branding" CASCADE;
  DROP TABLE "_site_branding_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_engineering_figures_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_problems_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_problem_sets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_problem_attempts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lesson_bookmarks_fk";
  
  DROP INDEX "payload_locked_documents_rels_engineering_figures_id_idx";
  DROP INDEX "payload_locked_documents_rels_problems_id_idx";
  DROP INDEX "payload_locked_documents_rels_problem_sets_id_idx";
  DROP INDEX "payload_locked_documents_rels_problem_attempts_id_idx";
  DROP INDEX "payload_locked_documents_rels_lesson_bookmarks_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "engineering_figures_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "problems_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "problem_sets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "problem_attempts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lesson_bookmarks_id";
  DROP TYPE "public"."enum_engineering_figures_type";
  DROP TYPE "public"."enum_problems_parts_tolerance_type";
  DROP TYPE "public"."enum_problems_difficulty";
  DROP TYPE "public"."enum_problems_status";
  DROP TYPE "public"."enum__problems_v_version_parts_tolerance_type";
  DROP TYPE "public"."enum__problems_v_version_difficulty";
  DROP TYPE "public"."enum__problems_v_version_status";
  DROP TYPE "public"."enum_problem_sets_status";
  DROP TYPE "public"."enum__problem_sets_v_version_status";
  DROP TYPE "public"."enum_site_branding_status";
  DROP TYPE "public"."enum__site_branding_v_version_status";`)
}
