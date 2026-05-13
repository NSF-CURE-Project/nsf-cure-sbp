import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// The 20260325 migration created the AdminHelp `blocks` storage as
// deeply-nested tables (admin_help_help_topics_sections_blocks_*), but
// Payload 3's runtime stores any `blocks` field — at any nesting level — in
// a flat table at the document root (admin_help_blocks_<slug>) and uses the
// `_path` column to record the document-tree position. The runtime query
// therefore looks for "admin_help_blocks_paragraph" etc. and 500s with
// `relation "admin_help_blocks_paragraph" does not exist`.
//
// This migration drops the wrongly-named (and provably empty) nested block
// tables and recreates them flat, parented on admin_help.id directly.
// helpTopics + helpTopics_sections remain nested — those are arrays, not
// blocks, so their nested layout is correct.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Drop the mis-named nested block tables (and the cards/items child
    -- tables they own). CASCADE handles the FKs from the array children.
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_cards" CASCADE;
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid" CASCADE;
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_list_items" CASCADE;
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_list" CASCADE;
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_note" CASCADE;
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_paragraph" CASCADE;

    -- Recreate flat per-blockSlug tables at the document root. The enum
    -- "enum_admin_help_help_topics_sections_blocks_list_type" already exists
    -- from the earlier migration; reuse it.
    CREATE TABLE IF NOT EXISTS "admin_help_blocks_paragraph" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_paragraph_order_idx"
      ON "admin_help_blocks_paragraph" ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_paragraph_parent_id_idx"
      ON "admin_help_blocks_paragraph" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_paragraph_path_idx"
      ON "admin_help_blocks_paragraph" ("_path");
    DO $$ BEGIN
      ALTER TABLE "admin_help_blocks_paragraph"
        ADD CONSTRAINT "admin_help_blocks_paragraph_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "admin_help"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_blocks_note" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_note_order_idx"
      ON "admin_help_blocks_note" ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_note_parent_id_idx"
      ON "admin_help_blocks_note" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_note_path_idx"
      ON "admin_help_blocks_note" ("_path");
    DO $$ BEGIN
      ALTER TABLE "admin_help_blocks_note"
        ADD CONSTRAINT "admin_help_blocks_note_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "admin_help"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_blocks_list" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "type" "enum_admin_help_help_topics_sections_blocks_list_type" DEFAULT 'bullets',
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_list_order_idx"
      ON "admin_help_blocks_list" ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_list_parent_id_idx"
      ON "admin_help_blocks_list" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_list_path_idx"
      ON "admin_help_blocks_list" ("_path");
    DO $$ BEGIN
      ALTER TABLE "admin_help_blocks_list"
        ADD CONSTRAINT "admin_help_blocks_list_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "admin_help"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_blocks_list_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar NOT NULL,
      "href" varchar
    );
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_list_items_order_idx"
      ON "admin_help_blocks_list_items" ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_list_items_parent_id_idx"
      ON "admin_help_blocks_list_items" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "admin_help_blocks_list_items"
        ADD CONSTRAINT "admin_help_blocks_list_items_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "admin_help_blocks_list"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_blocks_link_card_grid" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_link_card_grid_order_idx"
      ON "admin_help_blocks_link_card_grid" ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_link_card_grid_parent_id_idx"
      ON "admin_help_blocks_link_card_grid" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_link_card_grid_path_idx"
      ON "admin_help_blocks_link_card_grid" ("_path");
    DO $$ BEGIN
      ALTER TABLE "admin_help_blocks_link_card_grid"
        ADD CONSTRAINT "admin_help_blocks_link_card_grid_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "admin_help"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_blocks_link_card_grid_cards" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "href" varchar NOT NULL,
      "desc" varchar
    );
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_link_card_grid_cards_order_idx"
      ON "admin_help_blocks_link_card_grid_cards" ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_blocks_link_card_grid_cards_parent_id_idx"
      ON "admin_help_blocks_link_card_grid_cards" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "admin_help_blocks_link_card_grid_cards"
        ADD CONSTRAINT "admin_help_blocks_link_card_grid_cards_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "admin_help_blocks_link_card_grid"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restore the (still-broken) nested layout so downstream `down` runs match
  // the earlier 20260325 migration's shape. Data loss is acceptable: this
  // migration only runs on environments that were already in the broken
  // state where the nested tables held zero rows.
  await db.execute(sql`
    DROP TABLE IF EXISTS "admin_help_blocks_link_card_grid_cards" CASCADE;
    DROP TABLE IF EXISTS "admin_help_blocks_link_card_grid" CASCADE;
    DROP TABLE IF EXISTS "admin_help_blocks_list_items" CASCADE;
    DROP TABLE IF EXISTS "admin_help_blocks_list" CASCADE;
    DROP TABLE IF EXISTS "admin_help_blocks_note" CASCADE;
    DROP TABLE IF EXISTS "admin_help_blocks_paragraph" CASCADE;
  `)
}
