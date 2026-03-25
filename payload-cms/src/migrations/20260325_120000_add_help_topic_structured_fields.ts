import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- ── Enum types ──────────────────────────────────────────────────────────

    CREATE TYPE "public"."enum_admin_help_help_topics_topic_id" AS ENUM(
      'getting-started',
      'courses',
      'quizzes',
      'student-support',
      'classrooms',
      'reporting',
      'site-management',
      'troubleshooting'
    );

    CREATE TYPE "public"."enum__admin_help_v_version_help_topics_topic_id" AS ENUM(
      'getting-started',
      'courses',
      'quizzes',
      'student-support',
      'classrooms',
      'reporting',
      'site-management',
      'troubleshooting'
    );

    CREATE TYPE "public"."enum_admin_help_help_topics_sections_blocks_list_type" AS ENUM(
      'bullets',
      'steps'
    );

    CREATE TYPE "public"."enum__admin_help_v_version_help_topics_sections_blocks_list_type" AS ENUM(
      'bullets',
      'steps'
    );

    -- ── Published tables ─────────────────────────────────────────────────────

    -- helpTopics array
    CREATE TABLE "admin_help_help_topics" (
      "_order"    integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id"        varchar PRIMARY KEY NOT NULL,
      "topic_id"  "enum_admin_help_help_topics_topic_id"
    );

    -- sections array (nested inside helpTopics)
    CREATE TABLE "admin_help_help_topics_sections" (
      "_order"    integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id"        varchar PRIMARY KEY NOT NULL,
      "anchor_id" varchar,
      "heading"   varchar
    );

    -- paragraph block
    CREATE TABLE "admin_help_help_topics_sections_blocks_paragraph" (
      "_order"     integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "_path"      text NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "text"       varchar,
      "block_name" varchar
    );

    -- note block
    CREATE TABLE "admin_help_help_topics_sections_blocks_note" (
      "_order"     integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "_path"      text NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "text"       varchar,
      "block_name" varchar
    );

    -- list block
    CREATE TABLE "admin_help_help_topics_sections_blocks_list" (
      "_order"     integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "_path"      text NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "type"       "enum_admin_help_help_topics_sections_blocks_list_type" DEFAULT 'bullets',
      "block_name" varchar
    );

    -- list block → items array
    CREATE TABLE "admin_help_help_topics_sections_blocks_list_items" (
      "_order"     integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "text"       varchar,
      "href"       varchar
    );

    -- linkCardGrid block
    CREATE TABLE "admin_help_help_topics_sections_blocks_link_card_grid" (
      "_order"     integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "_path"      text NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "block_name" varchar
    );

    -- linkCardGrid block → cards array
    CREATE TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards" (
      "_order"     integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "label"      varchar,
      "href"       varchar,
      "desc"       varchar
    );

    -- ── Version tables ───────────────────────────────────────────────────────

    -- helpTopics version array
    CREATE TABLE "_admin_help_v_version_help_topics" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id"         serial PRIMARY KEY NOT NULL,
      "topic_id"   "enum__admin_help_v_version_help_topics_topic_id",
      "_uuid"      varchar
    );

    -- sections version array
    CREATE TABLE "_admin_help_v_version_help_topics_sections" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id"         serial PRIMARY KEY NOT NULL,
      "anchor_id"  varchar,
      "heading"    varchar,
      "_uuid"      varchar
    );

    -- paragraph version block
    CREATE TABLE "_admin_help_v_version_help_topics_sections_blocks_paragraph" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path"      text NOT NULL,
      "id"         serial PRIMARY KEY NOT NULL,
      "text"       varchar,
      "_uuid"      varchar,
      "block_name" varchar
    );

    -- note version block
    CREATE TABLE "_admin_help_v_version_help_topics_sections_blocks_note" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path"      text NOT NULL,
      "id"         serial PRIMARY KEY NOT NULL,
      "text"       varchar,
      "_uuid"      varchar,
      "block_name" varchar
    );

    -- list version block
    CREATE TABLE "_admin_help_v_version_help_topics_sections_blocks_list" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path"      text NOT NULL,
      "id"         serial PRIMARY KEY NOT NULL,
      "type"       "enum__admin_help_v_version_help_topics_sections_blocks_list_type" DEFAULT 'bullets',
      "_uuid"      varchar,
      "block_name" varchar
    );

    -- list version block → items array
    CREATE TABLE "_admin_help_v_version_help_topics_sections_blocks_list_items" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id"         serial PRIMARY KEY NOT NULL,
      "text"       varchar,
      "href"       varchar,
      "_uuid"      varchar
    );

    -- linkCardGrid version block
    CREATE TABLE "_admin_help_v_version_help_topics_sections_blocks_link_card_grid" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path"      text NOT NULL,
      "id"         serial PRIMARY KEY NOT NULL,
      "_uuid"      varchar,
      "block_name" varchar
    );

    -- linkCardGrid version block → cards array
    CREATE TABLE "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id"         serial PRIMARY KEY NOT NULL,
      "label"      varchar,
      "href"       varchar,
      "desc"       varchar,
      "_uuid"      varchar
    );

    -- ── Foreign keys (published) ─────────────────────────────────────────────

    ALTER TABLE "admin_help_help_topics"
      ADD CONSTRAINT "admin_help_help_topics_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "admin_help_help_topics_sections"
      ADD CONSTRAINT "admin_help_help_topics_sections_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "admin_help_help_topics_sections_blocks_paragraph"
      ADD CONSTRAINT "admin_help_help_topics_sections_blocks_paragraph_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "admin_help_help_topics_sections_blocks_note"
      ADD CONSTRAINT "admin_help_help_topics_sections_blocks_note_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "admin_help_help_topics_sections_blocks_list"
      ADD CONSTRAINT "admin_help_help_topics_sections_blocks_list_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "admin_help_help_topics_sections_blocks_list_items"
      ADD CONSTRAINT "admin_help_help_topics_sections_blocks_list_items_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections_blocks_list"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid"
      ADD CONSTRAINT "admin_help_help_topics_sections_blocks_link_card_grid_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards"
      ADD CONSTRAINT "admin_help_help_topics_sections_blocks_link_card_grid_cards_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections_blocks_link_card_grid"("id")
      ON DELETE cascade ON UPDATE no action;

    -- ── Foreign keys (versions) ──────────────────────────────────────────────

    ALTER TABLE "_admin_help_v_version_help_topics"
      ADD CONSTRAINT "_admin_help_v_version_help_topics_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_admin_help_v"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_admin_help_v_version_help_topics_sections"
      ADD CONSTRAINT "_admin_help_v_version_help_topics_sections_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_admin_help_v_version_help_topics"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_admin_help_v_version_help_topics_sections_blocks_paragraph"
      ADD CONSTRAINT "_admin_help_v_version_help_topics_sections_blocks_paragraph_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_admin_help_v_version_help_topics_sections"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_admin_help_v_version_help_topics_sections_blocks_note"
      ADD CONSTRAINT "_admin_help_v_version_help_topics_sections_blocks_note_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_admin_help_v_version_help_topics_sections"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_admin_help_v_version_help_topics_sections_blocks_list"
      ADD CONSTRAINT "_admin_help_v_version_help_topics_sections_blocks_list_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_admin_help_v_version_help_topics_sections"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_admin_help_v_version_help_topics_sections_blocks_list_items"
      ADD CONSTRAINT "_admin_help_v_version_help_topics_sections_blocks_list_items_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_admin_help_v_version_help_topics_sections_blocks_list"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_admin_help_v_version_help_topics_sections_blocks_link_card_grid"
      ADD CONSTRAINT "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_admin_help_v_version_help_topics_sections"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards"
      ADD CONSTRAINT "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_admin_help_v_version_help_topics_sections_blocks_link_card_grid"("id")
      ON DELETE cascade ON UPDATE no action;

    -- ── Indexes (published) ──────────────────────────────────────────────────

    CREATE INDEX "admin_help_help_topics_order_idx"
      ON "admin_help_help_topics" USING btree ("_order");
    CREATE INDEX "admin_help_help_topics_parent_id_idx"
      ON "admin_help_help_topics" USING btree ("_parent_id");

    CREATE INDEX "admin_help_help_topics_sections_order_idx"
      ON "admin_help_help_topics_sections" USING btree ("_order");
    CREATE INDEX "admin_help_help_topics_sections_parent_id_idx"
      ON "admin_help_help_topics_sections" USING btree ("_parent_id");

    CREATE INDEX "admin_help_help_topics_sections_blocks_paragraph_order_idx"
      ON "admin_help_help_topics_sections_blocks_paragraph" USING btree ("_order");
    CREATE INDEX "admin_help_help_topics_sections_blocks_paragraph_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_paragraph" USING btree ("_parent_id");
    CREATE INDEX "admin_help_help_topics_sections_blocks_paragraph_path_idx"
      ON "admin_help_help_topics_sections_blocks_paragraph" USING btree ("_path");

    CREATE INDEX "admin_help_help_topics_sections_blocks_note_order_idx"
      ON "admin_help_help_topics_sections_blocks_note" USING btree ("_order");
    CREATE INDEX "admin_help_help_topics_sections_blocks_note_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_note" USING btree ("_parent_id");
    CREATE INDEX "admin_help_help_topics_sections_blocks_note_path_idx"
      ON "admin_help_help_topics_sections_blocks_note" USING btree ("_path");

    CREATE INDEX "admin_help_help_topics_sections_blocks_list_order_idx"
      ON "admin_help_help_topics_sections_blocks_list" USING btree ("_order");
    CREATE INDEX "admin_help_help_topics_sections_blocks_list_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_list" USING btree ("_parent_id");
    CREATE INDEX "admin_help_help_topics_sections_blocks_list_path_idx"
      ON "admin_help_help_topics_sections_blocks_list" USING btree ("_path");

    CREATE INDEX "admin_help_help_topics_sections_blocks_list_items_order_idx"
      ON "admin_help_help_topics_sections_blocks_list_items" USING btree ("_order");
    CREATE INDEX "admin_help_help_topics_sections_blocks_list_items_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_list_items" USING btree ("_parent_id");

    CREATE INDEX "admin_help_help_topics_sections_blocks_link_card_grid_order_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid" USING btree ("_order");
    CREATE INDEX "admin_help_help_topics_sections_blocks_link_card_grid_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid" USING btree ("_parent_id");
    CREATE INDEX "admin_help_help_topics_sections_blocks_link_card_grid_path_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid" USING btree ("_path");

    CREATE INDEX "admin_help_help_topics_sections_blocks_link_card_grid_cards_order_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid_cards" USING btree ("_order");
    CREATE INDEX "admin_help_help_topics_sections_blocks_link_card_grid_cards_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid_cards" USING btree ("_parent_id");

    -- ── Indexes (versions) ───────────────────────────────────────────────────

    CREATE INDEX "_admin_help_v_version_help_topics_order_idx"
      ON "_admin_help_v_version_help_topics" USING btree ("_order");
    CREATE INDEX "_admin_help_v_version_help_topics_parent_id_idx"
      ON "_admin_help_v_version_help_topics" USING btree ("_parent_id");

    CREATE INDEX "_admin_help_v_version_help_topics_sections_order_idx"
      ON "_admin_help_v_version_help_topics_sections" USING btree ("_order");
    CREATE INDEX "_admin_help_v_version_help_topics_sections_parent_id_idx"
      ON "_admin_help_v_version_help_topics_sections" USING btree ("_parent_id");

    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_paragraph_order_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_paragraph" USING btree ("_order");
    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_paragraph_parent_id_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_paragraph" USING btree ("_parent_id");

    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_note_order_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_note" USING btree ("_order");
    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_note_parent_id_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_note" USING btree ("_parent_id");

    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_list_order_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_list" USING btree ("_order");
    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_list_parent_id_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_list" USING btree ("_parent_id");

    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_list_items_order_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_list_items" USING btree ("_order");
    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_list_items_parent_id_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_list_items" USING btree ("_parent_id");

    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_order_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_link_card_grid" USING btree ("_order");
    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_parent_id_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_link_card_grid" USING btree ("_parent_id");

    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards_order_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards" USING btree ("_order");
    CREATE INDEX "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards_parent_id_idx"
      ON "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Drop indexes (published)
    DROP INDEX IF EXISTS "admin_help_help_topics_order_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_parent_id_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_order_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_parent_id_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_paragraph_order_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_paragraph_parent_id_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_paragraph_path_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_note_order_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_note_parent_id_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_note_path_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_list_order_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_list_parent_id_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_list_path_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_list_items_order_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_list_items_parent_id_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_order_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_parent_id_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_path_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_cards_order_idx";
    DROP INDEX IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_cards_parent_id_idx";

    -- Drop indexes (versions)
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_order_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_parent_id_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_order_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_parent_id_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_paragraph_order_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_paragraph_parent_id_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_note_order_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_note_parent_id_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_list_order_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_list_parent_id_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_list_items_order_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_list_items_parent_id_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_order_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_parent_id_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards_order_idx";
    DROP INDEX IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards_parent_id_idx";

    -- Drop tables in reverse FK order (published)
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_cards";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_list_items";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_list";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_note";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_paragraph";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections";
    DROP TABLE IF EXISTS "admin_help_help_topics";

    -- Drop tables in reverse FK order (versions)
    DROP TABLE IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_link_card_grid_cards";
    DROP TABLE IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_link_card_grid";
    DROP TABLE IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_list_items";
    DROP TABLE IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_list";
    DROP TABLE IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_note";
    DROP TABLE IF EXISTS "_admin_help_v_version_help_topics_sections_blocks_paragraph";
    DROP TABLE IF EXISTS "_admin_help_v_version_help_topics_sections";
    DROP TABLE IF EXISTS "_admin_help_v_version_help_topics";

    -- Drop enum types
    DROP TYPE IF EXISTS "public"."enum_admin_help_help_topics_topic_id";
    DROP TYPE IF EXISTS "public"."enum__admin_help_v_version_help_topics_topic_id";
    DROP TYPE IF EXISTS "public"."enum_admin_help_help_topics_sections_blocks_list_type";
    DROP TYPE IF EXISTS "public"."enum__admin_help_v_version_help_topics_sections_blocks_list_type";
  `)
}
