import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
    CREATE TYPE "public"."enum_lessons_blocks_text_section_size" AS ENUM('sm', 'md', 'lg');
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    CREATE TYPE "public"."enum__lessons_v_blocks_text_section_size" AS ENUM('sm', 'md', 'lg');
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_blocks_text_section_size" AS ENUM('sm', 'md', 'lg');
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_blocks_text_section_size" AS ENUM('sm', 'md', 'lg');
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   CREATE TABLE IF NOT EXISTS "lessons_blocks_text_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "subtitle" varchar,
    "size" "enum_lessons_blocks_text_section_size" DEFAULT 'md',
    "body" jsonb,
    "block_name" varchar
   );

   CREATE TABLE IF NOT EXISTS "_lessons_v_blocks_text_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "subtitle" varchar,
    "size" "enum__lessons_v_blocks_text_section_size" DEFAULT 'md',
    "body" jsonb,
    "_uuid" varchar,
    "block_name" varchar
   );

   CREATE TABLE IF NOT EXISTS "pages_blocks_text_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "subtitle" varchar,
    "size" "enum_pages_blocks_text_section_size" DEFAULT 'md',
    "body" jsonb,
    "block_name" varchar
   );

   CREATE TABLE IF NOT EXISTS "_pages_v_blocks_text_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "subtitle" varchar,
    "size" "enum__pages_v_blocks_text_section_size" DEFAULT 'md',
    "body" jsonb,
    "_uuid" varchar,
    "block_name" varchar
   );

   DO $$ BEGIN
    ALTER TABLE "lessons_blocks_text_section" ADD CONSTRAINT "lessons_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "_lessons_v_blocks_text_section" ADD CONSTRAINT "_lessons_v_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "pages_blocks_text_section" ADD CONSTRAINT "pages_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "_pages_v_blocks_text_section" ADD CONSTRAINT "_pages_v_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;

   CREATE INDEX IF NOT EXISTS "lessons_blocks_text_section_order_idx" ON "lessons_blocks_text_section" USING btree ("_order");
   CREATE INDEX IF NOT EXISTS "lessons_blocks_text_section_parent_id_idx" ON "lessons_blocks_text_section" USING btree ("_parent_id");
   CREATE INDEX IF NOT EXISTS "lessons_blocks_text_section_path_idx" ON "lessons_blocks_text_section" USING btree ("_path");

   CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_text_section_order_idx" ON "_lessons_v_blocks_text_section" USING btree ("_order");
   CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_text_section_parent_id_idx" ON "_lessons_v_blocks_text_section" USING btree ("_parent_id");
   CREATE INDEX IF NOT EXISTS "_lessons_v_blocks_text_section_path_idx" ON "_lessons_v_blocks_text_section" USING btree ("_path");

   CREATE INDEX IF NOT EXISTS "pages_blocks_text_section_order_idx" ON "pages_blocks_text_section" USING btree ("_order");
   CREATE INDEX IF NOT EXISTS "pages_blocks_text_section_parent_id_idx" ON "pages_blocks_text_section" USING btree ("_parent_id");
   CREATE INDEX IF NOT EXISTS "pages_blocks_text_section_path_idx" ON "pages_blocks_text_section" USING btree ("_path");

   CREATE INDEX IF NOT EXISTS "_pages_v_blocks_text_section_order_idx" ON "_pages_v_blocks_text_section" USING btree ("_order");
   CREATE INDEX IF NOT EXISTS "_pages_v_blocks_text_section_parent_id_idx" ON "_pages_v_blocks_text_section" USING btree ("_parent_id");
   CREATE INDEX IF NOT EXISTS "_pages_v_blocks_text_section_path_idx" ON "_pages_v_blocks_text_section" USING btree ("_path");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "lessons_blocks_text_section" CASCADE;
   DROP TABLE IF EXISTS "_lessons_v_blocks_text_section" CASCADE;
   DROP TABLE IF EXISTS "pages_blocks_text_section" CASCADE;
   DROP TABLE IF EXISTS "_pages_v_blocks_text_section" CASCADE;

   DROP TYPE IF EXISTS "public"."enum_lessons_blocks_text_section_size";
   DROP TYPE IF EXISTS "public"."enum__lessons_v_blocks_text_section_size";
   DROP TYPE IF EXISTS "public"."enum_pages_blocks_text_section_size";
   DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_text_section_size";
  `)
}
