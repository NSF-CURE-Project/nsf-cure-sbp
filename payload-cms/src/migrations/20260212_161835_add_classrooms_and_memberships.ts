import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN CREATE TYPE "public"."enum_lessons_blocks_section_block_size" AS ENUM('sm', 'md', 'lg'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__lessons_v_blocks_section_block_size" AS ENUM('sm', 'md', 'lg'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_section_block_size" AS ENUM('sm', 'md', 'lg'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_section_block_size" AS ENUM('sm', 'md', 'lg'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_users_admin_theme" AS ENUM('light', 'dark'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_questions_status" AS ENUM('open', 'answered', 'resolved'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_quiz_questions_difficulty" AS ENUM('intro', 'easy', 'medium', 'hard'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_quiz_questions_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__quiz_questions_v_version_difficulty" AS ENUM('intro', 'easy', 'medium', 'hard'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__quiz_questions_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_quizzes_difficulty" AS ENUM('intro', 'easy', 'medium', 'hard'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_quizzes_scoring" AS ENUM('per-question', 'all-or-nothing', 'partial'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_quizzes_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__quizzes_v_version_difficulty" AS ENUM('intro', 'easy', 'medium', 'hard'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__quizzes_v_version_scoring" AS ENUM('per-question', 'all-or-nothing', 'partial'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__quizzes_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_notifications_type" AS ENUM('question_answered'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_lesson_feedback_rating" AS ENUM('not_helpful', 'somewhat_helpful', 'helpful', 'very_helpful'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_admin_help_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__admin_help_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'professor' BEFORE 'staff'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE TABLE IF NOT EXISTS "lessons_blocks_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" jsonb,
  	"size" "enum_lessons_blocks_section_block_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "lessons_blocks_quiz_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"quiz_id" integer,
  	"show_title" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" jsonb,
  	"size" "enum__lessons_v_blocks_section_block_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_quiz_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"quiz_id" integer,
  	"show_title" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" jsonb,
  	"size" "enum_pages_blocks_section_block_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_quiz_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"quiz_id" integer,
  	"show_title" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" jsonb,
  	"size" "enum__pages_v_blocks_section_block_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_quiz_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"quiz_id" integer,
  	"show_title" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classrooms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"class_id" integer NOT NULL,
  	"professor_id" integer NOT NULL,
  	"join_code" varchar NOT NULL,
  	"join_code_length" numeric DEFAULT 6,
  	"join_code_duration_hours" numeric DEFAULT 168,
  	"join_code_expires_at" timestamp(3) with time zone,
  	"join_code_last_rotated_at" timestamp(3) with time zone,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "classroom_memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"classroom_id" integer NOT NULL,
  	"student_id" integer NOT NULL,
  	"joined_at" timestamp(3) with time zone,
  	"total_lessons" numeric,
  	"completed_lessons" numeric,
  	"completion_rate" numeric,
  	"last_activity_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "questions_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"author_id" integer NOT NULL,
  	"body" jsonb NOT NULL,
  	"created_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"chapter_id" integer,
  	"class_id" integer,
  	"status" "enum_questions_status" DEFAULT 'open' NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"attachment_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "quiz_questions_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"is_correct" boolean DEFAULT false
  );
  
  CREATE TABLE IF NOT EXISTS "quiz_questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"prompt" jsonb,
  	"explanation" jsonb,
  	"topic" varchar,
  	"difficulty" "enum_quiz_questions_difficulty",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_quiz_questions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "quiz_questions_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "quiz_questions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_quiz_questions_v_version_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"is_correct" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_quiz_questions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_prompt" jsonb,
  	"version_explanation" jsonb,
  	"version_topic" varchar,
  	"version_difficulty" "enum__quiz_questions_v_version_difficulty",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__quiz_questions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_quiz_questions_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_quiz_questions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "quizzes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"course_id" integer,
  	"chapter_id" integer,
  	"difficulty" "enum_quizzes_difficulty",
  	"shuffle_questions" boolean DEFAULT true,
  	"shuffle_options" boolean DEFAULT true,
  	"scoring" "enum_quizzes_scoring" DEFAULT 'per-question',
  	"time_limit_sec" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_quizzes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "quizzes_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "quizzes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"quiz_questions_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_quizzes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_course_id" integer,
  	"version_chapter_id" integer,
  	"version_difficulty" "enum__quizzes_v_version_difficulty",
  	"version_shuffle_questions" boolean DEFAULT true,
  	"version_shuffle_options" boolean DEFAULT true,
  	"version_scoring" "enum__quizzes_v_version_scoring" DEFAULT 'per-question',
  	"version_time_limit_sec" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__quizzes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_quizzes_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_quizzes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"quiz_questions_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "quiz_attempts_question_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "quiz_attempts_answers_selected_option_ids" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"option_id" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "quiz_attempts_answers_option_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"option_id" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "quiz_attempts_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_id" integer NOT NULL,
  	"is_correct" boolean,
  	"score" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "quiz_attempts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quiz_id" integer NOT NULL,
  	"lesson_id" integer,
  	"user_id" integer NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"duration_sec" numeric,
  	"score" numeric,
  	"max_score" numeric,
  	"correct_count" numeric,
  	"question_count" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipient_id" integer NOT NULL,
  	"type" "enum_notifications_type" DEFAULT 'question_answered' NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"question_id" integer,
  	"read" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "lesson_progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"chapter_id" integer,
  	"class_id" integer,
  	"completed" boolean DEFAULT false,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"read" boolean DEFAULT false,
  	"message" varchar NOT NULL,
  	"page_url" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "lesson_feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"lesson_id" integer NOT NULL,
  	"chapter_id" integer,
  	"class_id" integer,
  	"rating" "enum_lesson_feedback_rating" NOT NULL,
  	"message" varchar,
  	"reply" varchar,
  	"replied_at" timestamp(3) with time zone,
  	"replied_by_id" integer,
  	"page_url" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "admin_help" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'NSF CURE Admin Help',
  	"body" jsonb,
  	"_status" "enum_admin_help_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_admin_help_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'NSF CURE Admin Help',
  	"version_body" jsonb,
  	"version__status" "enum__admin_help_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "footer_explore_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "footer_resources_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"connect_email" varchar,
  	"connect_address" varchar,
  	"connect_external_label" varchar,
  	"connect_external_url" varchar,
  	"feedback_enabled" boolean DEFAULT true,
  	"feedback_title" varchar,
  	"feedback_description" varchar,
  	"feedback_button_label" varchar,
  	"bottom_copyright_line" varchar,
  	"bottom_sub_line" varchar,
  	"_status" "enum_footer_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_footer_v_version_explore_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_footer_v_version_resources_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_connect_email" varchar,
  	"version_connect_address" varchar,
  	"version_connect_external_label" varchar,
  	"version_connect_external_url" varchar,
  	"version_feedback_enabled" boolean DEFAULT true,
  	"version_feedback_title" varchar,
  	"version_feedback_description" varchar,
  	"version_feedback_button_label" varchar,
  	"version_bottom_copyright_line" varchar,
  	"version_bottom_sub_line" varchar,
  	"version__status" "enum__footer_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "classes" ALTER COLUMN "order" DROP DEFAULT;
  ALTER TABLE "chapters" ADD COLUMN IF NOT EXISTS "chapter_number" numeric;
  ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "order" numeric;
  ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "assessment_quiz_id" integer;
  ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "assessment_show_answers" boolean DEFAULT true;
  ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "assessment_max_attempts" numeric;
  ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "assessment_time_limit_sec" numeric;
  ALTER TABLE "_lessons_v" ADD COLUMN IF NOT EXISTS "version_order" numeric;
  ALTER TABLE "_lessons_v" ADD COLUMN IF NOT EXISTS "version_assessment_quiz_id" integer;
  ALTER TABLE "_lessons_v" ADD COLUMN IF NOT EXISTS "version_assessment_show_answers" boolean DEFAULT true;
  ALTER TABLE "_lessons_v" ADD COLUMN IF NOT EXISTS "version_assessment_max_attempts" numeric;
  ALTER TABLE "_lessons_v" ADD COLUMN IF NOT EXISTS "version_assessment_time_limit_sec" numeric;
  ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "nav_order" numeric;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_nav_order" numeric;
  ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false;
  ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp(3) with time zone;
  ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "email_verification_token_hash" varchar;
  ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "email_verification_expires_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "admin_theme" "enum_users_admin_theme" DEFAULT 'light';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "classrooms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "classroom_memberships_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "questions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "quiz_questions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "quizzes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "quiz_attempts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "notifications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "lesson_progress_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "feedback_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "lesson_feedback_id" integer;
  CREATE INDEX IF NOT EXISTS "lessons_blocks_section_block_order_idx" ON "lessons_blocks_section_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "lessons_blocks_section_block_parent_id_idx" ON "lessons_blocks_section_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "lessons_blocks_section_block_path_idx" ON "lessons_blocks_section_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "lessons_blocks_quiz_block_order_idx" ON "lessons_blocks_quiz_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "lessons_blocks_quiz_block_parent_id_idx" ON "lessons_blocks_quiz_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "lessons_blocks_quiz_block_path_idx" ON "lessons_blocks_quiz_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "lessons_blocks_quiz_block_quiz_idx" ON "lessons_blocks_quiz_block" USING btree ("quiz_id");
  CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_section_block_order_idx" ON "_lessons_v_blocks_section_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_section_block_parent_id_idx" ON "_lessons_v_blocks_section_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_section_block_path_idx" ON "_lessons_v_blocks_section_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_quiz_block_order_idx" ON "_lessons_v_blocks_quiz_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_quiz_block_parent_id_idx" ON "_lessons_v_blocks_quiz_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_quiz_block_path_idx" ON "_lessons_v_blocks_quiz_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_quiz_block_quiz_idx" ON "_lessons_v_blocks_quiz_block" USING btree ("quiz_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_section_block_order_idx" ON "pages_blocks_section_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_section_block_parent_id_idx" ON "pages_blocks_section_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_section_block_path_idx" ON "pages_blocks_section_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_quiz_block_order_idx" ON "pages_blocks_quiz_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_quiz_block_parent_id_idx" ON "pages_blocks_quiz_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_quiz_block_path_idx" ON "pages_blocks_quiz_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_quiz_block_quiz_idx" ON "pages_blocks_quiz_block" USING btree ("quiz_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_section_block_order_idx" ON "_pages_v_blocks_section_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_section_block_parent_id_idx" ON "_pages_v_blocks_section_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_section_block_path_idx" ON "_pages_v_blocks_section_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_quiz_block_order_idx" ON "_pages_v_blocks_quiz_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_quiz_block_parent_id_idx" ON "_pages_v_blocks_quiz_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_quiz_block_path_idx" ON "_pages_v_blocks_quiz_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_quiz_block_quiz_idx" ON "_pages_v_blocks_quiz_block" USING btree ("quiz_id");
  CREATE INDEX IF NOT EXISTS "classrooms_class_idx" ON "classrooms" USING btree ("class_id");
  CREATE INDEX IF NOT EXISTS "classrooms_professor_idx" ON "classrooms" USING btree ("professor_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "classrooms_join_code_idx" ON "classrooms" USING btree ("join_code");
  CREATE INDEX IF NOT EXISTS "classrooms_updated_at_idx" ON "classrooms" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "classrooms_created_at_idx" ON "classrooms" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "classroom_memberships_classroom_idx" ON "classroom_memberships" USING btree ("classroom_id");
  CREATE INDEX IF NOT EXISTS "classroom_memberships_student_idx" ON "classroom_memberships" USING btree ("student_id");
  CREATE INDEX IF NOT EXISTS "classroom_memberships_updated_at_idx" ON "classroom_memberships" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "classroom_memberships_created_at_idx" ON "classroom_memberships" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "questions_answers_order_idx" ON "questions_answers" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "questions_answers_parent_id_idx" ON "questions_answers" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "questions_answers_author_idx" ON "questions_answers" USING btree ("author_id");
  CREATE INDEX IF NOT EXISTS "questions_user_idx" ON "questions" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "questions_lesson_idx" ON "questions" USING btree ("lesson_id");
  CREATE INDEX IF NOT EXISTS "questions_chapter_idx" ON "questions" USING btree ("chapter_id");
  CREATE INDEX IF NOT EXISTS "questions_class_idx" ON "questions" USING btree ("class_id");
  CREATE INDEX IF NOT EXISTS "questions_attachment_idx" ON "questions" USING btree ("attachment_id");
  CREATE INDEX IF NOT EXISTS "questions_updated_at_idx" ON "questions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "questions_created_at_idx" ON "questions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "quiz_questions_options_order_idx" ON "quiz_questions_options" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "quiz_questions_options_parent_id_idx" ON "quiz_questions_options" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "quiz_questions_updated_at_idx" ON "quiz_questions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "quiz_questions_created_at_idx" ON "quiz_questions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "quiz_questions__status_idx" ON "quiz_questions" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "quiz_questions_texts_order_parent" ON "quiz_questions_texts" USING btree ("order","parent_id");
  CREATE INDEX IF NOT EXISTS "quiz_questions_rels_order_idx" ON "quiz_questions_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "quiz_questions_rels_parent_idx" ON "quiz_questions_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "quiz_questions_rels_path_idx" ON "quiz_questions_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "quiz_questions_rels_media_id_idx" ON "quiz_questions_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_version_options_order_idx" ON "_quiz_questions_v_version_options" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_version_options_parent_id_idx" ON "_quiz_questions_v_version_options" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_parent_idx" ON "_quiz_questions_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_version_version_updated_at_idx" ON "_quiz_questions_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_version_version_created_at_idx" ON "_quiz_questions_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_version_version__status_idx" ON "_quiz_questions_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_created_at_idx" ON "_quiz_questions_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_updated_at_idx" ON "_quiz_questions_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_latest_idx" ON "_quiz_questions_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_texts_order_parent" ON "_quiz_questions_v_texts" USING btree ("order","parent_id");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_rels_order_idx" ON "_quiz_questions_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_rels_parent_idx" ON "_quiz_questions_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_rels_path_idx" ON "_quiz_questions_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_quiz_questions_v_rels_media_id_idx" ON "_quiz_questions_v_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "quizzes_course_idx" ON "quizzes" USING btree ("course_id");
  CREATE INDEX IF NOT EXISTS "quizzes_chapter_idx" ON "quizzes" USING btree ("chapter_id");
  CREATE INDEX IF NOT EXISTS "quizzes_updated_at_idx" ON "quizzes" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "quizzes_created_at_idx" ON "quizzes" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "quizzes__status_idx" ON "quizzes" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "quizzes_texts_order_parent" ON "quizzes_texts" USING btree ("order","parent_id");
  CREATE INDEX IF NOT EXISTS "quizzes_rels_order_idx" ON "quizzes_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "quizzes_rels_parent_idx" ON "quizzes_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "quizzes_rels_path_idx" ON "quizzes_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "quizzes_rels_quiz_questions_id_idx" ON "quizzes_rels" USING btree ("quiz_questions_id");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_parent_idx" ON "_quizzes_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_version_version_course_idx" ON "_quizzes_v" USING btree ("version_course_id");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_version_version_chapter_idx" ON "_quizzes_v" USING btree ("version_chapter_id");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_version_version_updated_at_idx" ON "_quizzes_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_version_version_created_at_idx" ON "_quizzes_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_version_version__status_idx" ON "_quizzes_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_created_at_idx" ON "_quizzes_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_updated_at_idx" ON "_quizzes_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_latest_idx" ON "_quizzes_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_texts_order_parent" ON "_quizzes_v_texts" USING btree ("order","parent_id");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_rels_order_idx" ON "_quizzes_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_rels_parent_idx" ON "_quizzes_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_rels_path_idx" ON "_quizzes_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_quizzes_v_rels_quiz_questions_id_idx" ON "_quizzes_v_rels" USING btree ("quiz_questions_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_question_order_order_idx" ON "quiz_attempts_question_order" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_question_order_parent_id_idx" ON "quiz_attempts_question_order" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_question_order_question_idx" ON "quiz_attempts_question_order" USING btree ("question_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_answers_selected_option_ids_order_idx" ON "quiz_attempts_answers_selected_option_ids" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_answers_selected_option_ids_parent_id_idx" ON "quiz_attempts_answers_selected_option_ids" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_answers_option_order_order_idx" ON "quiz_attempts_answers_option_order" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_answers_option_order_parent_id_idx" ON "quiz_attempts_answers_option_order" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_answers_order_idx" ON "quiz_attempts_answers" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_answers_parent_id_idx" ON "quiz_attempts_answers" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_answers_question_idx" ON "quiz_attempts_answers" USING btree ("question_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_quiz_idx" ON "quiz_attempts" USING btree ("quiz_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_lesson_idx" ON "quiz_attempts" USING btree ("lesson_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_user_idx" ON "quiz_attempts" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_updated_at_idx" ON "quiz_attempts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "quiz_attempts_created_at_idx" ON "quiz_attempts" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "notifications_recipient_idx" ON "notifications" USING btree ("recipient_id");
  CREATE INDEX IF NOT EXISTS "notifications_question_idx" ON "notifications" USING btree ("question_id");
  CREATE INDEX IF NOT EXISTS "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "lesson_progress_user_idx" ON "lesson_progress" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "lesson_progress_lesson_idx" ON "lesson_progress" USING btree ("lesson_id");
  CREATE INDEX IF NOT EXISTS "lesson_progress_chapter_idx" ON "lesson_progress" USING btree ("chapter_id");
  CREATE INDEX IF NOT EXISTS "lesson_progress_class_idx" ON "lesson_progress" USING btree ("class_id");
  CREATE INDEX IF NOT EXISTS "lesson_progress_updated_at_idx" ON "lesson_progress" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "lesson_progress_created_at_idx" ON "lesson_progress" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "feedback_updated_at_idx" ON "feedback" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "feedback_created_at_idx" ON "feedback" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_user_idx" ON "lesson_feedback" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_lesson_idx" ON "lesson_feedback" USING btree ("lesson_id");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_chapter_idx" ON "lesson_feedback" USING btree ("chapter_id");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_class_idx" ON "lesson_feedback" USING btree ("class_id");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_replied_by_idx" ON "lesson_feedback" USING btree ("replied_by_id");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_updated_at_idx" ON "lesson_feedback" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "lesson_feedback_created_at_idx" ON "lesson_feedback" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "admin_help__status_idx" ON "admin_help" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_admin_help_v_version_version__status_idx" ON "_admin_help_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_admin_help_v_created_at_idx" ON "_admin_help_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_admin_help_v_updated_at_idx" ON "_admin_help_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_admin_help_v_latest_idx" ON "_admin_help_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "footer_explore_links_order_idx" ON "footer_explore_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "footer_explore_links_parent_id_idx" ON "footer_explore_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_resources_links_order_idx" ON "footer_resources_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "footer_resources_links_parent_id_idx" ON "footer_resources_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "footer__status_idx" ON "footer" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_footer_v_version_explore_links_order_idx" ON "_footer_v_version_explore_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_footer_v_version_explore_links_parent_id_idx" ON "_footer_v_version_explore_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_footer_v_version_resources_links_order_idx" ON "_footer_v_version_resources_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_footer_v_version_resources_links_parent_id_idx" ON "_footer_v_version_resources_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "lessons_assessment_assessment_quiz_idx" ON "lessons" USING btree ("assessment_quiz_id");
  CREATE INDEX IF NOT EXISTS "_lessons_v_version_assessment_version_assessment_quiz_idx" ON "_lessons_v" USING btree ("version_assessment_quiz_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_classrooms_id_idx" ON "payload_locked_documents_rels" USING btree ("classrooms_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_classroom_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("classroom_memberships_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("questions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_quiz_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("quiz_questions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_quizzes_id_idx" ON "payload_locked_documents_rels" USING btree ("quizzes_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_quiz_attempts_id_idx" ON "payload_locked_documents_rels" USING btree ("quiz_attempts_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_lesson_progress_id_idx" ON "payload_locked_documents_rels" USING btree ("lesson_progress_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_lesson_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("lesson_feedback_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lessons_blocks_section_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_quiz_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_section_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_quiz_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_section_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quiz_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_section_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_quiz_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classrooms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classroom_memberships" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions_answers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quiz_questions_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quiz_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quiz_questions_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quiz_questions_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_quiz_questions_v_version_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_quiz_questions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_quiz_questions_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_quiz_questions_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_quizzes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_quizzes_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_quizzes_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quiz_attempts_question_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quiz_attempts_answers_selected_option_ids" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quiz_attempts_answers_option_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quiz_attempts_answers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quiz_attempts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lesson_progress" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lesson_feedback" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "admin_help" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_admin_help_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_explore_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_resources_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_explore_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_resources_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "lessons_blocks_section_block" CASCADE;
  DROP TABLE "lessons_blocks_quiz_block" CASCADE;
  DROP TABLE "_lessons_v_blocks_section_block" CASCADE;
  DROP TABLE "_lessons_v_blocks_quiz_block" CASCADE;
  DROP TABLE "pages_blocks_section_block" CASCADE;
  DROP TABLE "pages_blocks_quiz_block" CASCADE;
  DROP TABLE "_pages_v_blocks_section_block" CASCADE;
  DROP TABLE "_pages_v_blocks_quiz_block" CASCADE;
  DROP TABLE "classrooms" CASCADE;
  DROP TABLE "classroom_memberships" CASCADE;
  DROP TABLE "questions_answers" CASCADE;
  DROP TABLE "questions" CASCADE;
  DROP TABLE "quiz_questions_options" CASCADE;
  DROP TABLE "quiz_questions" CASCADE;
  DROP TABLE "quiz_questions_texts" CASCADE;
  DROP TABLE "quiz_questions_rels" CASCADE;
  DROP TABLE "_quiz_questions_v_version_options" CASCADE;
  DROP TABLE "_quiz_questions_v" CASCADE;
  DROP TABLE "_quiz_questions_v_texts" CASCADE;
  DROP TABLE "_quiz_questions_v_rels" CASCADE;
  DROP TABLE "quizzes" CASCADE;
  DROP TABLE "quizzes_texts" CASCADE;
  DROP TABLE "quizzes_rels" CASCADE;
  DROP TABLE "_quizzes_v" CASCADE;
  DROP TABLE "_quizzes_v_texts" CASCADE;
  DROP TABLE "_quizzes_v_rels" CASCADE;
  DROP TABLE "quiz_attempts_question_order" CASCADE;
  DROP TABLE "quiz_attempts_answers_selected_option_ids" CASCADE;
  DROP TABLE "quiz_attempts_answers_option_order" CASCADE;
  DROP TABLE "quiz_attempts_answers" CASCADE;
  DROP TABLE "quiz_attempts" CASCADE;
  DROP TABLE "notifications" CASCADE;
  DROP TABLE "lesson_progress" CASCADE;
  DROP TABLE "feedback" CASCADE;
  DROP TABLE "lesson_feedback" CASCADE;
  DROP TABLE "admin_help" CASCADE;
  DROP TABLE "_admin_help_v" CASCADE;
  DROP TABLE "footer_explore_links" CASCADE;
  DROP TABLE "footer_resources_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "_footer_v_version_explore_links" CASCADE;
  DROP TABLE "_footer_v_version_resources_links" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  ALTER TABLE "lessons" DROP CONSTRAINT "lessons_assessment_quiz_id_quizzes_id_fk";
  
  ALTER TABLE "_lessons_v" DROP CONSTRAINT "_lessons_v_version_assessment_quiz_id_quizzes_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_classrooms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_classroom_memberships_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_questions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quiz_questions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quizzes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quiz_attempts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notifications_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lesson_progress_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feedback_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lesson_feedback_fk";
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'staff'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'staff');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'staff'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  DROP INDEX "lessons_assessment_assessment_quiz_idx";
  DROP INDEX "_lessons_v_version_assessment_version_assessment_quiz_idx";
  DROP INDEX "payload_locked_documents_rels_classrooms_id_idx";
  DROP INDEX "payload_locked_documents_rels_classroom_memberships_id_idx";
  DROP INDEX "payload_locked_documents_rels_questions_id_idx";
  DROP INDEX "payload_locked_documents_rels_quiz_questions_id_idx";
  DROP INDEX "payload_locked_documents_rels_quizzes_id_idx";
  DROP INDEX "payload_locked_documents_rels_quiz_attempts_id_idx";
  DROP INDEX "payload_locked_documents_rels_notifications_id_idx";
  DROP INDEX "payload_locked_documents_rels_lesson_progress_id_idx";
  DROP INDEX "payload_locked_documents_rels_feedback_id_idx";
  DROP INDEX "payload_locked_documents_rels_lesson_feedback_id_idx";
  ALTER TABLE "classes" ALTER COLUMN "order" SET DEFAULT 0;
  ALTER TABLE "chapters" DROP COLUMN "chapter_number";
  ALTER TABLE "lessons" DROP COLUMN "order";
  ALTER TABLE "lessons" DROP COLUMN "assessment_quiz_id";
  ALTER TABLE "lessons" DROP COLUMN "assessment_show_answers";
  ALTER TABLE "lessons" DROP COLUMN "assessment_max_attempts";
  ALTER TABLE "lessons" DROP COLUMN "assessment_time_limit_sec";
  ALTER TABLE "_lessons_v" DROP COLUMN "version_order";
  ALTER TABLE "_lessons_v" DROP COLUMN "version_assessment_quiz_id";
  ALTER TABLE "_lessons_v" DROP COLUMN "version_assessment_show_answers";
  ALTER TABLE "_lessons_v" DROP COLUMN "version_assessment_max_attempts";
  ALTER TABLE "_lessons_v" DROP COLUMN "version_assessment_time_limit_sec";
  ALTER TABLE "pages" DROP COLUMN "nav_order";
  ALTER TABLE "_pages_v" DROP COLUMN "version_nav_order";
  ALTER TABLE "accounts" DROP COLUMN "email_verified";
  ALTER TABLE "accounts" DROP COLUMN "email_verified_at";
  ALTER TABLE "accounts" DROP COLUMN "email_verification_token_hash";
  ALTER TABLE "accounts" DROP COLUMN "email_verification_expires_at";
  ALTER TABLE "users" DROP COLUMN "first_name";
  ALTER TABLE "users" DROP COLUMN "last_name";
  ALTER TABLE "users" DROP COLUMN "admin_theme";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "classrooms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "classroom_memberships_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "questions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quiz_questions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quizzes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quiz_attempts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notifications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lesson_progress_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feedback_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lesson_feedback_id";
  DROP TYPE "public"."enum_lessons_blocks_section_block_size";
  DROP TYPE "public"."enum__lessons_v_blocks_section_block_size";
  DROP TYPE "public"."enum_pages_blocks_section_block_size";
  DROP TYPE "public"."enum__pages_v_blocks_section_block_size";
  DROP TYPE "public"."enum_users_admin_theme";
  DROP TYPE "public"."enum_questions_status";
  DROP TYPE "public"."enum_quiz_questions_difficulty";
  DROP TYPE "public"."enum_quiz_questions_status";
  DROP TYPE "public"."enum__quiz_questions_v_version_difficulty";
  DROP TYPE "public"."enum__quiz_questions_v_version_status";
  DROP TYPE "public"."enum_quizzes_difficulty";
  DROP TYPE "public"."enum_quizzes_scoring";
  DROP TYPE "public"."enum_quizzes_status";
  DROP TYPE "public"."enum__quizzes_v_version_difficulty";
  DROP TYPE "public"."enum__quizzes_v_version_scoring";
  DROP TYPE "public"."enum__quizzes_v_version_status";
  DROP TYPE "public"."enum_notifications_type";
  DROP TYPE "public"."enum_lesson_feedback_rating";
  DROP TYPE "public"."enum_admin_help_status";
  DROP TYPE "public"."enum__admin_help_v_version_status";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_status";`)
}
