import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_classes_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_classes_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_classes_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__classes_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__classes_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__classes_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_chapters_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_chapters_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_chapters_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__chapters_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__chapters_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__chapters_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_lessons_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_lessons_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_lessons_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__lessons_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__lessons_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__lessons_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_home_page_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_home_page_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_home_page_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__home_page_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__home_page_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__home_page_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_resources_page_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_resources_page_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_resources_page_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__resources_page_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__resources_page_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__resources_page_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_contact_page_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_contact_page_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_contact_page_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__contact_page_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__contact_page_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__contact_page_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_getting_started_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_getting_started_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum_getting_started_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum_getting_started_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__getting_started_v_blocks_section_title_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__getting_started_v_blocks_list_block_list_style" AS ENUM('unordered', 'ordered');
  CREATE TYPE "public"."enum__getting_started_v_blocks_contacts_list_contacts_category" AS ENUM('staff', 'technical');
  CREATE TYPE "public"."enum__getting_started_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "classes_blocks_hero_block" (
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
  
  CREATE TABLE "classes_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_classes_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "classes_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "classes_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "classes_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "classes_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "classes_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_classes_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE "classes_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE "classes_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "classes_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "classes_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "classes_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "classes_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "classes_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_hero_block" (
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
  
  CREATE TABLE "_classes_v_blocks_section_title" (
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
  
  CREATE TABLE "_classes_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_video_block" (
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
  
  CREATE TABLE "_classes_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__classes_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_classes_v_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "_classes_v_blocks_contacts_list" (
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
  
  CREATE TABLE "chapters_blocks_hero_block" (
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
  
  CREATE TABLE "chapters_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_chapters_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "chapters_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "chapters_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "chapters_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "chapters_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "chapters_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_chapters_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE "chapters_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE "chapters_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "chapters_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "chapters_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "chapters_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "chapters_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "chapters_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_hero_block" (
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
  
  CREATE TABLE "_chapters_v_blocks_section_title" (
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
  
  CREATE TABLE "_chapters_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_video_block" (
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
  
  CREATE TABLE "_chapters_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__chapters_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_chapters_v_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "_chapters_v_blocks_contacts_list" (
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
  
  CREATE TABLE "lessons_blocks_hero_block" (
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
  
  CREATE TABLE "lessons_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_lessons_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "lessons_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_lessons_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE "lessons_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "lessons_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum_lessons_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "lessons_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_hero_block" (
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
  
  CREATE TABLE "_lessons_v_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum__lessons_v_blocks_section_title_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__lessons_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_contacts_list_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"category" "enum__lessons_v_blocks_contacts_list_contacts_category" DEFAULT 'staff',
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_contacts_list" (
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
  
  CREATE TABLE "home_page_blocks_hero_block" (
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
  
  CREATE TABLE "home_page_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_home_page_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_page_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_home_page_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE "home_page_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "home_page_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "home_page_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_hero_block" (
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
  
  CREATE TABLE "_home_page_v_blocks_section_title" (
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
  
  CREATE TABLE "_home_page_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_video_block" (
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
  
  CREATE TABLE "_home_page_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__home_page_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_page_v_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "_home_page_v_blocks_contacts_list" (
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
  
  CREATE TABLE "resources_page_blocks_hero_block" (
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
  
  CREATE TABLE "resources_page_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_resources_page_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "resources_page_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "resources_page_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "resources_page_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "resources_page_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "resources_page_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_resources_page_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE "resources_page_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE "resources_page_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "resources_page_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "resources_page_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "resources_page_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "resources_page_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "resources_page_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_hero_block" (
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
  
  CREATE TABLE "_resources_page_v_blocks_section_title" (
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
  
  CREATE TABLE "_resources_page_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_video_block" (
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
  
  CREATE TABLE "_resources_page_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__resources_page_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_resources_page_v_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "_resources_page_v_blocks_contacts_list" (
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
  
  CREATE TABLE "contact_page_blocks_hero_block" (
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
  
  CREATE TABLE "contact_page_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_contact_page_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "contact_page_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "contact_page_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "contact_page_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "contact_page_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "contact_page_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_contact_page_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE "contact_page_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE "contact_page_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "contact_page_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "contact_page_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "contact_page_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "contact_page_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "contact_page_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_hero_block" (
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
  
  CREATE TABLE "_contact_page_v_blocks_section_title" (
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
  
  CREATE TABLE "_contact_page_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_video_block" (
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
  
  CREATE TABLE "_contact_page_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__contact_page_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_contact_page_v_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "_contact_page_v_blocks_contacts_list" (
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
  
  CREATE TABLE "getting_started_blocks_hero_block" (
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
  
  CREATE TABLE "getting_started_blocks_section_title" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"size" "enum_getting_started_blocks_section_title_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "getting_started_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "getting_started_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "getting_started_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "getting_started_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "getting_started_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum_getting_started_blocks_list_block_list_style" DEFAULT 'unordered',
  	"block_name" varchar
  );
  
  CREATE TABLE "getting_started_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE "getting_started_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "getting_started_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "getting_started_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar
  );
  
  CREATE TABLE "getting_started_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "getting_started_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "getting_started_blocks_contacts_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"group_by_category" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_hero_block" (
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
  
  CREATE TABLE "_getting_started_v_blocks_section_title" (
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
  
  CREATE TABLE "_getting_started_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_video_block" (
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
  
  CREATE TABLE "_getting_started_v_blocks_list_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_list_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"list_style" "enum__getting_started_v_blocks_list_block_list_style" DEFAULT 'unordered',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_steps_list_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_steps_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_button_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_resources_list_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_resources_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_getting_started_v_blocks_contacts_list_contacts" (
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
  
  CREATE TABLE "_getting_started_v_blocks_contacts_list" (
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
  
  CREATE TABLE "_getting_started_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_getting_started_v_version_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_getting_started_v" (
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
  
  ALTER TABLE "getting_started_steps" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "getting_started_resources" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "getting_started_resources" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "getting_started" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "getting_started" ADD COLUMN "_status" "enum_getting_started_status" DEFAULT 'draft';
  ALTER TABLE "classes_blocks_hero_block" ADD CONSTRAINT "classes_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_section_title" ADD CONSTRAINT "classes_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_rich_text_block" ADD CONSTRAINT "classes_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_text_block" ADD CONSTRAINT "classes_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_video_block" ADD CONSTRAINT "classes_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "classes_blocks_video_block" ADD CONSTRAINT "classes_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_list_block_items" ADD CONSTRAINT "classes_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_list_block" ADD CONSTRAINT "classes_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_steps_list_steps" ADD CONSTRAINT "classes_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_steps_list" ADD CONSTRAINT "classes_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_button_block" ADD CONSTRAINT "classes_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_resources_list_resources" ADD CONSTRAINT "classes_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_resources_list" ADD CONSTRAINT "classes_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_contacts_list_contacts" ADD CONSTRAINT "classes_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "classes_blocks_contacts_list_contacts" ADD CONSTRAINT "classes_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes_blocks_contacts_list" ADD CONSTRAINT "classes_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_hero_block" ADD CONSTRAINT "_classes_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_section_title" ADD CONSTRAINT "_classes_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_rich_text_block" ADD CONSTRAINT "_classes_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_text_block" ADD CONSTRAINT "_classes_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_video_block" ADD CONSTRAINT "_classes_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_video_block" ADD CONSTRAINT "_classes_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_list_block_items" ADD CONSTRAINT "_classes_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_list_block" ADD CONSTRAINT "_classes_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_steps_list_steps" ADD CONSTRAINT "_classes_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_steps_list" ADD CONSTRAINT "_classes_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_button_block" ADD CONSTRAINT "_classes_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_resources_list_resources" ADD CONSTRAINT "_classes_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_resources_list" ADD CONSTRAINT "_classes_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_classes_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_classes_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_classes_v_blocks_contacts_list" ADD CONSTRAINT "_classes_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_classes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_hero_block" ADD CONSTRAINT "chapters_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_section_title" ADD CONSTRAINT "chapters_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_rich_text_block" ADD CONSTRAINT "chapters_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_text_block" ADD CONSTRAINT "chapters_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_video_block" ADD CONSTRAINT "chapters_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters_blocks_video_block" ADD CONSTRAINT "chapters_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_list_block_items" ADD CONSTRAINT "chapters_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_list_block" ADD CONSTRAINT "chapters_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_steps_list_steps" ADD CONSTRAINT "chapters_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_steps_list" ADD CONSTRAINT "chapters_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_button_block" ADD CONSTRAINT "chapters_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_resources_list_resources" ADD CONSTRAINT "chapters_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_resources_list" ADD CONSTRAINT "chapters_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_contacts_list_contacts" ADD CONSTRAINT "chapters_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters_blocks_contacts_list_contacts" ADD CONSTRAINT "chapters_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_blocks_contacts_list" ADD CONSTRAINT "chapters_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_hero_block" ADD CONSTRAINT "_chapters_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_section_title" ADD CONSTRAINT "_chapters_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_rich_text_block" ADD CONSTRAINT "_chapters_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_text_block" ADD CONSTRAINT "_chapters_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_video_block" ADD CONSTRAINT "_chapters_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_video_block" ADD CONSTRAINT "_chapters_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_list_block_items" ADD CONSTRAINT "_chapters_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_list_block" ADD CONSTRAINT "_chapters_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_steps_list_steps" ADD CONSTRAINT "_chapters_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_steps_list" ADD CONSTRAINT "_chapters_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_button_block" ADD CONSTRAINT "_chapters_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_resources_list_resources" ADD CONSTRAINT "_chapters_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_resources_list" ADD CONSTRAINT "_chapters_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_chapters_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_chapters_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_blocks_contacts_list" ADD CONSTRAINT "_chapters_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_hero_block" ADD CONSTRAINT "lessons_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_section_title" ADD CONSTRAINT "lessons_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_text_block" ADD CONSTRAINT "lessons_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_list_block_items" ADD CONSTRAINT "lessons_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_list_block" ADD CONSTRAINT "lessons_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_steps_list_steps" ADD CONSTRAINT "lessons_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_steps_list" ADD CONSTRAINT "lessons_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_button_block" ADD CONSTRAINT "lessons_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_resources_list_resources" ADD CONSTRAINT "lessons_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_resources_list" ADD CONSTRAINT "lessons_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_contacts_list_contacts" ADD CONSTRAINT "lessons_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_blocks_contacts_list_contacts" ADD CONSTRAINT "lessons_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_contacts_list" ADD CONSTRAINT "lessons_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_hero_block" ADD CONSTRAINT "_lessons_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_section_title" ADD CONSTRAINT "_lessons_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_text_block" ADD CONSTRAINT "_lessons_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_list_block_items" ADD CONSTRAINT "_lessons_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_list_block" ADD CONSTRAINT "_lessons_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_steps_list_steps" ADD CONSTRAINT "_lessons_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_steps_list" ADD CONSTRAINT "_lessons_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_button_block" ADD CONSTRAINT "_lessons_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_resources_list_resources" ADD CONSTRAINT "_lessons_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_resources_list" ADD CONSTRAINT "_lessons_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_lessons_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_lessons_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_contacts_list" ADD CONSTRAINT "_lessons_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_hero_block" ADD CONSTRAINT "home_page_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_section_title" ADD CONSTRAINT "home_page_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_rich_text_block" ADD CONSTRAINT "home_page_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_text_block" ADD CONSTRAINT "home_page_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_video_block" ADD CONSTRAINT "home_page_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_blocks_video_block" ADD CONSTRAINT "home_page_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_list_block_items" ADD CONSTRAINT "home_page_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_list_block" ADD CONSTRAINT "home_page_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_steps_list_steps" ADD CONSTRAINT "home_page_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_steps_list" ADD CONSTRAINT "home_page_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_button_block" ADD CONSTRAINT "home_page_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_resources_list_resources" ADD CONSTRAINT "home_page_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_resources_list" ADD CONSTRAINT "home_page_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_contacts_list_contacts" ADD CONSTRAINT "home_page_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_blocks_contacts_list_contacts" ADD CONSTRAINT "home_page_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_contacts_list" ADD CONSTRAINT "home_page_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_hero_block" ADD CONSTRAINT "_home_page_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_section_title" ADD CONSTRAINT "_home_page_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_rich_text_block" ADD CONSTRAINT "_home_page_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_text_block" ADD CONSTRAINT "_home_page_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_video_block" ADD CONSTRAINT "_home_page_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_video_block" ADD CONSTRAINT "_home_page_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_list_block_items" ADD CONSTRAINT "_home_page_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_list_block" ADD CONSTRAINT "_home_page_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_steps_list_steps" ADD CONSTRAINT "_home_page_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_steps_list" ADD CONSTRAINT "_home_page_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_button_block" ADD CONSTRAINT "_home_page_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_resources_list_resources" ADD CONSTRAINT "_home_page_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_resources_list" ADD CONSTRAINT "_home_page_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_home_page_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_home_page_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_blocks_contacts_list" ADD CONSTRAINT "_home_page_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_hero_block" ADD CONSTRAINT "resources_page_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_section_title" ADD CONSTRAINT "resources_page_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_rich_text_block" ADD CONSTRAINT "resources_page_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_text_block" ADD CONSTRAINT "resources_page_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_video_block" ADD CONSTRAINT "resources_page_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_video_block" ADD CONSTRAINT "resources_page_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_list_block_items" ADD CONSTRAINT "resources_page_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_list_block" ADD CONSTRAINT "resources_page_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_steps_list_steps" ADD CONSTRAINT "resources_page_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_steps_list" ADD CONSTRAINT "resources_page_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_button_block" ADD CONSTRAINT "resources_page_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_resources_list_resources" ADD CONSTRAINT "resources_page_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_resources_list" ADD CONSTRAINT "resources_page_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_contacts_list_contacts" ADD CONSTRAINT "resources_page_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_contacts_list_contacts" ADD CONSTRAINT "resources_page_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_page_blocks_contacts_list" ADD CONSTRAINT "resources_page_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_hero_block" ADD CONSTRAINT "_resources_page_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_section_title" ADD CONSTRAINT "_resources_page_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_rich_text_block" ADD CONSTRAINT "_resources_page_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_text_block" ADD CONSTRAINT "_resources_page_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_video_block" ADD CONSTRAINT "_resources_page_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_video_block" ADD CONSTRAINT "_resources_page_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_list_block_items" ADD CONSTRAINT "_resources_page_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_list_block" ADD CONSTRAINT "_resources_page_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_steps_list_steps" ADD CONSTRAINT "_resources_page_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_steps_list" ADD CONSTRAINT "_resources_page_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_button_block" ADD CONSTRAINT "_resources_page_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_resources_list_resources" ADD CONSTRAINT "_resources_page_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_resources_list" ADD CONSTRAINT "_resources_page_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_resources_page_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_resources_page_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_page_v_blocks_contacts_list" ADD CONSTRAINT "_resources_page_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_hero_block" ADD CONSTRAINT "contact_page_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_section_title" ADD CONSTRAINT "contact_page_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_rich_text_block" ADD CONSTRAINT "contact_page_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_text_block" ADD CONSTRAINT "contact_page_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_video_block" ADD CONSTRAINT "contact_page_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_video_block" ADD CONSTRAINT "contact_page_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_list_block_items" ADD CONSTRAINT "contact_page_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_list_block" ADD CONSTRAINT "contact_page_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_steps_list_steps" ADD CONSTRAINT "contact_page_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_steps_list" ADD CONSTRAINT "contact_page_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_button_block" ADD CONSTRAINT "contact_page_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_resources_list_resources" ADD CONSTRAINT "contact_page_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_resources_list" ADD CONSTRAINT "contact_page_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_contacts_list_contacts" ADD CONSTRAINT "contact_page_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_contacts_list_contacts" ADD CONSTRAINT "contact_page_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_blocks_contacts_list" ADD CONSTRAINT "contact_page_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_hero_block" ADD CONSTRAINT "_contact_page_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_section_title" ADD CONSTRAINT "_contact_page_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_rich_text_block" ADD CONSTRAINT "_contact_page_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_text_block" ADD CONSTRAINT "_contact_page_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_video_block" ADD CONSTRAINT "_contact_page_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_video_block" ADD CONSTRAINT "_contact_page_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_list_block_items" ADD CONSTRAINT "_contact_page_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_list_block" ADD CONSTRAINT "_contact_page_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_steps_list_steps" ADD CONSTRAINT "_contact_page_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_steps_list" ADD CONSTRAINT "_contact_page_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_button_block" ADD CONSTRAINT "_contact_page_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_resources_list_resources" ADD CONSTRAINT "_contact_page_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_resources_list" ADD CONSTRAINT "_contact_page_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_contact_page_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_contact_page_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_page_v_blocks_contacts_list" ADD CONSTRAINT "_contact_page_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_hero_block" ADD CONSTRAINT "getting_started_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_section_title" ADD CONSTRAINT "getting_started_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_rich_text_block" ADD CONSTRAINT "getting_started_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_text_block" ADD CONSTRAINT "getting_started_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_video_block" ADD CONSTRAINT "getting_started_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_video_block" ADD CONSTRAINT "getting_started_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_list_block_items" ADD CONSTRAINT "getting_started_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_list_block" ADD CONSTRAINT "getting_started_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_steps_list_steps" ADD CONSTRAINT "getting_started_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_steps_list" ADD CONSTRAINT "getting_started_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_button_block" ADD CONSTRAINT "getting_started_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_resources_list_resources" ADD CONSTRAINT "getting_started_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_resources_list" ADD CONSTRAINT "getting_started_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_contacts_list_contacts" ADD CONSTRAINT "getting_started_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_contacts_list_contacts" ADD CONSTRAINT "getting_started_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "getting_started_blocks_contacts_list" ADD CONSTRAINT "getting_started_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_started"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_hero_block" ADD CONSTRAINT "_getting_started_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_section_title" ADD CONSTRAINT "_getting_started_v_blocks_section_title_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_rich_text_block" ADD CONSTRAINT "_getting_started_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_text_block" ADD CONSTRAINT "_getting_started_v_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_video_block" ADD CONSTRAINT "_getting_started_v_blocks_video_block_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_video_block" ADD CONSTRAINT "_getting_started_v_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_list_block_items" ADD CONSTRAINT "_getting_started_v_blocks_list_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v_blocks_list_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_list_block" ADD CONSTRAINT "_getting_started_v_blocks_list_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_steps_list_steps" ADD CONSTRAINT "_getting_started_v_blocks_steps_list_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v_blocks_steps_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_steps_list" ADD CONSTRAINT "_getting_started_v_blocks_steps_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_button_block" ADD CONSTRAINT "_getting_started_v_blocks_button_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_resources_list_resources" ADD CONSTRAINT "_getting_started_v_blocks_resources_list_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v_blocks_resources_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_resources_list" ADD CONSTRAINT "_getting_started_v_blocks_resources_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_getting_started_v_blocks_contacts_list_contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_contacts_list_contacts" ADD CONSTRAINT "_getting_started_v_blocks_contacts_list_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v_blocks_contacts_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_blocks_contacts_list" ADD CONSTRAINT "_getting_started_v_blocks_contacts_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_version_steps" ADD CONSTRAINT "_getting_started_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_getting_started_v_version_resources" ADD CONSTRAINT "_getting_started_v_version_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_getting_started_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "classes_blocks_hero_block_order_idx" ON "classes_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "classes_blocks_hero_block_parent_id_idx" ON "classes_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_hero_block_path_idx" ON "classes_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "classes_blocks_section_title_order_idx" ON "classes_blocks_section_title" USING btree ("_order");
  CREATE INDEX "classes_blocks_section_title_parent_id_idx" ON "classes_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_section_title_path_idx" ON "classes_blocks_section_title" USING btree ("_path");
  CREATE INDEX "classes_blocks_rich_text_block_order_idx" ON "classes_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "classes_blocks_rich_text_block_parent_id_idx" ON "classes_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_rich_text_block_path_idx" ON "classes_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "classes_blocks_text_block_order_idx" ON "classes_blocks_text_block" USING btree ("_order");
  CREATE INDEX "classes_blocks_text_block_parent_id_idx" ON "classes_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_text_block_path_idx" ON "classes_blocks_text_block" USING btree ("_path");
  CREATE INDEX "classes_blocks_video_block_order_idx" ON "classes_blocks_video_block" USING btree ("_order");
  CREATE INDEX "classes_blocks_video_block_parent_id_idx" ON "classes_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_video_block_path_idx" ON "classes_blocks_video_block" USING btree ("_path");
  CREATE INDEX "classes_blocks_video_block_video_idx" ON "classes_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "classes_blocks_list_block_items_order_idx" ON "classes_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "classes_blocks_list_block_items_parent_id_idx" ON "classes_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_list_block_order_idx" ON "classes_blocks_list_block" USING btree ("_order");
  CREATE INDEX "classes_blocks_list_block_parent_id_idx" ON "classes_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_list_block_path_idx" ON "classes_blocks_list_block" USING btree ("_path");
  CREATE INDEX "classes_blocks_steps_list_steps_order_idx" ON "classes_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "classes_blocks_steps_list_steps_parent_id_idx" ON "classes_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_steps_list_order_idx" ON "classes_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "classes_blocks_steps_list_parent_id_idx" ON "classes_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_steps_list_path_idx" ON "classes_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "classes_blocks_button_block_order_idx" ON "classes_blocks_button_block" USING btree ("_order");
  CREATE INDEX "classes_blocks_button_block_parent_id_idx" ON "classes_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_button_block_path_idx" ON "classes_blocks_button_block" USING btree ("_path");
  CREATE INDEX "classes_blocks_resources_list_resources_order_idx" ON "classes_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "classes_blocks_resources_list_resources_parent_id_idx" ON "classes_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_resources_list_order_idx" ON "classes_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "classes_blocks_resources_list_parent_id_idx" ON "classes_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_resources_list_path_idx" ON "classes_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "classes_blocks_contacts_list_contacts_order_idx" ON "classes_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "classes_blocks_contacts_list_contacts_parent_id_idx" ON "classes_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_contacts_list_contacts_photo_idx" ON "classes_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "classes_blocks_contacts_list_order_idx" ON "classes_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "classes_blocks_contacts_list_parent_id_idx" ON "classes_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "classes_blocks_contacts_list_path_idx" ON "classes_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_hero_block_order_idx" ON "_classes_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_hero_block_parent_id_idx" ON "_classes_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_hero_block_path_idx" ON "_classes_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_section_title_order_idx" ON "_classes_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_section_title_parent_id_idx" ON "_classes_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_section_title_path_idx" ON "_classes_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_rich_text_block_order_idx" ON "_classes_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_rich_text_block_parent_id_idx" ON "_classes_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_rich_text_block_path_idx" ON "_classes_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_text_block_order_idx" ON "_classes_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_text_block_parent_id_idx" ON "_classes_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_text_block_path_idx" ON "_classes_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_video_block_order_idx" ON "_classes_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_video_block_parent_id_idx" ON "_classes_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_video_block_path_idx" ON "_classes_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_video_block_video_idx" ON "_classes_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "_classes_v_blocks_list_block_items_order_idx" ON "_classes_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_list_block_items_parent_id_idx" ON "_classes_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_list_block_order_idx" ON "_classes_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_list_block_parent_id_idx" ON "_classes_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_list_block_path_idx" ON "_classes_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_steps_list_steps_order_idx" ON "_classes_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_steps_list_steps_parent_id_idx" ON "_classes_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_steps_list_order_idx" ON "_classes_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_steps_list_parent_id_idx" ON "_classes_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_steps_list_path_idx" ON "_classes_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_button_block_order_idx" ON "_classes_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_button_block_parent_id_idx" ON "_classes_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_button_block_path_idx" ON "_classes_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_resources_list_resources_order_idx" ON "_classes_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_resources_list_resources_parent_id_idx" ON "_classes_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_resources_list_order_idx" ON "_classes_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_resources_list_parent_id_idx" ON "_classes_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_resources_list_path_idx" ON "_classes_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "_classes_v_blocks_contacts_list_contacts_order_idx" ON "_classes_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_contacts_list_contacts_parent_id_idx" ON "_classes_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_contacts_list_contacts_photo_idx" ON "_classes_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "_classes_v_blocks_contacts_list_order_idx" ON "_classes_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "_classes_v_blocks_contacts_list_parent_id_idx" ON "_classes_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "_classes_v_blocks_contacts_list_path_idx" ON "_classes_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "chapters_blocks_hero_block_order_idx" ON "chapters_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "chapters_blocks_hero_block_parent_id_idx" ON "chapters_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_hero_block_path_idx" ON "chapters_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "chapters_blocks_section_title_order_idx" ON "chapters_blocks_section_title" USING btree ("_order");
  CREATE INDEX "chapters_blocks_section_title_parent_id_idx" ON "chapters_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_section_title_path_idx" ON "chapters_blocks_section_title" USING btree ("_path");
  CREATE INDEX "chapters_blocks_rich_text_block_order_idx" ON "chapters_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "chapters_blocks_rich_text_block_parent_id_idx" ON "chapters_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_rich_text_block_path_idx" ON "chapters_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "chapters_blocks_text_block_order_idx" ON "chapters_blocks_text_block" USING btree ("_order");
  CREATE INDEX "chapters_blocks_text_block_parent_id_idx" ON "chapters_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_text_block_path_idx" ON "chapters_blocks_text_block" USING btree ("_path");
  CREATE INDEX "chapters_blocks_video_block_order_idx" ON "chapters_blocks_video_block" USING btree ("_order");
  CREATE INDEX "chapters_blocks_video_block_parent_id_idx" ON "chapters_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_video_block_path_idx" ON "chapters_blocks_video_block" USING btree ("_path");
  CREATE INDEX "chapters_blocks_video_block_video_idx" ON "chapters_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "chapters_blocks_list_block_items_order_idx" ON "chapters_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "chapters_blocks_list_block_items_parent_id_idx" ON "chapters_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_list_block_order_idx" ON "chapters_blocks_list_block" USING btree ("_order");
  CREATE INDEX "chapters_blocks_list_block_parent_id_idx" ON "chapters_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_list_block_path_idx" ON "chapters_blocks_list_block" USING btree ("_path");
  CREATE INDEX "chapters_blocks_steps_list_steps_order_idx" ON "chapters_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "chapters_blocks_steps_list_steps_parent_id_idx" ON "chapters_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_steps_list_order_idx" ON "chapters_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "chapters_blocks_steps_list_parent_id_idx" ON "chapters_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_steps_list_path_idx" ON "chapters_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "chapters_blocks_button_block_order_idx" ON "chapters_blocks_button_block" USING btree ("_order");
  CREATE INDEX "chapters_blocks_button_block_parent_id_idx" ON "chapters_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_button_block_path_idx" ON "chapters_blocks_button_block" USING btree ("_path");
  CREATE INDEX "chapters_blocks_resources_list_resources_order_idx" ON "chapters_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "chapters_blocks_resources_list_resources_parent_id_idx" ON "chapters_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_resources_list_order_idx" ON "chapters_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "chapters_blocks_resources_list_parent_id_idx" ON "chapters_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_resources_list_path_idx" ON "chapters_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "chapters_blocks_contacts_list_contacts_order_idx" ON "chapters_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "chapters_blocks_contacts_list_contacts_parent_id_idx" ON "chapters_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_contacts_list_contacts_photo_idx" ON "chapters_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "chapters_blocks_contacts_list_order_idx" ON "chapters_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "chapters_blocks_contacts_list_parent_id_idx" ON "chapters_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "chapters_blocks_contacts_list_path_idx" ON "chapters_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_hero_block_order_idx" ON "_chapters_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_hero_block_parent_id_idx" ON "_chapters_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_hero_block_path_idx" ON "_chapters_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_section_title_order_idx" ON "_chapters_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_section_title_parent_id_idx" ON "_chapters_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_section_title_path_idx" ON "_chapters_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_rich_text_block_order_idx" ON "_chapters_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_rich_text_block_parent_id_idx" ON "_chapters_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_rich_text_block_path_idx" ON "_chapters_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_text_block_order_idx" ON "_chapters_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_text_block_parent_id_idx" ON "_chapters_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_text_block_path_idx" ON "_chapters_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_video_block_order_idx" ON "_chapters_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_video_block_parent_id_idx" ON "_chapters_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_video_block_path_idx" ON "_chapters_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_video_block_video_idx" ON "_chapters_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "_chapters_v_blocks_list_block_items_order_idx" ON "_chapters_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_list_block_items_parent_id_idx" ON "_chapters_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_list_block_order_idx" ON "_chapters_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_list_block_parent_id_idx" ON "_chapters_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_list_block_path_idx" ON "_chapters_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_steps_list_steps_order_idx" ON "_chapters_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_steps_list_steps_parent_id_idx" ON "_chapters_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_steps_list_order_idx" ON "_chapters_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_steps_list_parent_id_idx" ON "_chapters_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_steps_list_path_idx" ON "_chapters_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_button_block_order_idx" ON "_chapters_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_button_block_parent_id_idx" ON "_chapters_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_button_block_path_idx" ON "_chapters_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_resources_list_resources_order_idx" ON "_chapters_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_resources_list_resources_parent_id_idx" ON "_chapters_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_resources_list_order_idx" ON "_chapters_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_resources_list_parent_id_idx" ON "_chapters_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_resources_list_path_idx" ON "_chapters_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "_chapters_v_blocks_contacts_list_contacts_order_idx" ON "_chapters_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_contacts_list_contacts_parent_id_idx" ON "_chapters_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_contacts_list_contacts_photo_idx" ON "_chapters_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "_chapters_v_blocks_contacts_list_order_idx" ON "_chapters_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "_chapters_v_blocks_contacts_list_parent_id_idx" ON "_chapters_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "_chapters_v_blocks_contacts_list_path_idx" ON "_chapters_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "lessons_blocks_hero_block_order_idx" ON "lessons_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_hero_block_parent_id_idx" ON "lessons_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_hero_block_path_idx" ON "lessons_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_section_title_order_idx" ON "lessons_blocks_section_title" USING btree ("_order");
  CREATE INDEX "lessons_blocks_section_title_parent_id_idx" ON "lessons_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_section_title_path_idx" ON "lessons_blocks_section_title" USING btree ("_path");
  CREATE INDEX "lessons_blocks_text_block_order_idx" ON "lessons_blocks_text_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_text_block_parent_id_idx" ON "lessons_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_text_block_path_idx" ON "lessons_blocks_text_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_list_block_items_order_idx" ON "lessons_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "lessons_blocks_list_block_items_parent_id_idx" ON "lessons_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_list_block_order_idx" ON "lessons_blocks_list_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_list_block_parent_id_idx" ON "lessons_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_list_block_path_idx" ON "lessons_blocks_list_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_steps_list_steps_order_idx" ON "lessons_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "lessons_blocks_steps_list_steps_parent_id_idx" ON "lessons_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_steps_list_order_idx" ON "lessons_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "lessons_blocks_steps_list_parent_id_idx" ON "lessons_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_steps_list_path_idx" ON "lessons_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "lessons_blocks_button_block_order_idx" ON "lessons_blocks_button_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_button_block_parent_id_idx" ON "lessons_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_button_block_path_idx" ON "lessons_blocks_button_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_resources_list_resources_order_idx" ON "lessons_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "lessons_blocks_resources_list_resources_parent_id_idx" ON "lessons_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_resources_list_order_idx" ON "lessons_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "lessons_blocks_resources_list_parent_id_idx" ON "lessons_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_resources_list_path_idx" ON "lessons_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "lessons_blocks_contacts_list_contacts_order_idx" ON "lessons_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "lessons_blocks_contacts_list_contacts_parent_id_idx" ON "lessons_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_contacts_list_contacts_photo_idx" ON "lessons_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "lessons_blocks_contacts_list_order_idx" ON "lessons_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "lessons_blocks_contacts_list_parent_id_idx" ON "lessons_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_contacts_list_path_idx" ON "lessons_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_hero_block_order_idx" ON "_lessons_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_hero_block_parent_id_idx" ON "_lessons_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_hero_block_path_idx" ON "_lessons_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_section_title_order_idx" ON "_lessons_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_section_title_parent_id_idx" ON "_lessons_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_section_title_path_idx" ON "_lessons_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_text_block_order_idx" ON "_lessons_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_text_block_parent_id_idx" ON "_lessons_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_text_block_path_idx" ON "_lessons_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_list_block_items_order_idx" ON "_lessons_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_list_block_items_parent_id_idx" ON "_lessons_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_list_block_order_idx" ON "_lessons_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_list_block_parent_id_idx" ON "_lessons_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_list_block_path_idx" ON "_lessons_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_steps_list_steps_order_idx" ON "_lessons_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_steps_list_steps_parent_id_idx" ON "_lessons_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_steps_list_order_idx" ON "_lessons_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_steps_list_parent_id_idx" ON "_lessons_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_steps_list_path_idx" ON "_lessons_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_button_block_order_idx" ON "_lessons_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_button_block_parent_id_idx" ON "_lessons_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_button_block_path_idx" ON "_lessons_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_resources_list_resources_order_idx" ON "_lessons_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_resources_list_resources_parent_id_idx" ON "_lessons_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_resources_list_order_idx" ON "_lessons_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_resources_list_parent_id_idx" ON "_lessons_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_resources_list_path_idx" ON "_lessons_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_contacts_list_contacts_order_idx" ON "_lessons_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_contacts_list_contacts_parent_id_idx" ON "_lessons_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_contacts_list_contacts_photo_idx" ON "_lessons_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "_lessons_v_blocks_contacts_list_order_idx" ON "_lessons_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_contacts_list_parent_id_idx" ON "_lessons_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_contacts_list_path_idx" ON "_lessons_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "home_page_blocks_hero_block_order_idx" ON "home_page_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "home_page_blocks_hero_block_parent_id_idx" ON "home_page_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_hero_block_path_idx" ON "home_page_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "home_page_blocks_section_title_order_idx" ON "home_page_blocks_section_title" USING btree ("_order");
  CREATE INDEX "home_page_blocks_section_title_parent_id_idx" ON "home_page_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_section_title_path_idx" ON "home_page_blocks_section_title" USING btree ("_path");
  CREATE INDEX "home_page_blocks_rich_text_block_order_idx" ON "home_page_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "home_page_blocks_rich_text_block_parent_id_idx" ON "home_page_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_rich_text_block_path_idx" ON "home_page_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "home_page_blocks_text_block_order_idx" ON "home_page_blocks_text_block" USING btree ("_order");
  CREATE INDEX "home_page_blocks_text_block_parent_id_idx" ON "home_page_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_text_block_path_idx" ON "home_page_blocks_text_block" USING btree ("_path");
  CREATE INDEX "home_page_blocks_video_block_order_idx" ON "home_page_blocks_video_block" USING btree ("_order");
  CREATE INDEX "home_page_blocks_video_block_parent_id_idx" ON "home_page_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_video_block_path_idx" ON "home_page_blocks_video_block" USING btree ("_path");
  CREATE INDEX "home_page_blocks_video_block_video_idx" ON "home_page_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "home_page_blocks_list_block_items_order_idx" ON "home_page_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "home_page_blocks_list_block_items_parent_id_idx" ON "home_page_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_list_block_order_idx" ON "home_page_blocks_list_block" USING btree ("_order");
  CREATE INDEX "home_page_blocks_list_block_parent_id_idx" ON "home_page_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_list_block_path_idx" ON "home_page_blocks_list_block" USING btree ("_path");
  CREATE INDEX "home_page_blocks_steps_list_steps_order_idx" ON "home_page_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "home_page_blocks_steps_list_steps_parent_id_idx" ON "home_page_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_steps_list_order_idx" ON "home_page_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "home_page_blocks_steps_list_parent_id_idx" ON "home_page_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_steps_list_path_idx" ON "home_page_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "home_page_blocks_button_block_order_idx" ON "home_page_blocks_button_block" USING btree ("_order");
  CREATE INDEX "home_page_blocks_button_block_parent_id_idx" ON "home_page_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_button_block_path_idx" ON "home_page_blocks_button_block" USING btree ("_path");
  CREATE INDEX "home_page_blocks_resources_list_resources_order_idx" ON "home_page_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "home_page_blocks_resources_list_resources_parent_id_idx" ON "home_page_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_resources_list_order_idx" ON "home_page_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "home_page_blocks_resources_list_parent_id_idx" ON "home_page_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_resources_list_path_idx" ON "home_page_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "home_page_blocks_contacts_list_contacts_order_idx" ON "home_page_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "home_page_blocks_contacts_list_contacts_parent_id_idx" ON "home_page_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_contacts_list_contacts_photo_idx" ON "home_page_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "home_page_blocks_contacts_list_order_idx" ON "home_page_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "home_page_blocks_contacts_list_parent_id_idx" ON "home_page_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_contacts_list_path_idx" ON "home_page_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_hero_block_order_idx" ON "_home_page_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_hero_block_parent_id_idx" ON "_home_page_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_hero_block_path_idx" ON "_home_page_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_section_title_order_idx" ON "_home_page_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_section_title_parent_id_idx" ON "_home_page_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_section_title_path_idx" ON "_home_page_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_rich_text_block_order_idx" ON "_home_page_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_rich_text_block_parent_id_idx" ON "_home_page_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_rich_text_block_path_idx" ON "_home_page_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_text_block_order_idx" ON "_home_page_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_text_block_parent_id_idx" ON "_home_page_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_text_block_path_idx" ON "_home_page_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_video_block_order_idx" ON "_home_page_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_video_block_parent_id_idx" ON "_home_page_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_video_block_path_idx" ON "_home_page_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_video_block_video_idx" ON "_home_page_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "_home_page_v_blocks_list_block_items_order_idx" ON "_home_page_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_list_block_items_parent_id_idx" ON "_home_page_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_list_block_order_idx" ON "_home_page_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_list_block_parent_id_idx" ON "_home_page_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_list_block_path_idx" ON "_home_page_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_steps_list_steps_order_idx" ON "_home_page_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_steps_list_steps_parent_id_idx" ON "_home_page_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_steps_list_order_idx" ON "_home_page_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_steps_list_parent_id_idx" ON "_home_page_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_steps_list_path_idx" ON "_home_page_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_button_block_order_idx" ON "_home_page_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_button_block_parent_id_idx" ON "_home_page_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_button_block_path_idx" ON "_home_page_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_resources_list_resources_order_idx" ON "_home_page_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_resources_list_resources_parent_id_idx" ON "_home_page_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_resources_list_order_idx" ON "_home_page_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_resources_list_parent_id_idx" ON "_home_page_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_resources_list_path_idx" ON "_home_page_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "_home_page_v_blocks_contacts_list_contacts_order_idx" ON "_home_page_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_contacts_list_contacts_parent_id_idx" ON "_home_page_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_contacts_list_contacts_photo_idx" ON "_home_page_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "_home_page_v_blocks_contacts_list_order_idx" ON "_home_page_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "_home_page_v_blocks_contacts_list_parent_id_idx" ON "_home_page_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_blocks_contacts_list_path_idx" ON "_home_page_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_hero_block_order_idx" ON "resources_page_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_hero_block_parent_id_idx" ON "resources_page_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_hero_block_path_idx" ON "resources_page_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_section_title_order_idx" ON "resources_page_blocks_section_title" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_section_title_parent_id_idx" ON "resources_page_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_section_title_path_idx" ON "resources_page_blocks_section_title" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_rich_text_block_order_idx" ON "resources_page_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_rich_text_block_parent_id_idx" ON "resources_page_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_rich_text_block_path_idx" ON "resources_page_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_text_block_order_idx" ON "resources_page_blocks_text_block" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_text_block_parent_id_idx" ON "resources_page_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_text_block_path_idx" ON "resources_page_blocks_text_block" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_video_block_order_idx" ON "resources_page_blocks_video_block" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_video_block_parent_id_idx" ON "resources_page_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_video_block_path_idx" ON "resources_page_blocks_video_block" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_video_block_video_idx" ON "resources_page_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "resources_page_blocks_list_block_items_order_idx" ON "resources_page_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_list_block_items_parent_id_idx" ON "resources_page_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_list_block_order_idx" ON "resources_page_blocks_list_block" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_list_block_parent_id_idx" ON "resources_page_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_list_block_path_idx" ON "resources_page_blocks_list_block" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_steps_list_steps_order_idx" ON "resources_page_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_steps_list_steps_parent_id_idx" ON "resources_page_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_steps_list_order_idx" ON "resources_page_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_steps_list_parent_id_idx" ON "resources_page_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_steps_list_path_idx" ON "resources_page_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_button_block_order_idx" ON "resources_page_blocks_button_block" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_button_block_parent_id_idx" ON "resources_page_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_button_block_path_idx" ON "resources_page_blocks_button_block" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_resources_list_resources_order_idx" ON "resources_page_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_resources_list_resources_parent_id_idx" ON "resources_page_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_resources_list_order_idx" ON "resources_page_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_resources_list_parent_id_idx" ON "resources_page_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_resources_list_path_idx" ON "resources_page_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "resources_page_blocks_contacts_list_contacts_order_idx" ON "resources_page_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_contacts_list_contacts_parent_id_idx" ON "resources_page_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_contacts_list_contacts_photo_idx" ON "resources_page_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "resources_page_blocks_contacts_list_order_idx" ON "resources_page_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "resources_page_blocks_contacts_list_parent_id_idx" ON "resources_page_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "resources_page_blocks_contacts_list_path_idx" ON "resources_page_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_hero_block_order_idx" ON "_resources_page_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_hero_block_parent_id_idx" ON "_resources_page_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_hero_block_path_idx" ON "_resources_page_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_section_title_order_idx" ON "_resources_page_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_section_title_parent_id_idx" ON "_resources_page_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_section_title_path_idx" ON "_resources_page_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_rich_text_block_order_idx" ON "_resources_page_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_rich_text_block_parent_id_idx" ON "_resources_page_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_rich_text_block_path_idx" ON "_resources_page_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_text_block_order_idx" ON "_resources_page_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_text_block_parent_id_idx" ON "_resources_page_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_text_block_path_idx" ON "_resources_page_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_video_block_order_idx" ON "_resources_page_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_video_block_parent_id_idx" ON "_resources_page_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_video_block_path_idx" ON "_resources_page_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_video_block_video_idx" ON "_resources_page_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "_resources_page_v_blocks_list_block_items_order_idx" ON "_resources_page_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_list_block_items_parent_id_idx" ON "_resources_page_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_list_block_order_idx" ON "_resources_page_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_list_block_parent_id_idx" ON "_resources_page_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_list_block_path_idx" ON "_resources_page_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_steps_list_steps_order_idx" ON "_resources_page_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_steps_list_steps_parent_id_idx" ON "_resources_page_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_steps_list_order_idx" ON "_resources_page_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_steps_list_parent_id_idx" ON "_resources_page_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_steps_list_path_idx" ON "_resources_page_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_button_block_order_idx" ON "_resources_page_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_button_block_parent_id_idx" ON "_resources_page_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_button_block_path_idx" ON "_resources_page_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_resources_list_resources_order_idx" ON "_resources_page_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_resources_list_resources_parent_id_idx" ON "_resources_page_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_resources_list_order_idx" ON "_resources_page_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_resources_list_parent_id_idx" ON "_resources_page_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_resources_list_path_idx" ON "_resources_page_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "_resources_page_v_blocks_contacts_list_contacts_order_idx" ON "_resources_page_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_contacts_list_contacts_parent_id_idx" ON "_resources_page_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_contacts_list_contacts_photo_idx" ON "_resources_page_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "_resources_page_v_blocks_contacts_list_order_idx" ON "_resources_page_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "_resources_page_v_blocks_contacts_list_parent_id_idx" ON "_resources_page_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "_resources_page_v_blocks_contacts_list_path_idx" ON "_resources_page_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_hero_block_order_idx" ON "contact_page_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_hero_block_parent_id_idx" ON "contact_page_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_hero_block_path_idx" ON "contact_page_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_section_title_order_idx" ON "contact_page_blocks_section_title" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_section_title_parent_id_idx" ON "contact_page_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_section_title_path_idx" ON "contact_page_blocks_section_title" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_rich_text_block_order_idx" ON "contact_page_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_rich_text_block_parent_id_idx" ON "contact_page_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_rich_text_block_path_idx" ON "contact_page_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_text_block_order_idx" ON "contact_page_blocks_text_block" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_text_block_parent_id_idx" ON "contact_page_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_text_block_path_idx" ON "contact_page_blocks_text_block" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_video_block_order_idx" ON "contact_page_blocks_video_block" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_video_block_parent_id_idx" ON "contact_page_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_video_block_path_idx" ON "contact_page_blocks_video_block" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_video_block_video_idx" ON "contact_page_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "contact_page_blocks_list_block_items_order_idx" ON "contact_page_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_list_block_items_parent_id_idx" ON "contact_page_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_list_block_order_idx" ON "contact_page_blocks_list_block" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_list_block_parent_id_idx" ON "contact_page_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_list_block_path_idx" ON "contact_page_blocks_list_block" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_steps_list_steps_order_idx" ON "contact_page_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_steps_list_steps_parent_id_idx" ON "contact_page_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_steps_list_order_idx" ON "contact_page_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_steps_list_parent_id_idx" ON "contact_page_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_steps_list_path_idx" ON "contact_page_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_button_block_order_idx" ON "contact_page_blocks_button_block" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_button_block_parent_id_idx" ON "contact_page_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_button_block_path_idx" ON "contact_page_blocks_button_block" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_resources_list_resources_order_idx" ON "contact_page_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_resources_list_resources_parent_id_idx" ON "contact_page_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_resources_list_order_idx" ON "contact_page_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_resources_list_parent_id_idx" ON "contact_page_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_resources_list_path_idx" ON "contact_page_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "contact_page_blocks_contacts_list_contacts_order_idx" ON "contact_page_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_contacts_list_contacts_parent_id_idx" ON "contact_page_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_contacts_list_contacts_photo_idx" ON "contact_page_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "contact_page_blocks_contacts_list_order_idx" ON "contact_page_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "contact_page_blocks_contacts_list_parent_id_idx" ON "contact_page_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "contact_page_blocks_contacts_list_path_idx" ON "contact_page_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_hero_block_order_idx" ON "_contact_page_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_hero_block_parent_id_idx" ON "_contact_page_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_hero_block_path_idx" ON "_contact_page_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_section_title_order_idx" ON "_contact_page_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_section_title_parent_id_idx" ON "_contact_page_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_section_title_path_idx" ON "_contact_page_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_rich_text_block_order_idx" ON "_contact_page_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_rich_text_block_parent_id_idx" ON "_contact_page_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_rich_text_block_path_idx" ON "_contact_page_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_text_block_order_idx" ON "_contact_page_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_text_block_parent_id_idx" ON "_contact_page_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_text_block_path_idx" ON "_contact_page_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_video_block_order_idx" ON "_contact_page_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_video_block_parent_id_idx" ON "_contact_page_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_video_block_path_idx" ON "_contact_page_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_video_block_video_idx" ON "_contact_page_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "_contact_page_v_blocks_list_block_items_order_idx" ON "_contact_page_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_list_block_items_parent_id_idx" ON "_contact_page_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_list_block_order_idx" ON "_contact_page_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_list_block_parent_id_idx" ON "_contact_page_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_list_block_path_idx" ON "_contact_page_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_steps_list_steps_order_idx" ON "_contact_page_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_steps_list_steps_parent_id_idx" ON "_contact_page_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_steps_list_order_idx" ON "_contact_page_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_steps_list_parent_id_idx" ON "_contact_page_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_steps_list_path_idx" ON "_contact_page_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_button_block_order_idx" ON "_contact_page_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_button_block_parent_id_idx" ON "_contact_page_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_button_block_path_idx" ON "_contact_page_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_resources_list_resources_order_idx" ON "_contact_page_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_resources_list_resources_parent_id_idx" ON "_contact_page_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_resources_list_order_idx" ON "_contact_page_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_resources_list_parent_id_idx" ON "_contact_page_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_resources_list_path_idx" ON "_contact_page_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "_contact_page_v_blocks_contacts_list_contacts_order_idx" ON "_contact_page_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_contacts_list_contacts_parent_id_idx" ON "_contact_page_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_contacts_list_contacts_photo_idx" ON "_contact_page_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "_contact_page_v_blocks_contacts_list_order_idx" ON "_contact_page_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "_contact_page_v_blocks_contacts_list_parent_id_idx" ON "_contact_page_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "_contact_page_v_blocks_contacts_list_path_idx" ON "_contact_page_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_hero_block_order_idx" ON "getting_started_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_hero_block_parent_id_idx" ON "getting_started_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_hero_block_path_idx" ON "getting_started_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_section_title_order_idx" ON "getting_started_blocks_section_title" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_section_title_parent_id_idx" ON "getting_started_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_section_title_path_idx" ON "getting_started_blocks_section_title" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_rich_text_block_order_idx" ON "getting_started_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_rich_text_block_parent_id_idx" ON "getting_started_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_rich_text_block_path_idx" ON "getting_started_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_text_block_order_idx" ON "getting_started_blocks_text_block" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_text_block_parent_id_idx" ON "getting_started_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_text_block_path_idx" ON "getting_started_blocks_text_block" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_video_block_order_idx" ON "getting_started_blocks_video_block" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_video_block_parent_id_idx" ON "getting_started_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_video_block_path_idx" ON "getting_started_blocks_video_block" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_video_block_video_idx" ON "getting_started_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "getting_started_blocks_list_block_items_order_idx" ON "getting_started_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_list_block_items_parent_id_idx" ON "getting_started_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_list_block_order_idx" ON "getting_started_blocks_list_block" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_list_block_parent_id_idx" ON "getting_started_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_list_block_path_idx" ON "getting_started_blocks_list_block" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_steps_list_steps_order_idx" ON "getting_started_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_steps_list_steps_parent_id_idx" ON "getting_started_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_steps_list_order_idx" ON "getting_started_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_steps_list_parent_id_idx" ON "getting_started_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_steps_list_path_idx" ON "getting_started_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_button_block_order_idx" ON "getting_started_blocks_button_block" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_button_block_parent_id_idx" ON "getting_started_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_button_block_path_idx" ON "getting_started_blocks_button_block" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_resources_list_resources_order_idx" ON "getting_started_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_resources_list_resources_parent_id_idx" ON "getting_started_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_resources_list_order_idx" ON "getting_started_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_resources_list_parent_id_idx" ON "getting_started_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_resources_list_path_idx" ON "getting_started_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "getting_started_blocks_contacts_list_contacts_order_idx" ON "getting_started_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_contacts_list_contacts_parent_id_idx" ON "getting_started_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_contacts_list_contacts_photo_idx" ON "getting_started_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "getting_started_blocks_contacts_list_order_idx" ON "getting_started_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "getting_started_blocks_contacts_list_parent_id_idx" ON "getting_started_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "getting_started_blocks_contacts_list_path_idx" ON "getting_started_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_hero_block_order_idx" ON "_getting_started_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_hero_block_parent_id_idx" ON "_getting_started_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_hero_block_path_idx" ON "_getting_started_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_section_title_order_idx" ON "_getting_started_v_blocks_section_title" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_section_title_parent_id_idx" ON "_getting_started_v_blocks_section_title" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_section_title_path_idx" ON "_getting_started_v_blocks_section_title" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_rich_text_block_order_idx" ON "_getting_started_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_rich_text_block_parent_id_idx" ON "_getting_started_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_rich_text_block_path_idx" ON "_getting_started_v_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_text_block_order_idx" ON "_getting_started_v_blocks_text_block" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_text_block_parent_id_idx" ON "_getting_started_v_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_text_block_path_idx" ON "_getting_started_v_blocks_text_block" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_video_block_order_idx" ON "_getting_started_v_blocks_video_block" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_video_block_parent_id_idx" ON "_getting_started_v_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_video_block_path_idx" ON "_getting_started_v_blocks_video_block" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_video_block_video_idx" ON "_getting_started_v_blocks_video_block" USING btree ("video_id");
  CREATE INDEX "_getting_started_v_blocks_list_block_items_order_idx" ON "_getting_started_v_blocks_list_block_items" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_list_block_items_parent_id_idx" ON "_getting_started_v_blocks_list_block_items" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_list_block_order_idx" ON "_getting_started_v_blocks_list_block" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_list_block_parent_id_idx" ON "_getting_started_v_blocks_list_block" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_list_block_path_idx" ON "_getting_started_v_blocks_list_block" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_steps_list_steps_order_idx" ON "_getting_started_v_blocks_steps_list_steps" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_steps_list_steps_parent_id_idx" ON "_getting_started_v_blocks_steps_list_steps" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_steps_list_order_idx" ON "_getting_started_v_blocks_steps_list" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_steps_list_parent_id_idx" ON "_getting_started_v_blocks_steps_list" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_steps_list_path_idx" ON "_getting_started_v_blocks_steps_list" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_button_block_order_idx" ON "_getting_started_v_blocks_button_block" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_button_block_parent_id_idx" ON "_getting_started_v_blocks_button_block" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_button_block_path_idx" ON "_getting_started_v_blocks_button_block" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_resources_list_resources_order_idx" ON "_getting_started_v_blocks_resources_list_resources" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_resources_list_resources_parent_id_idx" ON "_getting_started_v_blocks_resources_list_resources" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_resources_list_order_idx" ON "_getting_started_v_blocks_resources_list" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_resources_list_parent_id_idx" ON "_getting_started_v_blocks_resources_list" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_resources_list_path_idx" ON "_getting_started_v_blocks_resources_list" USING btree ("_path");
  CREATE INDEX "_getting_started_v_blocks_contacts_list_contacts_order_idx" ON "_getting_started_v_blocks_contacts_list_contacts" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_contacts_list_contacts_parent_id_idx" ON "_getting_started_v_blocks_contacts_list_contacts" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_contacts_list_contacts_photo_idx" ON "_getting_started_v_blocks_contacts_list_contacts" USING btree ("photo_id");
  CREATE INDEX "_getting_started_v_blocks_contacts_list_order_idx" ON "_getting_started_v_blocks_contacts_list" USING btree ("_order");
  CREATE INDEX "_getting_started_v_blocks_contacts_list_parent_id_idx" ON "_getting_started_v_blocks_contacts_list" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_blocks_contacts_list_path_idx" ON "_getting_started_v_blocks_contacts_list" USING btree ("_path");
  CREATE INDEX "_getting_started_v_version_steps_order_idx" ON "_getting_started_v_version_steps" USING btree ("_order");
  CREATE INDEX "_getting_started_v_version_steps_parent_id_idx" ON "_getting_started_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_version_resources_order_idx" ON "_getting_started_v_version_resources" USING btree ("_order");
  CREATE INDEX "_getting_started_v_version_resources_parent_id_idx" ON "_getting_started_v_version_resources" USING btree ("_parent_id");
  CREATE INDEX "_getting_started_v_version_version__status_idx" ON "_getting_started_v" USING btree ("version__status");
  CREATE INDEX "_getting_started_v_created_at_idx" ON "_getting_started_v" USING btree ("created_at");
  CREATE INDEX "_getting_started_v_updated_at_idx" ON "_getting_started_v" USING btree ("updated_at");
  CREATE INDEX "_getting_started_v_latest_idx" ON "_getting_started_v" USING btree ("latest");
  CREATE INDEX "getting_started__status_idx" ON "getting_started" USING btree ("_status");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  ALTER TABLE "lessons_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_hero_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_section_title" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_list_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_list_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_steps_list_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_steps_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_button_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_resources_list_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_resources_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_contacts_list_contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_blocks_contacts_list" DISABLE ROW LEVEL SECURITY;
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
  DROP TABLE "classes_blocks_hero_block" CASCADE;
  DROP TABLE "classes_blocks_section_title" CASCADE;
  DROP TABLE "classes_blocks_rich_text_block" CASCADE;
  DROP TABLE "classes_blocks_text_block" CASCADE;
  DROP TABLE "classes_blocks_video_block" CASCADE;
  DROP TABLE "classes_blocks_list_block_items" CASCADE;
  DROP TABLE "classes_blocks_list_block" CASCADE;
  DROP TABLE "classes_blocks_steps_list_steps" CASCADE;
  DROP TABLE "classes_blocks_steps_list" CASCADE;
  DROP TABLE "classes_blocks_button_block" CASCADE;
  DROP TABLE "classes_blocks_resources_list_resources" CASCADE;
  DROP TABLE "classes_blocks_resources_list" CASCADE;
  DROP TABLE "classes_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "classes_blocks_contacts_list" CASCADE;
  DROP TABLE "_classes_v_blocks_hero_block" CASCADE;
  DROP TABLE "_classes_v_blocks_section_title" CASCADE;
  DROP TABLE "_classes_v_blocks_rich_text_block" CASCADE;
  DROP TABLE "_classes_v_blocks_text_block" CASCADE;
  DROP TABLE "_classes_v_blocks_video_block" CASCADE;
  DROP TABLE "_classes_v_blocks_list_block_items" CASCADE;
  DROP TABLE "_classes_v_blocks_list_block" CASCADE;
  DROP TABLE "_classes_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE "_classes_v_blocks_steps_list" CASCADE;
  DROP TABLE "_classes_v_blocks_button_block" CASCADE;
  DROP TABLE "_classes_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE "_classes_v_blocks_resources_list" CASCADE;
  DROP TABLE "_classes_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "_classes_v_blocks_contacts_list" CASCADE;
  DROP TABLE "chapters_blocks_hero_block" CASCADE;
  DROP TABLE "chapters_blocks_section_title" CASCADE;
  DROP TABLE "chapters_blocks_rich_text_block" CASCADE;
  DROP TABLE "chapters_blocks_text_block" CASCADE;
  DROP TABLE "chapters_blocks_video_block" CASCADE;
  DROP TABLE "chapters_blocks_list_block_items" CASCADE;
  DROP TABLE "chapters_blocks_list_block" CASCADE;
  DROP TABLE "chapters_blocks_steps_list_steps" CASCADE;
  DROP TABLE "chapters_blocks_steps_list" CASCADE;
  DROP TABLE "chapters_blocks_button_block" CASCADE;
  DROP TABLE "chapters_blocks_resources_list_resources" CASCADE;
  DROP TABLE "chapters_blocks_resources_list" CASCADE;
  DROP TABLE "chapters_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "chapters_blocks_contacts_list" CASCADE;
  DROP TABLE "_chapters_v_blocks_hero_block" CASCADE;
  DROP TABLE "_chapters_v_blocks_section_title" CASCADE;
  DROP TABLE "_chapters_v_blocks_rich_text_block" CASCADE;
  DROP TABLE "_chapters_v_blocks_text_block" CASCADE;
  DROP TABLE "_chapters_v_blocks_video_block" CASCADE;
  DROP TABLE "_chapters_v_blocks_list_block_items" CASCADE;
  DROP TABLE "_chapters_v_blocks_list_block" CASCADE;
  DROP TABLE "_chapters_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE "_chapters_v_blocks_steps_list" CASCADE;
  DROP TABLE "_chapters_v_blocks_button_block" CASCADE;
  DROP TABLE "_chapters_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE "_chapters_v_blocks_resources_list" CASCADE;
  DROP TABLE "_chapters_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "_chapters_v_blocks_contacts_list" CASCADE;
  DROP TABLE "lessons_blocks_hero_block" CASCADE;
  DROP TABLE "lessons_blocks_section_title" CASCADE;
  DROP TABLE "lessons_blocks_text_block" CASCADE;
  DROP TABLE "lessons_blocks_list_block_items" CASCADE;
  DROP TABLE "lessons_blocks_list_block" CASCADE;
  DROP TABLE "lessons_blocks_steps_list_steps" CASCADE;
  DROP TABLE "lessons_blocks_steps_list" CASCADE;
  DROP TABLE "lessons_blocks_button_block" CASCADE;
  DROP TABLE "lessons_blocks_resources_list_resources" CASCADE;
  DROP TABLE "lessons_blocks_resources_list" CASCADE;
  DROP TABLE "lessons_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "lessons_blocks_contacts_list" CASCADE;
  DROP TABLE "_lessons_v_blocks_hero_block" CASCADE;
  DROP TABLE "_lessons_v_blocks_section_title" CASCADE;
  DROP TABLE "_lessons_v_blocks_text_block" CASCADE;
  DROP TABLE "_lessons_v_blocks_list_block_items" CASCADE;
  DROP TABLE "_lessons_v_blocks_list_block" CASCADE;
  DROP TABLE "_lessons_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE "_lessons_v_blocks_steps_list" CASCADE;
  DROP TABLE "_lessons_v_blocks_button_block" CASCADE;
  DROP TABLE "_lessons_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE "_lessons_v_blocks_resources_list" CASCADE;
  DROP TABLE "_lessons_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "_lessons_v_blocks_contacts_list" CASCADE;
  DROP TABLE "home_page_blocks_hero_block" CASCADE;
  DROP TABLE "home_page_blocks_section_title" CASCADE;
  DROP TABLE "home_page_blocks_rich_text_block" CASCADE;
  DROP TABLE "home_page_blocks_text_block" CASCADE;
  DROP TABLE "home_page_blocks_video_block" CASCADE;
  DROP TABLE "home_page_blocks_list_block_items" CASCADE;
  DROP TABLE "home_page_blocks_list_block" CASCADE;
  DROP TABLE "home_page_blocks_steps_list_steps" CASCADE;
  DROP TABLE "home_page_blocks_steps_list" CASCADE;
  DROP TABLE "home_page_blocks_button_block" CASCADE;
  DROP TABLE "home_page_blocks_resources_list_resources" CASCADE;
  DROP TABLE "home_page_blocks_resources_list" CASCADE;
  DROP TABLE "home_page_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "home_page_blocks_contacts_list" CASCADE;
  DROP TABLE "_home_page_v_blocks_hero_block" CASCADE;
  DROP TABLE "_home_page_v_blocks_section_title" CASCADE;
  DROP TABLE "_home_page_v_blocks_rich_text_block" CASCADE;
  DROP TABLE "_home_page_v_blocks_text_block" CASCADE;
  DROP TABLE "_home_page_v_blocks_video_block" CASCADE;
  DROP TABLE "_home_page_v_blocks_list_block_items" CASCADE;
  DROP TABLE "_home_page_v_blocks_list_block" CASCADE;
  DROP TABLE "_home_page_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE "_home_page_v_blocks_steps_list" CASCADE;
  DROP TABLE "_home_page_v_blocks_button_block" CASCADE;
  DROP TABLE "_home_page_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE "_home_page_v_blocks_resources_list" CASCADE;
  DROP TABLE "_home_page_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "_home_page_v_blocks_contacts_list" CASCADE;
  DROP TABLE "resources_page_blocks_hero_block" CASCADE;
  DROP TABLE "resources_page_blocks_section_title" CASCADE;
  DROP TABLE "resources_page_blocks_rich_text_block" CASCADE;
  DROP TABLE "resources_page_blocks_text_block" CASCADE;
  DROP TABLE "resources_page_blocks_video_block" CASCADE;
  DROP TABLE "resources_page_blocks_list_block_items" CASCADE;
  DROP TABLE "resources_page_blocks_list_block" CASCADE;
  DROP TABLE "resources_page_blocks_steps_list_steps" CASCADE;
  DROP TABLE "resources_page_blocks_steps_list" CASCADE;
  DROP TABLE "resources_page_blocks_button_block" CASCADE;
  DROP TABLE "resources_page_blocks_resources_list_resources" CASCADE;
  DROP TABLE "resources_page_blocks_resources_list" CASCADE;
  DROP TABLE "resources_page_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "resources_page_blocks_contacts_list" CASCADE;
  DROP TABLE "_resources_page_v_blocks_hero_block" CASCADE;
  DROP TABLE "_resources_page_v_blocks_section_title" CASCADE;
  DROP TABLE "_resources_page_v_blocks_rich_text_block" CASCADE;
  DROP TABLE "_resources_page_v_blocks_text_block" CASCADE;
  DROP TABLE "_resources_page_v_blocks_video_block" CASCADE;
  DROP TABLE "_resources_page_v_blocks_list_block_items" CASCADE;
  DROP TABLE "_resources_page_v_blocks_list_block" CASCADE;
  DROP TABLE "_resources_page_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE "_resources_page_v_blocks_steps_list" CASCADE;
  DROP TABLE "_resources_page_v_blocks_button_block" CASCADE;
  DROP TABLE "_resources_page_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE "_resources_page_v_blocks_resources_list" CASCADE;
  DROP TABLE "_resources_page_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "_resources_page_v_blocks_contacts_list" CASCADE;
  DROP TABLE "contact_page_blocks_hero_block" CASCADE;
  DROP TABLE "contact_page_blocks_section_title" CASCADE;
  DROP TABLE "contact_page_blocks_rich_text_block" CASCADE;
  DROP TABLE "contact_page_blocks_text_block" CASCADE;
  DROP TABLE "contact_page_blocks_video_block" CASCADE;
  DROP TABLE "contact_page_blocks_list_block_items" CASCADE;
  DROP TABLE "contact_page_blocks_list_block" CASCADE;
  DROP TABLE "contact_page_blocks_steps_list_steps" CASCADE;
  DROP TABLE "contact_page_blocks_steps_list" CASCADE;
  DROP TABLE "contact_page_blocks_button_block" CASCADE;
  DROP TABLE "contact_page_blocks_resources_list_resources" CASCADE;
  DROP TABLE "contact_page_blocks_resources_list" CASCADE;
  DROP TABLE "contact_page_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "contact_page_blocks_contacts_list" CASCADE;
  DROP TABLE "_contact_page_v_blocks_hero_block" CASCADE;
  DROP TABLE "_contact_page_v_blocks_section_title" CASCADE;
  DROP TABLE "_contact_page_v_blocks_rich_text_block" CASCADE;
  DROP TABLE "_contact_page_v_blocks_text_block" CASCADE;
  DROP TABLE "_contact_page_v_blocks_video_block" CASCADE;
  DROP TABLE "_contact_page_v_blocks_list_block_items" CASCADE;
  DROP TABLE "_contact_page_v_blocks_list_block" CASCADE;
  DROP TABLE "_contact_page_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE "_contact_page_v_blocks_steps_list" CASCADE;
  DROP TABLE "_contact_page_v_blocks_button_block" CASCADE;
  DROP TABLE "_contact_page_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE "_contact_page_v_blocks_resources_list" CASCADE;
  DROP TABLE "_contact_page_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "_contact_page_v_blocks_contacts_list" CASCADE;
  DROP TABLE "getting_started_blocks_hero_block" CASCADE;
  DROP TABLE "getting_started_blocks_section_title" CASCADE;
  DROP TABLE "getting_started_blocks_rich_text_block" CASCADE;
  DROP TABLE "getting_started_blocks_text_block" CASCADE;
  DROP TABLE "getting_started_blocks_video_block" CASCADE;
  DROP TABLE "getting_started_blocks_list_block_items" CASCADE;
  DROP TABLE "getting_started_blocks_list_block" CASCADE;
  DROP TABLE "getting_started_blocks_steps_list_steps" CASCADE;
  DROP TABLE "getting_started_blocks_steps_list" CASCADE;
  DROP TABLE "getting_started_blocks_button_block" CASCADE;
  DROP TABLE "getting_started_blocks_resources_list_resources" CASCADE;
  DROP TABLE "getting_started_blocks_resources_list" CASCADE;
  DROP TABLE "getting_started_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "getting_started_blocks_contacts_list" CASCADE;
  DROP TABLE "_getting_started_v_blocks_hero_block" CASCADE;
  DROP TABLE "_getting_started_v_blocks_section_title" CASCADE;
  DROP TABLE "_getting_started_v_blocks_rich_text_block" CASCADE;
  DROP TABLE "_getting_started_v_blocks_text_block" CASCADE;
  DROP TABLE "_getting_started_v_blocks_video_block" CASCADE;
  DROP TABLE "_getting_started_v_blocks_list_block_items" CASCADE;
  DROP TABLE "_getting_started_v_blocks_list_block" CASCADE;
  DROP TABLE "_getting_started_v_blocks_steps_list_steps" CASCADE;
  DROP TABLE "_getting_started_v_blocks_steps_list" CASCADE;
  DROP TABLE "_getting_started_v_blocks_button_block" CASCADE;
  DROP TABLE "_getting_started_v_blocks_resources_list_resources" CASCADE;
  DROP TABLE "_getting_started_v_blocks_resources_list" CASCADE;
  DROP TABLE "_getting_started_v_blocks_contacts_list_contacts" CASCADE;
  DROP TABLE "_getting_started_v_blocks_contacts_list" CASCADE;
  DROP TABLE "_getting_started_v_version_steps" CASCADE;
  DROP TABLE "_getting_started_v_version_resources" CASCADE;
  DROP TABLE "_getting_started_v" CASCADE;
  DROP INDEX "getting_started__status_idx";
  ALTER TABLE "getting_started_steps" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "getting_started_resources" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "getting_started_resources" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "getting_started" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "getting_started" DROP COLUMN "_status";
  DROP TYPE "public"."enum_classes_blocks_section_title_size";
  DROP TYPE "public"."enum_classes_blocks_list_block_list_style";
  DROP TYPE "public"."enum_classes_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum__classes_v_blocks_section_title_size";
  DROP TYPE "public"."enum__classes_v_blocks_list_block_list_style";
  DROP TYPE "public"."enum__classes_v_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum_chapters_blocks_section_title_size";
  DROP TYPE "public"."enum_chapters_blocks_list_block_list_style";
  DROP TYPE "public"."enum_chapters_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum__chapters_v_blocks_section_title_size";
  DROP TYPE "public"."enum__chapters_v_blocks_list_block_list_style";
  DROP TYPE "public"."enum__chapters_v_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum_lessons_blocks_section_title_size";
  DROP TYPE "public"."enum_lessons_blocks_list_block_list_style";
  DROP TYPE "public"."enum_lessons_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum__lessons_v_blocks_section_title_size";
  DROP TYPE "public"."enum__lessons_v_blocks_list_block_list_style";
  DROP TYPE "public"."enum__lessons_v_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum_home_page_blocks_section_title_size";
  DROP TYPE "public"."enum_home_page_blocks_list_block_list_style";
  DROP TYPE "public"."enum_home_page_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum__home_page_v_blocks_section_title_size";
  DROP TYPE "public"."enum__home_page_v_blocks_list_block_list_style";
  DROP TYPE "public"."enum__home_page_v_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum_resources_page_blocks_section_title_size";
  DROP TYPE "public"."enum_resources_page_blocks_list_block_list_style";
  DROP TYPE "public"."enum_resources_page_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum__resources_page_v_blocks_section_title_size";
  DROP TYPE "public"."enum__resources_page_v_blocks_list_block_list_style";
  DROP TYPE "public"."enum__resources_page_v_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum_contact_page_blocks_section_title_size";
  DROP TYPE "public"."enum_contact_page_blocks_list_block_list_style";
  DROP TYPE "public"."enum_contact_page_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum__contact_page_v_blocks_section_title_size";
  DROP TYPE "public"."enum__contact_page_v_blocks_list_block_list_style";
  DROP TYPE "public"."enum__contact_page_v_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum_getting_started_blocks_section_title_size";
  DROP TYPE "public"."enum_getting_started_blocks_list_block_list_style";
  DROP TYPE "public"."enum_getting_started_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum_getting_started_status";
  DROP TYPE "public"."enum__getting_started_v_blocks_section_title_size";
  DROP TYPE "public"."enum__getting_started_v_blocks_list_block_list_style";
  DROP TYPE "public"."enum__getting_started_v_blocks_contacts_list_contacts_category";
  DROP TYPE "public"."enum__getting_started_v_version_status";`)
}
