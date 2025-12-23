import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_classes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__classes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_chapters_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__chapters_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_lessons_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lessons_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'staff');
  CREATE TYPE "public"."enum_home_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_resources_page_sections_resources_type" AS ENUM('link', 'video', 'download', 'other');
  CREATE TYPE "public"."enum_resources_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resources_page_v_version_sections_resources_type" AS ENUM('link', 'video', 'download', 'other');
  CREATE TYPE "public"."enum__resources_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_contact_page_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_contact_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_page_v_version_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__contact_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "classes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_classes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "classes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"chapters_id" integer
  );
  
  CREATE TABLE "_classes_v" (
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
  
  CREATE TABLE "_classes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"chapters_id" integer
  );
  
  CREATE TABLE "chapters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"class_id" integer,
  	"slug" varchar,
  	"objective" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_chapters_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "chapters_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lessons_id" integer
  );
  
  CREATE TABLE "_chapters_v" (
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
  
  CREATE TABLE "_chapters_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lessons_id" integer
  );
  
  CREATE TABLE "lessons_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_problem_sets_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_text" jsonb,
  	"answer" varchar
  );
  
  CREATE TABLE "lessons_problem_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "lessons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"video_id" integer,
  	"text_content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_lessons_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_lessons_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_video_block" (
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
  
  CREATE TABLE "_lessons_v_version_problem_sets_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question_text" jsonb,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lessons_v_version_problem_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lessons_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_video_id" integer,
  	"version_text_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__lessons_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'staff' NOT NULL,
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
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"classes_id" integer,
  	"chapters_id" integer,
  	"lessons_id" integer,
  	"users_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "home_page_getting_started_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar
  );
  
  CREATE TABLE "home_page" (
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
  
  CREATE TABLE "_home_page_v_version_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_getting_started_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v" (
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
  
  CREATE TABLE "resources_page_sections_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" "enum_resources_page_sections_resources_type" DEFAULT 'link'
  );
  
  CREATE TABLE "resources_page_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "resources_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'Additional Resources',
  	"hero_intro" varchar,
  	"_status" "enum_resources_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_resources_page_v_version_sections_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" "enum__resources_page_v_version_sections_resources_type" DEFAULT 'link',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_resources_page_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_resources_page_v" (
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
  
  CREATE TABLE "contact_page_contacts" (
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
  
  CREATE TABLE "contact_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'Contact Us',
  	"hero_intro" varchar,
  	"_status" "enum_contact_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_contact_page_v_version_contacts" (
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
  
  CREATE TABLE "_contact_page_v" (
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
  
  CREATE TABLE "getting_started_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"description" jsonb
  );
  
  CREATE TABLE "getting_started_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "getting_started" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Getting Started' NOT NULL,
  	"intro" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "classes_rels" ADD CONSTRAINT "classes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_rels" ADD CONSTRAINT "classes_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v" ADD CONSTRAINT "_classes_v_parent_id_classes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_classes_v_rels" ADD CONSTRAINT "_classes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_rels" ADD CONSTRAINT "_classes_v_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters_rels" ADD CONSTRAINT "chapters_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_rels" ADD CONSTRAINT "chapters_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_parent_id_chapters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_version_class_id_classes_id_fk" FOREIGN KEY ("version_class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v_rels" ADD CONSTRAINT "_chapters_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_rels" ADD CONSTRAINT "_chapters_v_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_rich_text_block" ADD CONSTRAINT "lessons_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_video_block" ADD CONSTRAINT "lessons_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_blocks_video_block" ADD CONSTRAINT "lessons_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_problem_sets_questions" ADD CONSTRAINT "lessons_problem_sets_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_problem_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_problem_sets" ADD CONSTRAINT "lessons_problem_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_rich_text_block" ADD CONSTRAINT "_lessons_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_video_block" ADD CONSTRAINT "_lessons_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_video_block" ADD CONSTRAINT "_lessons_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_version_problem_sets_questions" ADD CONSTRAINT "_lessons_v_version_problem_sets_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v_version_problem_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_version_problem_sets" ADD CONSTRAINT "_lessons_v_version_problem_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_parent_id_lessons_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_version_video_id_media_id_fk" FOREIGN KEY ("version_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_classes_fk" FOREIGN KEY ("classes_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_goals" ADD CONSTRAINT "home_page_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_getting_started_steps" ADD CONSTRAINT "home_page_getting_started_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_goals" ADD CONSTRAINT "_home_page_v_version_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_getting_started_steps" ADD CONSTRAINT "_home_page_v_version_getting_started_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_sections_resources" ADD CONSTRAINT "resources_page_sections_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_sections" ADD CONSTRAINT "resources_page_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_version_sections_resources" ADD CONSTRAINT "_resources_page_v_version_sections_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_version_sections" ADD CONSTRAINT "_resources_page_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_contacts" ADD CONSTRAINT "contact_page_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_page_contacts" ADD CONSTRAINT "contact_page_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_version_contacts" ADD CONSTRAINT "_contact_page_v_version_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_page_v_version_contacts" ADD CONSTRAINT "_contact_page_v_version_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_steps" ADD CONSTRAINT "getting_started_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_resources" ADD CONSTRAINT "getting_started_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "classes_slug_idx" ON "classes" USING btree ("slug");
  CREATE INDEX "classes_updated_at_idx" ON "classes" USING btree ("updated_at");
  CREATE INDEX "classes_created_at_idx" ON "classes" USING btree ("created_at");
  CREATE INDEX "classes__status_idx" ON "classes" USING btree ("_status");
  CREATE INDEX "classes_rels_order_idx" ON "classes_rels" USING btree ("order");
  CREATE INDEX "classes_rels_parent_idx" ON "classes_rels" USING btree ("parent_id");
  CREATE INDEX "classes_rels_path_idx" ON "classes_rels" USING btree ("path");
  CREATE INDEX "classes_rels_chapters_id_idx" ON "classes_rels" USING btree ("chapters_id");
  CREATE INDEX "_classes_v_parent_idx" ON "_classes_v" USING btree ("parent_id");
  CREATE INDEX "_classes_v_version_version_slug_idx" ON "_classes_v" USING btree ("version_slug");
  CREATE INDEX "_classes_v_version_version_updated_at_idx" ON "_classes_v" USING btree ("version_updated_at");
  CREATE INDEX "_classes_v_version_version_created_at_idx" ON "_classes_v" USING btree ("version_created_at");
  CREATE INDEX "_classes_v_version_version__status_idx" ON "_classes_v" USING btree ("version__status");
  CREATE INDEX "_classes_v_created_at_idx" ON "_classes_v" USING btree ("created_at");
  CREATE INDEX "_classes_v_updated_at_idx" ON "_classes_v" USING btree ("updated_at");
  CREATE INDEX "_classes_v_latest_idx" ON "_classes_v" USING btree ("latest");
  CREATE INDEX "_classes_v_rels_order_idx" ON "_classes_v_rels" USING btree ("order");
  CREATE INDEX "_classes_v_rels_parent_idx" ON "_classes_v_rels" USING btree ("parent_id");
  CREATE INDEX "_classes_v_rels_path_idx" ON "_classes_v_rels" USING btree ("path");
  CREATE INDEX "_classes_v_rels_chapters_id_idx" ON "_classes_v_rels" USING btree ("chapters_id");
  CREATE INDEX "chapters_class_idx" ON "chapters" USING btree ("class_id");
  CREATE UNIQUE INDEX "chapters_slug_idx" ON "chapters" USING btree ("slug");
  CREATE INDEX "chapters_updated_at_idx" ON "chapters" USING btree ("updated_at");
  CREATE INDEX "chapters_created_at_idx" ON "chapters" USING btree ("created_at");
  CREATE INDEX "chapters__status_idx" ON "chapters" USING btree ("_status");
  CREATE INDEX "chapters_rels_order_idx" ON "chapters_rels" USING btree ("order");
  CREATE INDEX "chapters_rels_parent_idx" ON "chapters_rels" USING btree ("parent_id");
  CREATE INDEX "chapters_rels_path_idx" ON "chapters_rels" USING btree ("path");
  CREATE INDEX "chapters_rels_lessons_id_idx" ON "chapters_rels" USING btree ("lessons_id");
  CREATE INDEX "_chapters_v_parent_idx" ON "_chapters_v" USING btree ("parent_id");
  CREATE INDEX "_chapters_v_version_version_class_idx" ON "_chapters_v" USING btree ("version_class_id");
  CREATE INDEX "_chapters_v_version_version_slug_idx" ON "_chapters_v" USING btree ("version_slug");
  CREATE INDEX "_chapters_v_version_version_updated_at_idx" ON "_chapters_v" USING btree ("version_updated_at");
  CREATE INDEX "_chapters_v_version_version_created_at_idx" ON "_chapters_v" USING btree ("version_created_at");
  CREATE INDEX "_chapters_v_version_version__status_idx" ON "_chapters_v" USING btree ("version__status");
  CREATE INDEX "_chapters_v_created_at_idx" ON "_chapters_v" USING btree ("created_at");
  CREATE INDEX "_chapters_v_updated_at_idx" ON "_chapters_v" USING btree ("updated_at");
  CREATE INDEX "_chapters_v_latest_idx" ON "_chapters_v" USING btree ("latest");
  CREATE INDEX "_chapters_v_rels_order_idx" ON "_chapters_v_rels" USING btree ("order");
  CREATE INDEX "_chapters_v_rels_parent_idx" ON "_chapters_v_rels" USING btree ("parent_id");
  CREATE INDEX "_chapters_v_rels_path_idx" ON "_chapters_v_rels" USING btree ("path");
  CREATE INDEX "_chapters_v_rels_lessons_id_idx" ON "_chapters_v_rels" USING btree ("lessons_id");
  CREATE INDEX "lessons_blocks_rich_text_block_order_idx" ON "lessons_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_rich_text_block_parent_id_idx" ON "lessons_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_rich_text_block_path_idx" ON "lessons_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_video_block_order_idx" ON "lessons_blocks_video_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_video_block_parent_id_idx" ON "lessons_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_video_block_path_idx" ON "lessons_blocks_video_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_video_block_video_idx" ON "lessons_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "lessons_problem_sets_questions_order_idx" ON "lessons_problem_sets_questions" USING btree ("_order");
  CREATE INDEX "lessons_problem_sets_questions_parent_id_idx" ON "lessons_problem_sets_questions" USING btree ("_parent_id");
  CREATE INDEX "lessons_problem_sets_order_idx" ON "lessons_problem_sets" USING btree ("_order");
  CREATE INDEX "lessons_problem_sets_parent_id_idx" ON "lessons_problem_sets" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "lessons_slug_idx" ON "lessons" USING btree ("slug");
  CREATE INDEX "lessons_video_idx" ON "lessons" USING btree ("video_id");
  CREATE INDEX "lessons_updated_at_idx" ON "lessons" USING btree ("updated_at");
  CREATE INDEX "lessons_created_at_idx" ON "lessons" USING btree ("created_at");
  CREATE INDEX "lessons__status_idx" ON "lessons" USING btree ("_status");
  CREATE INDEX "_lessons_v_blocks_rich_text_block_order_idx" ON "_lessons_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_rich_text_block_parent_id_idx" ON "_lessons_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_rich_text_block_path_idx" ON "_lessons_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_video_block_order_idx" ON "_lessons_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_video_block_parent_id_idx" ON "_lessons_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_video_block_path_idx" ON "_lessons_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_video_block_video_idx" ON "_lessons_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "_lessons_v_version_problem_sets_questions_order_idx" ON "_lessons_v_version_problem_sets_questions" USING btree ("_order");
  CREATE INDEX "_lessons_v_version_problem_sets_questions_parent_id_idx" ON "_lessons_v_version_problem_sets_questions" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_version_problem_sets_order_idx" ON "_lessons_v_version_problem_sets" USING btree ("_order");
  CREATE INDEX "_lessons_v_version_problem_sets_parent_id_idx" ON "_lessons_v_version_problem_sets" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_parent_idx" ON "_lessons_v" USING btree ("parent_id");
  CREATE INDEX "_lessons_v_version_version_slug_idx" ON "_lessons_v" USING btree ("version_slug");
  CREATE INDEX "_lessons_v_version_version_video_idx" ON "_lessons_v" USING btree ("version_video_id");
  CREATE INDEX "_lessons_v_version_version_updated_at_idx" ON "_lessons_v" USING btree ("version_updated_at");
  CREATE INDEX "_lessons_v_version_version_created_at_idx" ON "_lessons_v" USING btree ("version_created_at");
  CREATE INDEX "_lessons_v_version_version__status_idx" ON "_lessons_v" USING btree ("version__status");
  CREATE INDEX "_lessons_v_created_at_idx" ON "_lessons_v" USING btree ("created_at");
  CREATE INDEX "_lessons_v_updated_at_idx" ON "_lessons_v" USING btree ("updated_at");
  CREATE INDEX "_lessons_v_latest_idx" ON "_lessons_v" USING btree ("latest");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_classes_id_idx" ON "payload_locked_documents_rels" USING btree ("classes_id");
  CREATE INDEX "payload_locked_documents_rels_chapters_id_idx" ON "payload_locked_documents_rels" USING btree ("chapters_id");
  CREATE INDEX "payload_locked_documents_rels_lessons_id_idx" ON "payload_locked_documents_rels" USING btree ("lessons_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_page_goals_order_idx" ON "home_page_goals" USING btree ("_order");
  CREATE INDEX "home_page_goals_parent_id_idx" ON "home_page_goals" USING btree ("_parent_id");
  CREATE INDEX "home_page_getting_started_steps_order_idx" ON "home_page_getting_started_steps" USING btree ("_order");
  CREATE INDEX "home_page_getting_started_steps_parent_id_idx" ON "home_page_getting_started_steps" USING btree ("_parent_id");
  CREATE INDEX "home_page__status_idx" ON "home_page" USING btree ("_status");
  CREATE INDEX "_home_page_v_version_goals_order_idx" ON "_home_page_v_version_goals" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_goals_parent_id_idx" ON "_home_page_v_version_goals" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_getting_started_steps_order_idx" ON "_home_page_v_version_getting_started_steps" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_getting_started_steps_parent_id_idx" ON "_home_page_v_version_getting_started_steps" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_version__status_idx" ON "_home_page_v" USING btree ("version__status");
  CREATE INDEX "_home_page_v_created_at_idx" ON "_home_page_v" USING btree ("created_at");
  CREATE INDEX "_home_page_v_updated_at_idx" ON "_home_page_v" USING btree ("updated_at");
  CREATE INDEX "_home_page_v_latest_idx" ON "_home_page_v" USING btree ("latest");
  CREATE INDEX "resources_page_sections_resources_order_idx" ON "resources_page_sections_resources" USING btree ("_order");
  CREATE INDEX "resources_page_sections_resources_parent_id_idx" ON "resources_page_sections_resources" USING btree ("_parent_id");
  CREATE INDEX "resources_page_sections_order_idx" ON "resources_page_sections" USING btree ("_order");
  CREATE INDEX "resources_page_sections_parent_id_idx" ON "resources_page_sections" USING btree ("_parent_id");
  CREATE INDEX "resources_page__status_idx" ON "resources_page" USING btree ("_status");
  CREATE INDEX "_resources_page_v_version_sections_resources_order_idx" ON "_resources_page_v_version_sections_resources" USING btree ("_order");
  CREATE INDEX "_resources_page_v_version_sections_resources_parent_id_idx" ON "_resources_page_v_version_sections_resources" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_version_sections_order_idx" ON "_resources_page_v_version_sections" USING btree ("_order");
  CREATE INDEX "_resources_page_v_version_sections_parent_id_idx" ON "_resources_page_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_version_version__status_idx" ON "_resources_page_v" USING btree ("version__status");
  CREATE INDEX "_resources_page_v_created_at_idx" ON "_resources_page_v" USING btree ("created_at");
  CREATE INDEX "_resources_page_v_updated_at_idx" ON "_resources_page_v" USING btree ("updated_at");
  CREATE INDEX "_resources_page_v_latest_idx" ON "_resources_page_v" USING btree ("latest");
  CREATE INDEX "contact_page_contacts_order_idx" ON "contact_page_contacts" USING btree ("_order");
  CREATE INDEX "contact_page_contacts_parent_id_idx" ON "contact_page_contacts" USING btree ("_parent_id");
  CREATE INDEX "contact_page_contacts_photo_idx" ON "contact_page_contacts" USING btree ("photo_id");
  CREATE INDEX "contact_page__status_idx" ON "contact_page" USING btree ("_status");
  CREATE INDEX "_contact_page_v_version_contacts_order_idx" ON "_contact_page_v_version_contacts" USING btree ("_order");
  CREATE INDEX "_contact_page_v_version_contacts_parent_id_idx" ON "_contact_page_v_version_contacts" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_version_contacts_photo_idx" ON "_contact_page_v_version_contacts" USING btree ("photo_id");
  CREATE INDEX "_contact_page_v_version_version__status_idx" ON "_contact_page_v" USING btree ("version__status");
  CREATE INDEX "_contact_page_v_created_at_idx" ON "_contact_page_v" USING btree ("created_at");
  CREATE INDEX "_contact_page_v_updated_at_idx" ON "_contact_page_v" USING btree ("updated_at");
  CREATE INDEX "_contact_page_v_latest_idx" ON "_contact_page_v" USING btree ("latest");
  CREATE INDEX "getting_started_steps_order_idx" ON "getting_started_steps" USING btree ("_order");
  CREATE INDEX "getting_started_steps_parent_id_idx" ON "getting_started_steps" USING btree ("_parent_id");
  CREATE INDEX "getting_started_resources_order_idx" ON "getting_started_resources" USING btree ("_order");
  CREATE INDEX "getting_started_resources_parent_id_idx" ON "getting_started_resources" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "classes" CASCADE;
  DROP TABLE "classes_rels" CASCADE;
  DROP TABLE "_classes_v" CASCADE;
  DROP TABLE "_classes_v_rels" CASCADE;
  DROP TABLE "chapters" CASCADE;
  DROP TABLE "chapters_rels" CASCADE;
  DROP TABLE "_chapters_v" CASCADE;
  DROP TABLE "_chapters_v_rels" CASCADE;
  DROP TABLE "lessons_blocks_rich_text_block" CASCADE;
  DROP TABLE "lessons_blocks_video_block" CASCADE;
  DROP TABLE "lessons_problem_sets_questions" CASCADE;
  DROP TABLE "lessons_problem_sets" CASCADE;
  DROP TABLE "lessons" CASCADE;
  DROP TABLE "_lessons_v_blocks_rich_text_block" CASCADE;
  DROP TABLE "_lessons_v_blocks_video_block" CASCADE;
  DROP TABLE "_lessons_v_version_problem_sets_questions" CASCADE;
  DROP TABLE "_lessons_v_version_problem_sets" CASCADE;
  DROP TABLE "_lessons_v" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page_goals" CASCADE;
  DROP TABLE "home_page_getting_started_steps" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "_home_page_v_version_goals" CASCADE;
  DROP TABLE "_home_page_v_version_getting_started_steps" CASCADE;
  DROP TABLE "_home_page_v" CASCADE;
  DROP TABLE "resources_page_sections_resources" CASCADE;
  DROP TABLE "resources_page_sections" CASCADE;
  DROP TABLE "resources_page" CASCADE;
  DROP TABLE "_resources_page_v_version_sections_resources" CASCADE;
  DROP TABLE "_resources_page_v_version_sections" CASCADE;
  DROP TABLE "_resources_page_v" CASCADE;
  DROP TABLE "contact_page_contacts" CASCADE;
  DROP TABLE "contact_page" CASCADE;
  DROP TABLE "_contact_page_v_version_contacts" CASCADE;
  DROP TABLE "_contact_page_v" CASCADE;
  DROP TABLE "getting_started_steps" CASCADE;
  DROP TABLE "getting_started_resources" CASCADE;
  DROP TABLE "getting_started" CASCADE;
  DROP TYPE "public"."enum_classes_status";
  DROP TYPE "public"."enum__classes_v_version_status";
  DROP TYPE "public"."enum_chapters_status";
  DROP TYPE "public"."enum__chapters_v_version_status";
  DROP TYPE "public"."enum_lessons_status";
  DROP TYPE "public"."enum__lessons_v_version_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_home_page_status";
  DROP TYPE "public"."enum__home_page_v_version_status";
  DROP TYPE "public"."enum_resources_page_sections_resources_type";
  DROP TYPE "public"."enum_resources_page_status";
  DROP TYPE "public"."enum__resources_page_v_version_sections_resources_type";
  DROP TYPE "public"."enum__resources_page_v_version_status";
  DROP TYPE "public"."enum_contact_page_contacts_category";
  DROP TYPE "public"."enum_contact_page_status";
  DROP TYPE "public"."enum__contact_page_v_version_contacts_category";
  DROP TYPE "public"."enum__contact_page_v_version_status";`)
}
