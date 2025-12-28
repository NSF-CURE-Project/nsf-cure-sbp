import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_lessons_blocks_resources_list_resources_type" AS ENUM('link', 'video', 'download', 'other');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__lessons_v_blocks_resources_list_resources_type" AS ENUM('link', 'video', 'download', 'other');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_blocks_resources_list_resources_type" AS ENUM('link', 'video', 'download', 'other');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_blocks_resources_list_resources_type" AS ENUM('link', 'video', 'download', 'other');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_accounts_role" AS ENUM('student', 'staff', 'admin');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE TABLE IF NOT EXISTS "pages_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_pages_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_pages_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" "enum_pages_blocks_resources_list_resources_type" DEFAULT 'link'
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum_pages_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum__pages_v_blocks_section_title_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__pages_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" "enum__pages_v_blocks_resources_list_resources_type" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum__pages_v_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "accounts_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_accounts_role" DEFAULT 'student' NOT NULL,
  	"full_name" varchar,
  	"sso_provider" varchar,
  	"sso_subject" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  ALTER TABLE "classes_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "classes_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_classes_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chapters_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_chapters_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_problem_sets_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_problem_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_version_problem_sets_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_version_problem_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_goals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_getting_started_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_version_goals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v_version_getting_started_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_page_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_sections_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_version_sections_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v_version_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_resources_page_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v_version_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_page_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "getting_started" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_version_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v_version_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_getting_started_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE IF EXISTS "classes_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "classes_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "_classes_v" CASCADE;
  DROP TABLE IF EXISTS "_classes_v_rels" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "chapters_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v" CASCADE;
  DROP TABLE IF EXISTS "_chapters_v_rels" CASCADE;
  DROP TABLE IF EXISTS "lessons_problem_sets_questions" CASCADE;
  DROP TABLE IF EXISTS "lessons_problem_sets" CASCADE;
  DROP TABLE IF EXISTS "_lessons_v_version_problem_sets_questions" CASCADE;
  DROP TABLE IF EXISTS "_lessons_v_version_problem_sets" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "home_page_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "home_page_goals" CASCADE;
  DROP TABLE IF EXISTS "home_page_getting_started_steps" CASCADE;
  DROP TABLE IF EXISTS "home_page" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_version_goals" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v_version_getting_started_steps" CASCADE;
  DROP TABLE IF EXISTS "_home_page_v" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "resources_page_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "resources_page_sections_resources" CASCADE;
  DROP TABLE IF EXISTS "resources_page_sections" CASCADE;
  DROP TABLE IF EXISTS "resources_page" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_version_sections_resources" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v_version_sections" CASCADE;
  DROP TABLE IF EXISTS "_resources_page_v" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "contact_page_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "contact_page_contacts" CASCADE;
  DROP TABLE IF EXISTS "contact_page" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v_version_contacts" CASCADE;
  DROP TABLE IF EXISTS "_contact_page_v" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "getting_started_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "getting_started_steps" CASCADE;
  DROP TABLE IF EXISTS "getting_started_resources" CASCADE;
  DROP TABLE IF EXISTS "getting_started" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_version_steps" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v_version_resources" CASCADE;
  DROP TABLE IF EXISTS "_getting_started_v" CASCADE;
  ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_video_id_media_id_fk";
  
  ALTER TABLE "_lessons_v" DROP CONSTRAINT IF EXISTS "_lessons_v_version_video_id_media_id_fk";
  
  DROP INDEX IF EXISTS "classes__status_idx";
  DROP INDEX IF EXISTS "chapters__status_idx";
  DROP INDEX IF EXISTS "lessons_slug_idx";
  DROP INDEX IF EXISTS "lessons_video_idx";
  DROP INDEX IF EXISTS "_lessons_v_version_version_slug_idx";
  DROP INDEX IF EXISTS "_lessons_v_version_version_video_idx";
  ALTER TABLE "classes" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "classes" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "chapters" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "chapters" ALTER COLUMN "class_id" SET NOT NULL;
  ALTER TABLE "chapters" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "lessons_blocks_resources_list_resources" ALTER COLUMN "type" SET DEFAULT 'link'::"public"."enum_lessons_blocks_resources_list_resources_type";
  ALTER TABLE "lessons_blocks_resources_list_resources" ALTER COLUMN "type" SET DATA TYPE "public"."enum_lessons_blocks_resources_list_resources_type" USING "type"::"public"."enum_lessons_blocks_resources_list_resources_type";
  ALTER TABLE "_lessons_v_blocks_resources_list_resources" ALTER COLUMN "type" SET DEFAULT 'link'::"public"."enum__lessons_v_blocks_resources_list_resources_type";
  ALTER TABLE "_lessons_v_blocks_resources_list_resources" ALTER COLUMN "type" SET DATA TYPE "public"."enum__lessons_v_blocks_resources_list_resources_type" USING "type"::"public"."enum__lessons_v_blocks_resources_list_resources_type";
  ALTER TABLE "lessons" ADD COLUMN "chapter_id" integer;
  ALTER TABLE "_lessons_v" ADD COLUMN "version_chapter_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounts_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "accounts_id" integer;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_hero_block" ADD CONSTRAINT "pages_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_section_title" ADD CONSTRAINT "pages_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_rich_text_block" ADD CONSTRAINT "pages_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_text_block" ADD CONSTRAINT "pages_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_video_block" ADD CONSTRAINT "pages_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_video_block" ADD CONSTRAINT "pages_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_list_block_items" ADD CONSTRAINT "pages_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_list_block" ADD CONSTRAINT "pages_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_steps_list_steps" ADD CONSTRAINT "pages_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_steps_list" ADD CONSTRAINT "pages_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_button_block" ADD CONSTRAINT "pages_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_resources_list_resources" ADD CONSTRAINT "pages_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_resources_list" ADD CONSTRAINT "pages_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_contacts_list_contacts" ADD CONSTRAINT "pages_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_contacts_list_contacts" ADD CONSTRAINT "pages_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pages_blocks_contacts_list" ADD CONSTRAINT "pages_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_hero_block" ADD CONSTRAINT "_pages_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_section_title" ADD CONSTRAINT "_pages_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_rich_text_block" ADD CONSTRAINT "_pages_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_text_block" ADD CONSTRAINT "_pages_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_video_block" ADD CONSTRAINT "_pages_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_video_block" ADD CONSTRAINT "_pages_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_list_block_items" ADD CONSTRAINT "_pages_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_list_block" ADD CONSTRAINT "_pages_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_steps_list_steps" ADD CONSTRAINT "_pages_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_steps_list" ADD CONSTRAINT "_pages_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_button_block" ADD CONSTRAINT "_pages_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_resources_list_resources" ADD CONSTRAINT "_pages_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_resources_list" ADD CONSTRAINT "_pages_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_pages_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_pages_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_contacts_list" ADD CONSTRAINT "_pages_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "accounts_sessions" ADD CONSTRAINT "accounts_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "pages_blocks_hero_block_order_idx" ON "pages_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_hero_block_parent_id_idx" ON "pages_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_hero_block_path_idx" ON "pages_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_section_title_order_idx" ON "pages_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_section_title_parent_id_idx" ON "pages_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_section_title_path_idx" ON "pages_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_block_order_idx" ON "pages_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_block_parent_id_idx" ON "pages_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_block_path_idx" ON "pages_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_text_block_order_idx" ON "pages_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_text_block_parent_id_idx" ON "pages_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_text_block_path_idx" ON "pages_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_video_block_order_idx" ON "pages_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_video_block_parent_id_idx" ON "pages_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_video_block_path_idx" ON "pages_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_video_block_video_idx" ON "pages_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_list_block_items_order_idx" ON "pages_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_list_block_items_parent_id_idx" ON "pages_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_list_block_order_idx" ON "pages_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_list_block_parent_id_idx" ON "pages_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_list_block_path_idx" ON "pages_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_steps_list_steps_order_idx" ON "pages_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_steps_list_steps_parent_id_idx" ON "pages_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_steps_list_order_idx" ON "pages_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_steps_list_parent_id_idx" ON "pages_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_steps_list_path_idx" ON "pages_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_button_block_order_idx" ON "pages_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_button_block_parent_id_idx" ON "pages_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_button_block_path_idx" ON "pages_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_resources_list_resources_order_idx" ON "pages_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_resources_list_resources_parent_id_idx" ON "pages_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_resources_list_order_idx" ON "pages_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_resources_list_parent_id_idx" ON "pages_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_resources_list_path_idx" ON "pages_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_contacts_list_contacts_order_idx" ON "pages_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_contacts_list_contacts_parent_id_idx" ON "pages_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_contacts_list_contacts_photo_idx" ON "pages_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_contacts_list_order_idx" ON "pages_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_contacts_list_parent_id_idx" ON "pages_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_contacts_list_path_idx" ON "pages_blocks_contacts_list" USING btree ("_path");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_block_order_idx" ON "_pages_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_block_parent_id_idx" ON "_pages_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_block_path_idx" ON "_pages_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_section_title_order_idx" ON "_pages_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_section_title_parent_id_idx" ON "_pages_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_section_title_path_idx" ON "_pages_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_rich_text_block_order_idx" ON "_pages_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_rich_text_block_parent_id_idx" ON "_pages_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_rich_text_block_path_idx" ON "_pages_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_text_block_order_idx" ON "_pages_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_text_block_parent_id_idx" ON "_pages_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_text_block_path_idx" ON "_pages_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_video_block_order_idx" ON "_pages_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_video_block_parent_id_idx" ON "_pages_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_video_block_path_idx" ON "_pages_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_video_block_video_idx" ON "_pages_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_list_block_items_order_idx" ON "_pages_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_list_block_items_parent_id_idx" ON "_pages_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_list_block_order_idx" ON "_pages_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_list_block_parent_id_idx" ON "_pages_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_list_block_path_idx" ON "_pages_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_list_steps_order_idx" ON "_pages_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_list_steps_parent_id_idx" ON "_pages_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_list_order_idx" ON "_pages_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_list_parent_id_idx" ON "_pages_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_list_path_idx" ON "_pages_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_button_block_order_idx" ON "_pages_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_button_block_parent_id_idx" ON "_pages_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_button_block_path_idx" ON "_pages_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_resources_list_resources_order_idx" ON "_pages_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_resources_list_resources_parent_id_idx" ON "_pages_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_resources_list_order_idx" ON "_pages_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_resources_list_parent_id_idx" ON "_pages_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_resources_list_path_idx" ON "_pages_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contacts_list_contacts_order_idx" ON "_pages_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contacts_list_contacts_parent_id_idx" ON "_pages_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contacts_list_contacts_photo_idx" ON "_pages_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contacts_list_order_idx" ON "_pages_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contacts_list_parent_id_idx" ON "_pages_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contacts_list_path_idx" ON "_pages_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "accounts_sessions_order_idx" ON "accounts_sessions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "accounts_sessions_parent_id_idx" ON "accounts_sessions" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "accounts_updated_at_idx" ON "accounts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "accounts_created_at_idx" ON "accounts" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "accounts_email_idx" ON "accounts" USING btree ("email");
  DO $$ BEGIN
    ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_version_chapter_id_chapters_id_fk" FOREIGN KEY ("version_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounts_fk" FOREIGN KEY ("accounts_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_accounts_fk" FOREIGN KEY ("accounts_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "lessons_chapter_idx" ON "lessons" USING btree ("chapter_id");
  CREATE INDEX IF NOT EXISTS "_lessons_v_version_version_chapter_idx" ON "_lessons_v" USING btree ("version_chapter_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_accounts_id_idx" ON "payload_locked_documents_rels" USING btree ("accounts_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_accounts_id_idx" ON "payload_preferences_rels" USING btree ("accounts_id");
  ALTER TABLE "classes" DROP COLUMN "_status";
  ALTER TABLE "chapters" DROP COLUMN "_status";
  ALTER TABLE "lessons" DROP COLUMN "video_id";
  ALTER TABLE "lessons" DROP COLUMN "text_content";
  ALTER TABLE "_lessons_v" DROP COLUMN "version_video_id";
  ALTER TABLE "_lessons_v" DROP COLUMN "version_text_content";
  DROP TYPE IF EXISTS "public"."enum_classes_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum_classes_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum_classes_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum_classes_status";
  DROP TYPE IF EXISTS "public"."enum__classes_v_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum__classes_v_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum__classes_v_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum__classes_v_version_status";
  DROP TYPE IF EXISTS "public"."enum_chapters_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum_chapters_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum_chapters_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum_chapters_status";
  DROP TYPE IF EXISTS "public"."enum__chapters_v_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum__chapters_v_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum__chapters_v_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum__chapters_v_version_status";
  DROP TYPE IF EXISTS "public"."enum_home_page_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum_home_page_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum_home_page_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum_home_page_status";
  DROP TYPE IF EXISTS "public"."enum__home_page_v_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum__home_page_v_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum__home_page_v_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum__home_page_v_version_status";
  DROP TYPE IF EXISTS "public"."enum_resources_page_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum_resources_page_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum_resources_page_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum_resources_page_sections_resources_type";
  DROP TYPE IF EXISTS "public"."enum_resources_page_status";
  DROP TYPE IF EXISTS "public"."enum__resources_page_v_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum__resources_page_v_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum__resources_page_v_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum__resources_page_v_version_sections_resources_type";
  DROP TYPE IF EXISTS "public"."enum__resources_page_v_version_status";
  DROP TYPE IF EXISTS "public"."enum_contact_page_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum_contact_page_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum_contact_page_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum_contact_page_contacts_category";
  DROP TYPE IF EXISTS "public"."enum_contact_page_status";
  DROP TYPE IF EXISTS "public"."enum__contact_page_v_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum__contact_page_v_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum__contact_page_v_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum__contact_page_v_version_contacts_category";
  DROP TYPE IF EXISTS "public"."enum__contact_page_v_version_status";
  DROP TYPE IF EXISTS "public"."enum_getting_started_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum_getting_started_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum_getting_started_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum_getting_started_status";
  DROP TYPE IF EXISTS "public"."enum__getting_started_v_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum__getting_started_v_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum__getting_started_v_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum__getting_started_v_version_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_classes_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_classes_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_classes_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_classes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__classes_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__classes_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__classes_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__classes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_chapters_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_chapters_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_chapters_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_chapters_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__chapters_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__chapters_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__chapters_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__chapters_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_home_page_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_home_page_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_home_page_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_home_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_page_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__home_page_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__home_page_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__home_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_resources_page_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_resources_page_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_resources_page_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_resources_page_sections_resources_type" AS ENUM('link', 'video', 'download', 'other');
  CREATE TYPE "public"."enum_resources_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resources_page_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__resources_page_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__resources_page_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__resources_page_v_version_sections_resources_type" AS ENUM('link', 'video', 'download', 'other');
  CREATE TYPE "public"."enum__resources_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_contact_page_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_contact_page_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_contact_page_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_contact_page_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_contact_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_page_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__contact_page_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__contact_page_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__contact_page_v_version_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__contact_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_getting_started_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_getting_started_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_getting_started_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_getting_started_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__getting_started_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__getting_started_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__getting_started_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__getting_started_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE IF NOT EXISTS "classes_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_classes_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_classes_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum_classes_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "classes_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum__classes_v_blocks_section_title_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__classes_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum__classes_v_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__classes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_classes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"chapters_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_chapters_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_chapters_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum_chapters_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "chapters_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum__chapters_v_blocks_section_title_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__chapters_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum__chapters_v_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_class_id" integer,
  	"version_slug" varchar,
  	"version_objective" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__chapters_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_chapters_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lessons_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "lessons_problem_sets_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_text" jsonb,
  	"answer" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "lessons_problem_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_lessons_v_version_problem_sets_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question_text" jsonb,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_lessons_v_version_problem_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_home_page_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_home_page_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum_home_page_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_getting_started_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'NSF CURE Summer Bridge Program',
  	"hero_subtitle" varchar,
  	"hero_button_label" varchar DEFAULT 'Getting Started',
  	"hero_button_href" varchar DEFAULT '/getting-started',
  	"purpose_title" varchar DEFAULT 'Our Purpose at NSF CURE SBP',
  	"purpose_body" jsonb,
  	"goals_title" varchar DEFAULT 'Program Goals',
  	"goals_intro_rich" jsonb,
  	"getting_started_title" varchar DEFAULT 'Getting Started',
  	"getting_started_body" jsonb,
  	"_status" "enum_home_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum__home_page_v_blocks_section_title_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__home_page_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum__home_page_v_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_version_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v_version_getting_started_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_home_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar DEFAULT 'NSF CURE Summer Bridge Program',
  	"version_hero_subtitle" varchar,
  	"version_hero_button_label" varchar DEFAULT 'Getting Started',
  	"version_hero_button_href" varchar DEFAULT '/getting-started',
  	"version_purpose_title" varchar DEFAULT 'Our Purpose at NSF CURE SBP',
  	"version_purpose_body" jsonb,
  	"version_goals_title" varchar DEFAULT 'Program Goals',
  	"version_goals_intro_rich" jsonb,
  	"version_getting_started_title" varchar DEFAULT 'Getting Started',
  	"version_getting_started_body" jsonb,
  	"version__status" "enum__home_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_resources_page_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_resources_page_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum_resources_page_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_sections_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" "enum_resources_page_sections_resources_type" DEFAULT 'link'
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resources_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'Additional Resources',
  	"hero_intro" varchar,
  	"_status" "enum_resources_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum__resources_page_v_blocks_section_title_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__resources_page_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum__resources_page_v_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_version_sections_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" "enum__resources_page_v_version_sections_resources_type" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resources_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar DEFAULT 'Additional Resources',
  	"version_hero_intro" varchar,
  	"version__status" "enum__resources_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_contact_page_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_contact_page_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum_contact_page_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum_contact_page_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "contact_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'Contact Us',
  	"hero_intro" varchar,
  	"_status" "enum_contact_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum__contact_page_v_blocks_section_title_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__contact_page_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum__contact_page_v_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v_version_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum__contact_page_v_version_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar DEFAULT 'Contact Us',
  	"version_hero_intro" varchar,
  	"version__status" "enum__contact_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_getting_started_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_getting_started_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum_getting_started_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_started" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Getting Started',
  	"intro" jsonb,
  	"_status" "enum_getting_started_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum__getting_started_v_blocks_section_title_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__getting_started_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum__getting_started_v_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v_version_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_getting_started_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Getting Started',
  	"version_intro" jsonb,
  	"version__status" "enum__getting_started_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "pages_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_video_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounts_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE IF EXISTS "pages_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "pages_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "pages" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_hero_block" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_section_title" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_rich_text_block" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_text_block" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_video_block" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_list_block_items" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_list_block" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_steps_list" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_button_block" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_resources_list" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_contacts_list" CASCADE;
  DROP TABLE IF EXISTS "_pages_v" CASCADE;
  DROP TABLE IF EXISTS "accounts_sessions" CASCADE;
  DROP TABLE IF EXISTS "accounts" CASCADE;
  ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_chapter_id_chapters_id_fk";
  
  ALTER TABLE "_lessons_v" DROP CONSTRAINT IF EXISTS "_lessons_v_version_chapter_id_chapters_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_accounts_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_accounts_fk";
  
  DROP INDEX IF EXISTS "lessons_chapter_idx";
  DROP INDEX IF EXISTS "_lessons_v_version_version_chapter_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_accounts_id_idx";
  DROP INDEX IF EXISTS "payload_preferences_rels_accounts_id_idx";
  ALTER TABLE "classes" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "classes" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "chapters" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "chapters" ALTER COLUMN "class_id" DROP NOT NULL;
  ALTER TABLE "chapters" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "lessons_blocks_resources_list_resources" ALTER COLUMN "type" SET DATA TYPE varchar;
  ALTER TABLE "lessons_blocks_resources_list_resources" ALTER COLUMN "type" DROP DEFAULT;
  ALTER TABLE "_lessons_v_blocks_resources_list_resources" ALTER COLUMN "type" SET DATA TYPE varchar;
  ALTER TABLE "_lessons_v_blocks_resources_list_resources" ALTER COLUMN "type" DROP DEFAULT;
  ALTER TABLE "classes" ADD COLUMN "_status" "enum_classes_status" DEFAULT 'draft';
  ALTER TABLE "chapters" ADD COLUMN "_status" "enum_chapters_status" DEFAULT 'draft';
  ALTER TABLE "lessons" ADD COLUMN "video_id" integer;
  ALTER TABLE "lessons" ADD COLUMN "text_content" jsonb;
  ALTER TABLE "_lessons_v" ADD COLUMN "version_video_id" integer;
  ALTER TABLE "_lessons_v" ADD COLUMN "version_text_content" jsonb;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_hero_block" ADD CONSTRAINT "classes_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_section_title" ADD CONSTRAINT "classes_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_rich_text_block" ADD CONSTRAINT "classes_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_text_block" ADD CONSTRAINT "classes_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_video_block" ADD CONSTRAINT "classes_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_video_block" ADD CONSTRAINT "classes_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_list_block_items" ADD CONSTRAINT "classes_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_list_block" ADD CONSTRAINT "classes_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_steps_list_steps" ADD CONSTRAINT "classes_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_steps_list" ADD CONSTRAINT "classes_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_button_block" ADD CONSTRAINT "classes_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_resources_list_resources" ADD CONSTRAINT "classes_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_resources_list" ADD CONSTRAINT "classes_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_contacts_list_contacts" ADD CONSTRAINT "classes_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_contacts_list_contacts" ADD CONSTRAINT "classes_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "classes_blocks_contacts_list" ADD CONSTRAINT "classes_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_hero_block" ADD CONSTRAINT "_classes_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_section_title" ADD CONSTRAINT "_classes_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_rich_text_block" ADD CONSTRAINT "_classes_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_text_block" ADD CONSTRAINT "_classes_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_video_block" ADD CONSTRAINT "_classes_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_video_block" ADD CONSTRAINT "_classes_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_list_block_items" ADD CONSTRAINT "_classes_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_list_block" ADD CONSTRAINT "_classes_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_steps_list_steps" ADD CONSTRAINT "_classes_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_steps_list" ADD CONSTRAINT "_classes_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_button_block" ADD CONSTRAINT "_classes_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_resources_list_resources" ADD CONSTRAINT "_classes_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_resources_list" ADD CONSTRAINT "_classes_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_classes_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_classes_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_blocks_contacts_list" ADD CONSTRAINT "_classes_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v" ADD CONSTRAINT "_classes_v_parent_id_classes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_rels" ADD CONSTRAINT "_classes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_classes_v_rels" ADD CONSTRAINT "_classes_v_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_hero_block" ADD CONSTRAINT "chapters_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_section_title" ADD CONSTRAINT "chapters_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_rich_text_block" ADD CONSTRAINT "chapters_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_text_block" ADD CONSTRAINT "chapters_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_video_block" ADD CONSTRAINT "chapters_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_video_block" ADD CONSTRAINT "chapters_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_list_block_items" ADD CONSTRAINT "chapters_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_list_block" ADD CONSTRAINT "chapters_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_steps_list_steps" ADD CONSTRAINT "chapters_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_steps_list" ADD CONSTRAINT "chapters_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_button_block" ADD CONSTRAINT "chapters_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_resources_list_resources" ADD CONSTRAINT "chapters_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_resources_list" ADD CONSTRAINT "chapters_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_contacts_list_contacts" ADD CONSTRAINT "chapters_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_contacts_list_contacts" ADD CONSTRAINT "chapters_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "chapters_blocks_contacts_list" ADD CONSTRAINT "chapters_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_hero_block" ADD CONSTRAINT "_chapters_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_section_title" ADD CONSTRAINT "_chapters_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_rich_text_block" ADD CONSTRAINT "_chapters_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_text_block" ADD CONSTRAINT "_chapters_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_video_block" ADD CONSTRAINT "_chapters_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_video_block" ADD CONSTRAINT "_chapters_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_list_block_items" ADD CONSTRAINT "_chapters_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_list_block" ADD CONSTRAINT "_chapters_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_steps_list_steps" ADD CONSTRAINT "_chapters_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_steps_list" ADD CONSTRAINT "_chapters_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_button_block" ADD CONSTRAINT "_chapters_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_resources_list_resources" ADD CONSTRAINT "_chapters_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_resources_list" ADD CONSTRAINT "_chapters_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_chapters_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_chapters_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_blocks_contacts_list" ADD CONSTRAINT "_chapters_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_parent_id_chapters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_version_class_id_classes_id_fk" FOREIGN KEY ("version_class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_rels" ADD CONSTRAINT "_chapters_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_chapters_v_rels" ADD CONSTRAINT "_chapters_v_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "lessons_problem_sets_questions" ADD CONSTRAINT "lessons_problem_sets_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_problem_sets"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "lessons_problem_sets" ADD CONSTRAINT "lessons_problem_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_lessons_v_version_problem_sets_questions" ADD CONSTRAINT "_lessons_v_version_problem_sets_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v_version_problem_sets"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_lessons_v_version_problem_sets" ADD CONSTRAINT "_lessons_v_version_problem_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_hero_block" ADD CONSTRAINT "home_page_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_section_title" ADD CONSTRAINT "home_page_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_rich_text_block" ADD CONSTRAINT "home_page_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_text_block" ADD CONSTRAINT "home_page_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_video_block" ADD CONSTRAINT "home_page_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_video_block" ADD CONSTRAINT "home_page_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_list_block_items" ADD CONSTRAINT "home_page_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_list_block" ADD CONSTRAINT "home_page_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_steps_list_steps" ADD CONSTRAINT "home_page_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_steps_list" ADD CONSTRAINT "home_page_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_button_block" ADD CONSTRAINT "home_page_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_resources_list_resources" ADD CONSTRAINT "home_page_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_resources_list" ADD CONSTRAINT "home_page_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_contacts_list_contacts" ADD CONSTRAINT "home_page_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_contacts_list_contacts" ADD CONSTRAINT "home_page_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_blocks_contacts_list" ADD CONSTRAINT "home_page_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_goals" ADD CONSTRAINT "home_page_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "home_page_getting_started_steps" ADD CONSTRAINT "home_page_getting_started_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_hero_block" ADD CONSTRAINT "_home_page_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_section_title" ADD CONSTRAINT "_home_page_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_rich_text_block" ADD CONSTRAINT "_home_page_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_text_block" ADD CONSTRAINT "_home_page_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_video_block" ADD CONSTRAINT "_home_page_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_video_block" ADD CONSTRAINT "_home_page_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_list_block_items" ADD CONSTRAINT "_home_page_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_list_block" ADD CONSTRAINT "_home_page_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_steps_list_steps" ADD CONSTRAINT "_home_page_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_steps_list" ADD CONSTRAINT "_home_page_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_button_block" ADD CONSTRAINT "_home_page_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_resources_list_resources" ADD CONSTRAINT "_home_page_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_resources_list" ADD CONSTRAINT "_home_page_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_home_page_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_home_page_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_blocks_contacts_list" ADD CONSTRAINT "_home_page_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_version_goals" ADD CONSTRAINT "_home_page_v_version_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_home_page_v_version_getting_started_steps" ADD CONSTRAINT "_home_page_v_version_getting_started_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_hero_block" ADD CONSTRAINT "resources_page_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_section_title" ADD CONSTRAINT "resources_page_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_rich_text_block" ADD CONSTRAINT "resources_page_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_text_block" ADD CONSTRAINT "resources_page_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_video_block" ADD CONSTRAINT "resources_page_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_video_block" ADD CONSTRAINT "resources_page_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_list_block_items" ADD CONSTRAINT "resources_page_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_list_block" ADD CONSTRAINT "resources_page_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_steps_list_steps" ADD CONSTRAINT "resources_page_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_steps_list" ADD CONSTRAINT "resources_page_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_button_block" ADD CONSTRAINT "resources_page_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_resources_list_resources" ADD CONSTRAINT "resources_page_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_resources_list" ADD CONSTRAINT "resources_page_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_contacts_list_contacts" ADD CONSTRAINT "resources_page_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_contacts_list_contacts" ADD CONSTRAINT "resources_page_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_blocks_contacts_list" ADD CONSTRAINT "resources_page_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_sections_resources" ADD CONSTRAINT "resources_page_sections_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_sections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "resources_page_sections" ADD CONSTRAINT "resources_page_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_hero_block" ADD CONSTRAINT "_resources_page_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_section_title" ADD CONSTRAINT "_resources_page_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_rich_text_block" ADD CONSTRAINT "_resources_page_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_text_block" ADD CONSTRAINT "_resources_page_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_video_block" ADD CONSTRAINT "_resources_page_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_video_block" ADD CONSTRAINT "_resources_page_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_list_block_items" ADD CONSTRAINT "_resources_page_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_list_block" ADD CONSTRAINT "_resources_page_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_steps_list_steps" ADD CONSTRAINT "_resources_page_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_steps_list" ADD CONSTRAINT "_resources_page_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_button_block" ADD CONSTRAINT "_resources_page_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_resources_list_resources" ADD CONSTRAINT "_resources_page_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_resources_list" ADD CONSTRAINT "_resources_page_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_resources_page_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_resources_page_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_blocks_contacts_list" ADD CONSTRAINT "_resources_page_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_version_sections_resources" ADD CONSTRAINT "_resources_page_v_version_sections_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_resources_page_v_version_sections" ADD CONSTRAINT "_resources_page_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_hero_block" ADD CONSTRAINT "contact_page_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_section_title" ADD CONSTRAINT "contact_page_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_rich_text_block" ADD CONSTRAINT "contact_page_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_text_block" ADD CONSTRAINT "contact_page_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_video_block" ADD CONSTRAINT "contact_page_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_video_block" ADD CONSTRAINT "contact_page_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_list_block_items" ADD CONSTRAINT "contact_page_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_list_block" ADD CONSTRAINT "contact_page_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_steps_list_steps" ADD CONSTRAINT "contact_page_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_steps_list" ADD CONSTRAINT "contact_page_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_button_block" ADD CONSTRAINT "contact_page_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_resources_list_resources" ADD CONSTRAINT "contact_page_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_resources_list" ADD CONSTRAINT "contact_page_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_contacts_list_contacts" ADD CONSTRAINT "contact_page_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_contacts_list_contacts" ADD CONSTRAINT "contact_page_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_blocks_contacts_list" ADD CONSTRAINT "contact_page_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_contacts" ADD CONSTRAINT "contact_page_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "contact_page_contacts" ADD CONSTRAINT "contact_page_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_hero_block" ADD CONSTRAINT "_contact_page_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_section_title" ADD CONSTRAINT "_contact_page_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_rich_text_block" ADD CONSTRAINT "_contact_page_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_text_block" ADD CONSTRAINT "_contact_page_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_video_block" ADD CONSTRAINT "_contact_page_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_video_block" ADD CONSTRAINT "_contact_page_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_list_block_items" ADD CONSTRAINT "_contact_page_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_list_block" ADD CONSTRAINT "_contact_page_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_steps_list_steps" ADD CONSTRAINT "_contact_page_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_steps_list" ADD CONSTRAINT "_contact_page_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_button_block" ADD CONSTRAINT "_contact_page_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_resources_list_resources" ADD CONSTRAINT "_contact_page_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_resources_list" ADD CONSTRAINT "_contact_page_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_contact_page_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_contact_page_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_blocks_contacts_list" ADD CONSTRAINT "_contact_page_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_version_contacts" ADD CONSTRAINT "_contact_page_v_version_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_contact_page_v_version_contacts" ADD CONSTRAINT "_contact_page_v_version_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_hero_block" ADD CONSTRAINT "getting_started_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_section_title" ADD CONSTRAINT "getting_started_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_rich_text_block" ADD CONSTRAINT "getting_started_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_text_block" ADD CONSTRAINT "getting_started_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_video_block" ADD CONSTRAINT "getting_started_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_video_block" ADD CONSTRAINT "getting_started_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_list_block_items" ADD CONSTRAINT "getting_started_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_list_block" ADD CONSTRAINT "getting_started_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_steps_list_steps" ADD CONSTRAINT "getting_started_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_steps_list" ADD CONSTRAINT "getting_started_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_button_block" ADD CONSTRAINT "getting_started_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_resources_list_resources" ADD CONSTRAINT "getting_started_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_resources_list" ADD CONSTRAINT "getting_started_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_contacts_list_contacts" ADD CONSTRAINT "getting_started_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_contacts_list_contacts" ADD CONSTRAINT "getting_started_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_blocks_contacts_list" ADD CONSTRAINT "getting_started_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_steps" ADD CONSTRAINT "getting_started_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "getting_started_resources" ADD CONSTRAINT "getting_started_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_hero_block" ADD CONSTRAINT "_getting_started_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_section_title" ADD CONSTRAINT "_getting_started_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_rich_text_block" ADD CONSTRAINT "_getting_started_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_text_block" ADD CONSTRAINT "_getting_started_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_video_block" ADD CONSTRAINT "_getting_started_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_video_block" ADD CONSTRAINT "_getting_started_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_list_block_items" ADD CONSTRAINT "_getting_started_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_list_block" ADD CONSTRAINT "_getting_started_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_steps_list_steps" ADD CONSTRAINT "_getting_started_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_steps_list" ADD CONSTRAINT "_getting_started_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_button_block" ADD CONSTRAINT "_getting_started_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_resources_list_resources" ADD CONSTRAINT "_getting_started_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_resources_list" ADD CONSTRAINT "_getting_started_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_getting_started_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_getting_started_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_blocks_contacts_list" ADD CONSTRAINT "_getting_started_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_version_steps" ADD CONSTRAINT "_getting_started_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_getting_started_v_version_resources" ADD CONSTRAINT "_getting_started_v_version_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "classes_blocks_hero_block_order_idx" ON "classes_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_hero_block_parent_id_idx" ON "classes_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_hero_block_path_idx" ON "classes_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "classes_blocks_section_title_order_idx" ON "classes_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_section_title_parent_id_idx" ON "classes_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_section_title_path_idx" ON "classes_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "classes_blocks_rich_text_block_order_idx" ON "classes_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_rich_text_block_parent_id_idx" ON "classes_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_rich_text_block_path_idx" ON "classes_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "classes_blocks_text_block_order_idx" ON "classes_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_text_block_parent_id_idx" ON "classes_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_text_block_path_idx" ON "classes_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "classes_blocks_video_block_order_idx" ON "classes_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_video_block_parent_id_idx" ON "classes_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_video_block_path_idx" ON "classes_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "classes_blocks_video_block_video_idx" ON "classes_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_list_block_items_order_idx" ON "classes_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_list_block_items_parent_id_idx" ON "classes_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_list_block_order_idx" ON "classes_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_list_block_parent_id_idx" ON "classes_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_list_block_path_idx" ON "classes_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "classes_blocks_steps_list_steps_order_idx" ON "classes_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_steps_list_steps_parent_id_idx" ON "classes_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_steps_list_order_idx" ON "classes_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_steps_list_parent_id_idx" ON "classes_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_steps_list_path_idx" ON "classes_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "classes_blocks_button_block_order_idx" ON "classes_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_button_block_parent_id_idx" ON "classes_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_button_block_path_idx" ON "classes_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "classes_blocks_resources_list_resources_order_idx" ON "classes_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_resources_list_resources_parent_id_idx" ON "classes_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_resources_list_order_idx" ON "classes_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_resources_list_parent_id_idx" ON "classes_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_resources_list_path_idx" ON "classes_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "classes_blocks_contacts_list_contacts_order_idx" ON "classes_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_contacts_list_contacts_parent_id_idx" ON "classes_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_contacts_list_contacts_photo_idx" ON "classes_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_contacts_list_order_idx" ON "classes_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "classes_blocks_contacts_list_parent_id_idx" ON "classes_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "classes_blocks_contacts_list_path_idx" ON "classes_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_hero_block_order_idx" ON "_classes_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_hero_block_parent_id_idx" ON "_classes_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_hero_block_path_idx" ON "_classes_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_section_title_order_idx" ON "_classes_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_section_title_parent_id_idx" ON "_classes_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_section_title_path_idx" ON "_classes_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_rich_text_block_order_idx" ON "_classes_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_rich_text_block_parent_id_idx" ON "_classes_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_rich_text_block_path_idx" ON "_classes_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_text_block_order_idx" ON "_classes_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_text_block_parent_id_idx" ON "_classes_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_text_block_path_idx" ON "_classes_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_video_block_order_idx" ON "_classes_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_video_block_parent_id_idx" ON "_classes_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_video_block_path_idx" ON "_classes_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_video_block_video_idx" ON "_classes_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_list_block_items_order_idx" ON "_classes_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_list_block_items_parent_id_idx" ON "_classes_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_list_block_order_idx" ON "_classes_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_list_block_parent_id_idx" ON "_classes_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_list_block_path_idx" ON "_classes_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_steps_list_steps_order_idx" ON "_classes_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_steps_list_steps_parent_id_idx" ON "_classes_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_steps_list_order_idx" ON "_classes_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_steps_list_parent_id_idx" ON "_classes_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_steps_list_path_idx" ON "_classes_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_button_block_order_idx" ON "_classes_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_button_block_parent_id_idx" ON "_classes_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_button_block_path_idx" ON "_classes_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_resources_list_resources_order_idx" ON "_classes_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_resources_list_resources_parent_id_idx" ON "_classes_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_resources_list_order_idx" ON "_classes_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_resources_list_parent_id_idx" ON "_classes_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_resources_list_path_idx" ON "_classes_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_contacts_list_contacts_order_idx" ON "_classes_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_contacts_list_contacts_parent_id_idx" ON "_classes_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_contacts_list_contacts_photo_idx" ON "_classes_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_contacts_list_order_idx" ON "_classes_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_contacts_list_parent_id_idx" ON "_classes_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_blocks_contacts_list_path_idx" ON "_classes_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_classes_v_parent_idx" ON "_classes_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_version_version_slug_idx" ON "_classes_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_classes_v_version_version_updated_at_idx" ON "_classes_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_classes_v_version_version_created_at_idx" ON "_classes_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_classes_v_version_version__status_idx" ON "_classes_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_classes_v_created_at_idx" ON "_classes_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_classes_v_updated_at_idx" ON "_classes_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_classes_v_latest_idx" ON "_classes_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_classes_v_rels_order_idx" ON "_classes_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_classes_v_rels_parent_idx" ON "_classes_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_classes_v_rels_path_idx" ON "_classes_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_classes_v_rels_chapters_id_idx" ON "_classes_v_rels" USING btree ("chapters_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_hero_block_order_idx" ON "chapters_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_hero_block_parent_id_idx" ON "chapters_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_hero_block_path_idx" ON "chapters_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_section_title_order_idx" ON "chapters_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_section_title_parent_id_idx" ON "chapters_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_section_title_path_idx" ON "chapters_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_rich_text_block_order_idx" ON "chapters_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_rich_text_block_parent_id_idx" ON "chapters_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_rich_text_block_path_idx" ON "chapters_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_text_block_order_idx" ON "chapters_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_text_block_parent_id_idx" ON "chapters_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_text_block_path_idx" ON "chapters_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_video_block_order_idx" ON "chapters_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_video_block_parent_id_idx" ON "chapters_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_video_block_path_idx" ON "chapters_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_video_block_video_idx" ON "chapters_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_list_block_items_order_idx" ON "chapters_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_list_block_items_parent_id_idx" ON "chapters_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_list_block_order_idx" ON "chapters_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_list_block_parent_id_idx" ON "chapters_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_list_block_path_idx" ON "chapters_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_steps_list_steps_order_idx" ON "chapters_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_steps_list_steps_parent_id_idx" ON "chapters_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_steps_list_order_idx" ON "chapters_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_steps_list_parent_id_idx" ON "chapters_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_steps_list_path_idx" ON "chapters_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_button_block_order_idx" ON "chapters_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_button_block_parent_id_idx" ON "chapters_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_button_block_path_idx" ON "chapters_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_resources_list_resources_order_idx" ON "chapters_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_resources_list_resources_parent_id_idx" ON "chapters_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_resources_list_order_idx" ON "chapters_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_resources_list_parent_id_idx" ON "chapters_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_resources_list_path_idx" ON "chapters_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_contacts_list_contacts_order_idx" ON "chapters_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_contacts_list_contacts_parent_id_idx" ON "chapters_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_contacts_list_contacts_photo_idx" ON "chapters_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_contacts_list_order_idx" ON "chapters_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_contacts_list_parent_id_idx" ON "chapters_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "chapters_blocks_contacts_list_path_idx" ON "chapters_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_hero_block_order_idx" ON "_chapters_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_hero_block_parent_id_idx" ON "_chapters_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_hero_block_path_idx" ON "_chapters_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_section_title_order_idx" ON "_chapters_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_section_title_parent_id_idx" ON "_chapters_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_section_title_path_idx" ON "_chapters_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_rich_text_block_order_idx" ON "_chapters_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_rich_text_block_parent_id_idx" ON "_chapters_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_rich_text_block_path_idx" ON "_chapters_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_text_block_order_idx" ON "_chapters_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_text_block_parent_id_idx" ON "_chapters_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_text_block_path_idx" ON "_chapters_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_video_block_order_idx" ON "_chapters_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_video_block_parent_id_idx" ON "_chapters_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_video_block_path_idx" ON "_chapters_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_video_block_video_idx" ON "_chapters_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_list_block_items_order_idx" ON "_chapters_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_list_block_items_parent_id_idx" ON "_chapters_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_list_block_order_idx" ON "_chapters_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_list_block_parent_id_idx" ON "_chapters_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_list_block_path_idx" ON "_chapters_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_steps_list_steps_order_idx" ON "_chapters_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_steps_list_steps_parent_id_idx" ON "_chapters_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_steps_list_order_idx" ON "_chapters_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_steps_list_parent_id_idx" ON "_chapters_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_steps_list_path_idx" ON "_chapters_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_button_block_order_idx" ON "_chapters_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_button_block_parent_id_idx" ON "_chapters_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_button_block_path_idx" ON "_chapters_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_resources_list_resources_order_idx" ON "_chapters_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_resources_list_resources_parent_id_idx" ON "_chapters_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_resources_list_order_idx" ON "_chapters_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_resources_list_parent_id_idx" ON "_chapters_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_resources_list_path_idx" ON "_chapters_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_contacts_list_contacts_order_idx" ON "_chapters_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_contacts_list_contacts_parent_id_idx" ON "_chapters_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_contacts_list_contacts_photo_idx" ON "_chapters_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_contacts_list_order_idx" ON "_chapters_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_contacts_list_parent_id_idx" ON "_chapters_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_blocks_contacts_list_path_idx" ON "_chapters_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_parent_idx" ON "_chapters_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_version_version_class_idx" ON "_chapters_v" USING btree ("version_class_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_version_version_slug_idx" ON "_chapters_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_chapters_v_version_version_updated_at_idx" ON "_chapters_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_chapters_v_version_version_created_at_idx" ON "_chapters_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_chapters_v_version_version__status_idx" ON "_chapters_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_chapters_v_created_at_idx" ON "_chapters_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_chapters_v_updated_at_idx" ON "_chapters_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_chapters_v_latest_idx" ON "_chapters_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_chapters_v_rels_order_idx" ON "_chapters_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_chapters_v_rels_parent_idx" ON "_chapters_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_chapters_v_rels_path_idx" ON "_chapters_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_chapters_v_rels_lessons_id_idx" ON "_chapters_v_rels" USING btree ("lessons_id");
  CREATE INDEX IF NOT EXISTS "lessons_problem_sets_questions_order_idx" ON "lessons_problem_sets_questions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "lessons_problem_sets_questions_parent_id_idx" ON "lessons_problem_sets_questions" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "lessons_problem_sets_order_idx" ON "lessons_problem_sets" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "lessons_problem_sets_parent_id_idx" ON "lessons_problem_sets" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_lessons_v_version_problem_sets_questions_order_idx" ON "_lessons_v_version_problem_sets_questions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_lessons_v_version_problem_sets_questions_parent_id_idx" ON "_lessons_v_version_problem_sets_questions" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_lessons_v_version_problem_sets_order_idx" ON "_lessons_v_version_problem_sets" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_lessons_v_version_problem_sets_parent_id_idx" ON "_lessons_v_version_problem_sets" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_hero_block_order_idx" ON "home_page_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_hero_block_parent_id_idx" ON "home_page_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_hero_block_path_idx" ON "home_page_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_section_title_order_idx" ON "home_page_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_section_title_parent_id_idx" ON "home_page_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_section_title_path_idx" ON "home_page_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_rich_text_block_order_idx" ON "home_page_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_rich_text_block_parent_id_idx" ON "home_page_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_rich_text_block_path_idx" ON "home_page_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_text_block_order_idx" ON "home_page_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_text_block_parent_id_idx" ON "home_page_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_text_block_path_idx" ON "home_page_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_video_block_order_idx" ON "home_page_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_video_block_parent_id_idx" ON "home_page_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_video_block_path_idx" ON "home_page_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_video_block_video_idx" ON "home_page_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_list_block_items_order_idx" ON "home_page_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_list_block_items_parent_id_idx" ON "home_page_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_list_block_order_idx" ON "home_page_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_list_block_parent_id_idx" ON "home_page_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_list_block_path_idx" ON "home_page_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_steps_list_steps_order_idx" ON "home_page_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_steps_list_steps_parent_id_idx" ON "home_page_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_steps_list_order_idx" ON "home_page_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_steps_list_parent_id_idx" ON "home_page_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_steps_list_path_idx" ON "home_page_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_button_block_order_idx" ON "home_page_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_button_block_parent_id_idx" ON "home_page_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_button_block_path_idx" ON "home_page_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_resources_list_resources_order_idx" ON "home_page_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_resources_list_resources_parent_id_idx" ON "home_page_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_resources_list_order_idx" ON "home_page_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_resources_list_parent_id_idx" ON "home_page_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_resources_list_path_idx" ON "home_page_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_contacts_list_contacts_order_idx" ON "home_page_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_contacts_list_contacts_parent_id_idx" ON "home_page_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_contacts_list_contacts_photo_idx" ON "home_page_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_contacts_list_order_idx" ON "home_page_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_contacts_list_parent_id_idx" ON "home_page_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_contacts_list_path_idx" ON "home_page_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_goals_order_idx" ON "home_page_goals" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_goals_parent_id_idx" ON "home_page_goals" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_getting_started_steps_order_idx" ON "home_page_getting_started_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_getting_started_steps_parent_id_idx" ON "home_page_getting_started_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page__status_idx" ON "home_page" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_hero_block_order_idx" ON "_home_page_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_hero_block_parent_id_idx" ON "_home_page_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_hero_block_path_idx" ON "_home_page_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_section_title_order_idx" ON "_home_page_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_section_title_parent_id_idx" ON "_home_page_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_section_title_path_idx" ON "_home_page_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_rich_text_block_order_idx" ON "_home_page_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_rich_text_block_parent_id_idx" ON "_home_page_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_rich_text_block_path_idx" ON "_home_page_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_text_block_order_idx" ON "_home_page_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_text_block_parent_id_idx" ON "_home_page_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_text_block_path_idx" ON "_home_page_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_video_block_order_idx" ON "_home_page_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_video_block_parent_id_idx" ON "_home_page_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_video_block_path_idx" ON "_home_page_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_video_block_video_idx" ON "_home_page_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_list_block_items_order_idx" ON "_home_page_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_list_block_items_parent_id_idx" ON "_home_page_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_list_block_order_idx" ON "_home_page_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_list_block_parent_id_idx" ON "_home_page_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_list_block_path_idx" ON "_home_page_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_steps_list_steps_order_idx" ON "_home_page_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_steps_list_steps_parent_id_idx" ON "_home_page_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_steps_list_order_idx" ON "_home_page_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_steps_list_parent_id_idx" ON "_home_page_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_steps_list_path_idx" ON "_home_page_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_button_block_order_idx" ON "_home_page_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_button_block_parent_id_idx" ON "_home_page_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_button_block_path_idx" ON "_home_page_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_resources_list_resources_order_idx" ON "_home_page_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_resources_list_resources_parent_id_idx" ON "_home_page_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_resources_list_order_idx" ON "_home_page_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_resources_list_parent_id_idx" ON "_home_page_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_resources_list_path_idx" ON "_home_page_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_contacts_list_contacts_order_idx" ON "_home_page_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_contacts_list_contacts_parent_id_idx" ON "_home_page_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_contacts_list_contacts_photo_idx" ON "_home_page_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_contacts_list_order_idx" ON "_home_page_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_contacts_list_parent_id_idx" ON "_home_page_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_blocks_contacts_list_path_idx" ON "_home_page_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_home_page_v_version_goals_order_idx" ON "_home_page_v_version_goals" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_version_goals_parent_id_idx" ON "_home_page_v_version_goals" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_version_getting_started_steps_order_idx" ON "_home_page_v_version_getting_started_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_home_page_v_version_getting_started_steps_parent_id_idx" ON "_home_page_v_version_getting_started_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_home_page_v_version_version__status_idx" ON "_home_page_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_home_page_v_created_at_idx" ON "_home_page_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_home_page_v_updated_at_idx" ON "_home_page_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_home_page_v_latest_idx" ON "_home_page_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_hero_block_order_idx" ON "resources_page_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_hero_block_parent_id_idx" ON "resources_page_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_hero_block_path_idx" ON "resources_page_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_section_title_order_idx" ON "resources_page_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_section_title_parent_id_idx" ON "resources_page_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_section_title_path_idx" ON "resources_page_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_rich_text_block_order_idx" ON "resources_page_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_rich_text_block_parent_id_idx" ON "resources_page_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_rich_text_block_path_idx" ON "resources_page_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_text_block_order_idx" ON "resources_page_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_text_block_parent_id_idx" ON "resources_page_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_text_block_path_idx" ON "resources_page_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_video_block_order_idx" ON "resources_page_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_video_block_parent_id_idx" ON "resources_page_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_video_block_path_idx" ON "resources_page_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_video_block_video_idx" ON "resources_page_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_list_block_items_order_idx" ON "resources_page_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_list_block_items_parent_id_idx" ON "resources_page_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_list_block_order_idx" ON "resources_page_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_list_block_parent_id_idx" ON "resources_page_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_list_block_path_idx" ON "resources_page_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_steps_list_steps_order_idx" ON "resources_page_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_steps_list_steps_parent_id_idx" ON "resources_page_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_steps_list_order_idx" ON "resources_page_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_steps_list_parent_id_idx" ON "resources_page_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_steps_list_path_idx" ON "resources_page_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_button_block_order_idx" ON "resources_page_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_button_block_parent_id_idx" ON "resources_page_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_button_block_path_idx" ON "resources_page_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_resources_list_resources_order_idx" ON "resources_page_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_resources_list_resources_parent_id_idx" ON "resources_page_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_resources_list_order_idx" ON "resources_page_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_resources_list_parent_id_idx" ON "resources_page_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_resources_list_path_idx" ON "resources_page_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_contacts_list_contacts_order_idx" ON "resources_page_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_contacts_list_contacts_parent_id_idx" ON "resources_page_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_contacts_list_contacts_photo_idx" ON "resources_page_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_contacts_list_order_idx" ON "resources_page_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_contacts_list_parent_id_idx" ON "resources_page_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_blocks_contacts_list_path_idx" ON "resources_page_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "resources_page_sections_resources_order_idx" ON "resources_page_sections_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_sections_resources_parent_id_idx" ON "resources_page_sections_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page_sections_order_idx" ON "resources_page_sections" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resources_page_sections_parent_id_idx" ON "resources_page_sections" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resources_page__status_idx" ON "resources_page" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_hero_block_order_idx" ON "_resources_page_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_hero_block_parent_id_idx" ON "_resources_page_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_hero_block_path_idx" ON "_resources_page_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_section_title_order_idx" ON "_resources_page_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_section_title_parent_id_idx" ON "_resources_page_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_section_title_path_idx" ON "_resources_page_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_rich_text_block_order_idx" ON "_resources_page_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_rich_text_block_parent_id_idx" ON "_resources_page_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_rich_text_block_path_idx" ON "_resources_page_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_text_block_order_idx" ON "_resources_page_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_text_block_parent_id_idx" ON "_resources_page_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_text_block_path_idx" ON "_resources_page_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_video_block_order_idx" ON "_resources_page_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_video_block_parent_id_idx" ON "_resources_page_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_video_block_path_idx" ON "_resources_page_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_video_block_video_idx" ON "_resources_page_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_list_block_items_order_idx" ON "_resources_page_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_list_block_items_parent_id_idx" ON "_resources_page_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_list_block_order_idx" ON "_resources_page_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_list_block_parent_id_idx" ON "_resources_page_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_list_block_path_idx" ON "_resources_page_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_steps_list_steps_order_idx" ON "_resources_page_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_steps_list_steps_parent_id_idx" ON "_resources_page_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_steps_list_order_idx" ON "_resources_page_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_steps_list_parent_id_idx" ON "_resources_page_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_steps_list_path_idx" ON "_resources_page_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_button_block_order_idx" ON "_resources_page_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_button_block_parent_id_idx" ON "_resources_page_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_button_block_path_idx" ON "_resources_page_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_resources_list_resources_order_idx" ON "_resources_page_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_resources_list_resources_parent_id_idx" ON "_resources_page_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_resources_list_order_idx" ON "_resources_page_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_resources_list_parent_id_idx" ON "_resources_page_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_resources_list_path_idx" ON "_resources_page_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_contacts_list_contacts_order_idx" ON "_resources_page_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_contacts_list_contacts_parent_id_idx" ON "_resources_page_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_contacts_list_contacts_photo_idx" ON "_resources_page_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_contacts_list_order_idx" ON "_resources_page_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_contacts_list_parent_id_idx" ON "_resources_page_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_blocks_contacts_list_path_idx" ON "_resources_page_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_version_sections_resources_order_idx" ON "_resources_page_v_version_sections_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_version_sections_resources_parent_id_idx" ON "_resources_page_v_version_sections_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_version_sections_order_idx" ON "_resources_page_v_version_sections" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_version_sections_parent_id_idx" ON "_resources_page_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_version_version__status_idx" ON "_resources_page_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_created_at_idx" ON "_resources_page_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_updated_at_idx" ON "_resources_page_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_resources_page_v_latest_idx" ON "_resources_page_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_hero_block_order_idx" ON "contact_page_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_hero_block_parent_id_idx" ON "contact_page_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_hero_block_path_idx" ON "contact_page_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_section_title_order_idx" ON "contact_page_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_section_title_parent_id_idx" ON "contact_page_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_section_title_path_idx" ON "contact_page_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_rich_text_block_order_idx" ON "contact_page_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_rich_text_block_parent_id_idx" ON "contact_page_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_rich_text_block_path_idx" ON "contact_page_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_text_block_order_idx" ON "contact_page_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_text_block_parent_id_idx" ON "contact_page_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_text_block_path_idx" ON "contact_page_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_video_block_order_idx" ON "contact_page_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_video_block_parent_id_idx" ON "contact_page_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_video_block_path_idx" ON "contact_page_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_video_block_video_idx" ON "contact_page_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_list_block_items_order_idx" ON "contact_page_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_list_block_items_parent_id_idx" ON "contact_page_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_list_block_order_idx" ON "contact_page_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_list_block_parent_id_idx" ON "contact_page_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_list_block_path_idx" ON "contact_page_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_steps_list_steps_order_idx" ON "contact_page_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_steps_list_steps_parent_id_idx" ON "contact_page_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_steps_list_order_idx" ON "contact_page_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_steps_list_parent_id_idx" ON "contact_page_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_steps_list_path_idx" ON "contact_page_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_button_block_order_idx" ON "contact_page_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_button_block_parent_id_idx" ON "contact_page_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_button_block_path_idx" ON "contact_page_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_resources_list_resources_order_idx" ON "contact_page_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_resources_list_resources_parent_id_idx" ON "contact_page_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_resources_list_order_idx" ON "contact_page_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_resources_list_parent_id_idx" ON "contact_page_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_resources_list_path_idx" ON "contact_page_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_contacts_list_contacts_order_idx" ON "contact_page_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_contacts_list_contacts_parent_id_idx" ON "contact_page_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_contacts_list_contacts_photo_idx" ON "contact_page_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_contacts_list_order_idx" ON "contact_page_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_contacts_list_parent_id_idx" ON "contact_page_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_blocks_contacts_list_path_idx" ON "contact_page_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "contact_page_contacts_order_idx" ON "contact_page_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_page_contacts_parent_id_idx" ON "contact_page_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_page_contacts_photo_idx" ON "contact_page_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "contact_page__status_idx" ON "contact_page" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_hero_block_order_idx" ON "_contact_page_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_hero_block_parent_id_idx" ON "_contact_page_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_hero_block_path_idx" ON "_contact_page_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_section_title_order_idx" ON "_contact_page_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_section_title_parent_id_idx" ON "_contact_page_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_section_title_path_idx" ON "_contact_page_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_rich_text_block_order_idx" ON "_contact_page_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_rich_text_block_parent_id_idx" ON "_contact_page_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_rich_text_block_path_idx" ON "_contact_page_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_text_block_order_idx" ON "_contact_page_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_text_block_parent_id_idx" ON "_contact_page_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_text_block_path_idx" ON "_contact_page_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_video_block_order_idx" ON "_contact_page_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_video_block_parent_id_idx" ON "_contact_page_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_video_block_path_idx" ON "_contact_page_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_video_block_video_idx" ON "_contact_page_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_list_block_items_order_idx" ON "_contact_page_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_list_block_items_parent_id_idx" ON "_contact_page_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_list_block_order_idx" ON "_contact_page_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_list_block_parent_id_idx" ON "_contact_page_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_list_block_path_idx" ON "_contact_page_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_steps_list_steps_order_idx" ON "_contact_page_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_steps_list_steps_parent_id_idx" ON "_contact_page_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_steps_list_order_idx" ON "_contact_page_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_steps_list_parent_id_idx" ON "_contact_page_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_steps_list_path_idx" ON "_contact_page_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_button_block_order_idx" ON "_contact_page_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_button_block_parent_id_idx" ON "_contact_page_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_button_block_path_idx" ON "_contact_page_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_resources_list_resources_order_idx" ON "_contact_page_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_resources_list_resources_parent_id_idx" ON "_contact_page_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_resources_list_order_idx" ON "_contact_page_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_resources_list_parent_id_idx" ON "_contact_page_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_resources_list_path_idx" ON "_contact_page_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_contacts_list_contacts_order_idx" ON "_contact_page_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_contacts_list_contacts_parent_id_idx" ON "_contact_page_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_contacts_list_contacts_photo_idx" ON "_contact_page_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_contacts_list_order_idx" ON "_contact_page_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_contacts_list_parent_id_idx" ON "_contact_page_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_blocks_contacts_list_path_idx" ON "_contact_page_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_version_contacts_order_idx" ON "_contact_page_v_version_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_version_contacts_parent_id_idx" ON "_contact_page_v_version_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_version_contacts_photo_idx" ON "_contact_page_v_version_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_version_version__status_idx" ON "_contact_page_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_created_at_idx" ON "_contact_page_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_updated_at_idx" ON "_contact_page_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_contact_page_v_latest_idx" ON "_contact_page_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_hero_block_order_idx" ON "getting_started_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_hero_block_parent_id_idx" ON "getting_started_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_hero_block_path_idx" ON "getting_started_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_section_title_order_idx" ON "getting_started_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_section_title_parent_id_idx" ON "getting_started_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_section_title_path_idx" ON "getting_started_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_rich_text_block_order_idx" ON "getting_started_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_rich_text_block_parent_id_idx" ON "getting_started_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_rich_text_block_path_idx" ON "getting_started_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_text_block_order_idx" ON "getting_started_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_text_block_parent_id_idx" ON "getting_started_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_text_block_path_idx" ON "getting_started_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_video_block_order_idx" ON "getting_started_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_video_block_parent_id_idx" ON "getting_started_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_video_block_path_idx" ON "getting_started_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_video_block_video_idx" ON "getting_started_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_list_block_items_order_idx" ON "getting_started_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_list_block_items_parent_id_idx" ON "getting_started_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_list_block_order_idx" ON "getting_started_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_list_block_parent_id_idx" ON "getting_started_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_list_block_path_idx" ON "getting_started_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_steps_list_steps_order_idx" ON "getting_started_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_steps_list_steps_parent_id_idx" ON "getting_started_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_steps_list_order_idx" ON "getting_started_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_steps_list_parent_id_idx" ON "getting_started_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_steps_list_path_idx" ON "getting_started_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_button_block_order_idx" ON "getting_started_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_button_block_parent_id_idx" ON "getting_started_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_button_block_path_idx" ON "getting_started_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_resources_list_resources_order_idx" ON "getting_started_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_resources_list_resources_parent_id_idx" ON "getting_started_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_resources_list_order_idx" ON "getting_started_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_resources_list_parent_id_idx" ON "getting_started_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_resources_list_path_idx" ON "getting_started_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_contacts_list_contacts_order_idx" ON "getting_started_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_contacts_list_contacts_parent_id_idx" ON "getting_started_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_contacts_list_contacts_photo_idx" ON "getting_started_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_contacts_list_order_idx" ON "getting_started_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_contacts_list_parent_id_idx" ON "getting_started_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_blocks_contacts_list_path_idx" ON "getting_started_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "getting_started_steps_order_idx" ON "getting_started_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_steps_parent_id_idx" ON "getting_started_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started_resources_order_idx" ON "getting_started_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_started_resources_parent_id_idx" ON "getting_started_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_started__status_idx" ON "getting_started" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_hero_block_order_idx" ON "_getting_started_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_hero_block_parent_id_idx" ON "_getting_started_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_hero_block_path_idx" ON "_getting_started_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_section_title_order_idx" ON "_getting_started_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_section_title_parent_id_idx" ON "_getting_started_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_section_title_path_idx" ON "_getting_started_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_rich_text_block_order_idx" ON "_getting_started_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_rich_text_block_parent_id_idx" ON "_getting_started_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_rich_text_block_path_idx" ON "_getting_started_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_text_block_order_idx" ON "_getting_started_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_text_block_parent_id_idx" ON "_getting_started_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_text_block_path_idx" ON "_getting_started_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_video_block_order_idx" ON "_getting_started_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_video_block_parent_id_idx" ON "_getting_started_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_video_block_path_idx" ON "_getting_started_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_video_block_video_idx" ON "_getting_started_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_list_block_items_order_idx" ON "_getting_started_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_list_block_items_parent_id_idx" ON "_getting_started_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_list_block_order_idx" ON "_getting_started_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_list_block_parent_id_idx" ON "_getting_started_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_list_block_path_idx" ON "_getting_started_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_steps_list_steps_order_idx" ON "_getting_started_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_steps_list_steps_parent_id_idx" ON "_getting_started_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_steps_list_order_idx" ON "_getting_started_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_steps_list_parent_id_idx" ON "_getting_started_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_steps_list_path_idx" ON "_getting_started_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_button_block_order_idx" ON "_getting_started_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_button_block_parent_id_idx" ON "_getting_started_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_button_block_path_idx" ON "_getting_started_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_resources_list_resources_order_idx" ON "_getting_started_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_resources_list_resources_parent_id_idx" ON "_getting_started_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_resources_list_order_idx" ON "_getting_started_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_resources_list_parent_id_idx" ON "_getting_started_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_resources_list_path_idx" ON "_getting_started_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_contacts_list_contacts_order_idx" ON "_getting_started_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_contacts_list_contacts_parent_id_idx" ON "_getting_started_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_contacts_list_contacts_photo_idx" ON "_getting_started_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_contacts_list_order_idx" ON "_getting_started_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_contacts_list_parent_id_idx" ON "_getting_started_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_blocks_contacts_list_path_idx" ON "_getting_started_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_version_steps_order_idx" ON "_getting_started_v_version_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_version_steps_parent_id_idx" ON "_getting_started_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_version_resources_order_idx" ON "_getting_started_v_version_resources" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_version_resources_parent_id_idx" ON "_getting_started_v_version_resources" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_version_version__status_idx" ON "_getting_started_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_created_at_idx" ON "_getting_started_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_updated_at_idx" ON "_getting_started_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_getting_started_v_latest_idx" ON "_getting_started_v" USING btree ("latest");
  DO $$ BEGIN
    ALTER TABLE "lessons" ADD CONSTRAINT "lessons_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_version_video_id_media_id_fk" FOREIGN KEY ("version_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "classes__status_idx" ON "classes" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "chapters__status_idx" ON "chapters" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "lessons_slug_idx" ON "lessons" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "lessons_video_idx" ON "lessons" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "_lessons_v_version_version_slug_idx" ON "_lessons_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_lessons_v_version_version_video_idx" ON "_lessons_v" USING btree ("version_video_id");
  ALTER TABLE "lessons" DROP COLUMN "chapter_id";
  ALTER TABLE "_lessons_v" DROP COLUMN "version_chapter_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounts_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "accounts_id";
  DROP TYPE IF EXISTS "public"."enum_lessons_blocks_resources_list_resources_type";
  DROP TYPE IF EXISTS "public"."enum__lessons_v_blocks_resources_list_resources_type";
  DROP TYPE IF EXISTS "public"."enum_pages_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum_pages_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum_pages_blocks_resources_list_resources_type";
  DROP TYPE IF EXISTS "public"."enum_pages_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum_pages_status";
  DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_section_title_size";
  DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_list_block_list_style";
  DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_resources_list_resources_type";
  DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_contacts_list_contacts_category";
  DROP TYPE IF EXISTS "public"."enum__pages_v_version_status";
  DROP TYPE IF EXISTS "public"."enum_accounts_role";`)
}
