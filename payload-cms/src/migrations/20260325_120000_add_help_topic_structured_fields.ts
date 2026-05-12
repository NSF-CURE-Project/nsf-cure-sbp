import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_admin_help_help_topics_topic_id" AS ENUM (
        'getting-started',
        'courses',
        'quizzes',
        'student-support',
        'classrooms',
        'reporting',
        'site-management',
        'troubleshooting'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TYPE "public"."enum_admin_help_help_topics_topic_id" ADD VALUE IF NOT EXISTS 'getting-started';
    ALTER TYPE "public"."enum_admin_help_help_topics_topic_id" ADD VALUE IF NOT EXISTS 'courses';
    ALTER TYPE "public"."enum_admin_help_help_topics_topic_id" ADD VALUE IF NOT EXISTS 'quizzes';
    ALTER TYPE "public"."enum_admin_help_help_topics_topic_id" ADD VALUE IF NOT EXISTS 'student-support';
    ALTER TYPE "public"."enum_admin_help_help_topics_topic_id" ADD VALUE IF NOT EXISTS 'classrooms';
    ALTER TYPE "public"."enum_admin_help_help_topics_topic_id" ADD VALUE IF NOT EXISTS 'reporting';
    ALTER TYPE "public"."enum_admin_help_help_topics_topic_id" ADD VALUE IF NOT EXISTS 'site-management';
    ALTER TYPE "public"."enum_admin_help_help_topics_topic_id" ADD VALUE IF NOT EXISTS 'troubleshooting';

    DO $$ BEGIN
      CREATE TYPE "public"."enum_admin_help_help_topics_sections_blocks_list_type" AS ENUM (
        'bullets',
        'steps'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TYPE "public"."enum_admin_help_help_topics_sections_blocks_list_type" ADD VALUE IF NOT EXISTS 'bullets';
    ALTER TYPE "public"."enum_admin_help_help_topics_sections_blocks_list_type" ADD VALUE IF NOT EXISTS 'steps';

    CREATE TABLE IF NOT EXISTS "admin_help_help_topics" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar NOT NULL,
      "topic_id" "enum_admin_help_help_topics_topic_id"
    );

    ALTER TABLE "admin_help_help_topics" ADD COLUMN IF NOT EXISTS "_order" integer;
    ALTER TABLE "admin_help_help_topics" ADD COLUMN IF NOT EXISTS "_parent_id" integer;
    ALTER TABLE "admin_help_help_topics" ADD COLUMN IF NOT EXISTS "id" varchar;
    ALTER TABLE "admin_help_help_topics" ADD COLUMN IF NOT EXISTS "topic_id" "enum_admin_help_help_topics_topic_id";

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics" ADD CONSTRAINT "admin_help_help_topics_pkey" PRIMARY KEY ("id");
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_help_topics_sections" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar NOT NULL,
      "anchor_id" varchar,
      "heading" varchar
    );

    ALTER TABLE "admin_help_help_topics_sections" ADD COLUMN IF NOT EXISTS "_order" integer;
    ALTER TABLE "admin_help_help_topics_sections" ADD COLUMN IF NOT EXISTS "_parent_id" varchar;
    ALTER TABLE "admin_help_help_topics_sections" ADD COLUMN IF NOT EXISTS "id" varchar;
    ALTER TABLE "admin_help_help_topics_sections" ADD COLUMN IF NOT EXISTS "anchor_id" varchar;
    ALTER TABLE "admin_help_help_topics_sections" ADD COLUMN IF NOT EXISTS "heading" varchar;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections" ADD CONSTRAINT "admin_help_help_topics_sections_pkey" PRIMARY KEY ("id");
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_help_topics_sections_blocks_paragraph" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "_path" text NOT NULL,
      "id" varchar NOT NULL,
      "text" varchar,
      "block_name" varchar
    );

    ALTER TABLE "admin_help_help_topics_sections_blocks_paragraph" ADD COLUMN IF NOT EXISTS "_order" integer;
    ALTER TABLE "admin_help_help_topics_sections_blocks_paragraph" ADD COLUMN IF NOT EXISTS "_parent_id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_paragraph" ADD COLUMN IF NOT EXISTS "_path" text;
    ALTER TABLE "admin_help_help_topics_sections_blocks_paragraph" ADD COLUMN IF NOT EXISTS "id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_paragraph" ADD COLUMN IF NOT EXISTS "text" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_paragraph" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_paragraph" ADD CONSTRAINT "admin_help_help_topics_sections_blocks_paragraph_pkey" PRIMARY KEY ("id");
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_help_topics_sections_blocks_note" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "_path" text NOT NULL,
      "id" varchar NOT NULL,
      "text" varchar,
      "block_name" varchar
    );

    ALTER TABLE "admin_help_help_topics_sections_blocks_note" ADD COLUMN IF NOT EXISTS "_order" integer;
    ALTER TABLE "admin_help_help_topics_sections_blocks_note" ADD COLUMN IF NOT EXISTS "_parent_id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_note" ADD COLUMN IF NOT EXISTS "_path" text;
    ALTER TABLE "admin_help_help_topics_sections_blocks_note" ADD COLUMN IF NOT EXISTS "id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_note" ADD COLUMN IF NOT EXISTS "text" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_note" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_note" ADD CONSTRAINT "admin_help_help_topics_sections_blocks_note_pkey" PRIMARY KEY ("id");
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_help_topics_sections_blocks_list" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "_path" text NOT NULL,
      "id" varchar NOT NULL,
      "type" "enum_admin_help_help_topics_sections_blocks_list_type" DEFAULT 'bullets',
      "block_name" varchar
    );

    ALTER TABLE "admin_help_help_topics_sections_blocks_list" ADD COLUMN IF NOT EXISTS "_order" integer;
    ALTER TABLE "admin_help_help_topics_sections_blocks_list" ADD COLUMN IF NOT EXISTS "_parent_id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_list" ADD COLUMN IF NOT EXISTS "_path" text;
    ALTER TABLE "admin_help_help_topics_sections_blocks_list" ADD COLUMN IF NOT EXISTS "id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_list" ADD COLUMN IF NOT EXISTS "type" "enum_admin_help_help_topics_sections_blocks_list_type";
    ALTER TABLE "admin_help_help_topics_sections_blocks_list" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_list" ADD CONSTRAINT "admin_help_help_topics_sections_blocks_list_pkey" PRIMARY KEY ("id");
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_help_topics_sections_blocks_list_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar NOT NULL,
      "text" varchar,
      "href" varchar
    );

    ALTER TABLE "admin_help_help_topics_sections_blocks_list_items" ADD COLUMN IF NOT EXISTS "_order" integer;
    ALTER TABLE "admin_help_help_topics_sections_blocks_list_items" ADD COLUMN IF NOT EXISTS "_parent_id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_list_items" ADD COLUMN IF NOT EXISTS "id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_list_items" ADD COLUMN IF NOT EXISTS "text" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_list_items" ADD COLUMN IF NOT EXISTS "href" varchar;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_list_items" ADD CONSTRAINT "admin_help_help_topics_sections_blocks_list_items_pkey" PRIMARY KEY ("id");
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_help_topics_sections_blocks_link_card_grid" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "_path" text NOT NULL,
      "id" varchar NOT NULL,
      "block_name" varchar
    );

    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid" ADD COLUMN IF NOT EXISTS "_order" integer;
    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid" ADD COLUMN IF NOT EXISTS "_parent_id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid" ADD COLUMN IF NOT EXISTS "_path" text;
    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid" ADD COLUMN IF NOT EXISTS "id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid" ADD CONSTRAINT "admin_help_help_topics_sections_blocks_link_card_grid_pkey" PRIMARY KEY ("id");
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_cards" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar NOT NULL,
      "label" varchar,
      "href" varchar,
      "desc" varchar
    );

    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards" ADD COLUMN IF NOT EXISTS "_order" integer;
    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards" ADD COLUMN IF NOT EXISTS "_parent_id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards" ADD COLUMN IF NOT EXISTS "id" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards" ADD COLUMN IF NOT EXISTS "label" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards" ADD COLUMN IF NOT EXISTS "href" varchar;
    ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards" ADD COLUMN IF NOT EXISTS "desc" varchar;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards" ADD CONSTRAINT "admin_help_help_topics_sections_blocks_link_card_grid_cards_pkey" PRIMARY KEY ("id");
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics"
        ADD CONSTRAINT "admin_help_help_topics_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections"
        ADD CONSTRAINT "admin_help_help_topics_sections_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_paragraph"
        ADD CONSTRAINT "admin_help_help_topics_sections_blocks_paragraph_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_note"
        ADD CONSTRAINT "admin_help_help_topics_sections_blocks_note_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_list"
        ADD CONSTRAINT "admin_help_help_topics_sections_blocks_list_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_list_items"
        ADD CONSTRAINT "admin_help_help_topics_sections_blocks_list_items_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections_blocks_list"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid"
        ADD CONSTRAINT "admin_help_help_topics_sections_blocks_link_card_grid_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "admin_help_help_topics_sections_blocks_link_card_grid_cards"
        ADD CONSTRAINT "admin_help_help_topics_sections_blocks_link_card_grid_cards_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_help_help_topics_sections_blocks_link_card_grid"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_order_idx" ON "admin_help_help_topics" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_parent_id_idx" ON "admin_help_help_topics" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_order_idx" ON "admin_help_help_topics_sections" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_parent_id_idx" ON "admin_help_help_topics_sections" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_paragraph_order_idx"
      ON "admin_help_help_topics_sections_blocks_paragraph" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_paragraph_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_paragraph" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_paragraph_path_idx"
      ON "admin_help_help_topics_sections_blocks_paragraph" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_note_order_idx"
      ON "admin_help_help_topics_sections_blocks_note" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_note_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_note" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_note_path_idx"
      ON "admin_help_help_topics_sections_blocks_note" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_list_order_idx"
      ON "admin_help_help_topics_sections_blocks_list" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_list_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_list" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_list_path_idx"
      ON "admin_help_help_topics_sections_blocks_list" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_list_items_order_idx"
      ON "admin_help_help_topics_sections_blocks_list_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "admin_help_help_topics_sections_blocks_list_items_parent_id_idx"
      ON "admin_help_help_topics_sections_blocks_list_items" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "ah_ht_sec_lcg_order_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "ah_ht_sec_lcg_parent_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "ah_ht_sec_lcg_path_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "ah_ht_sec_lcgc_order_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid_cards" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "ah_ht_sec_lcgc_parent_idx"
      ON "admin_help_help_topics_sections_blocks_link_card_grid_cards" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
    DROP INDEX IF EXISTS "ah_ht_sec_lcg_order_idx";
    DROP INDEX IF EXISTS "ah_ht_sec_lcg_parent_idx";
    DROP INDEX IF EXISTS "ah_ht_sec_lcg_path_idx";
    DROP INDEX IF EXISTS "ah_ht_sec_lcgc_order_idx";
    DROP INDEX IF EXISTS "ah_ht_sec_lcgc_parent_idx";

    ALTER TABLE IF EXISTS "admin_help_help_topics" DROP CONSTRAINT IF EXISTS "admin_help_help_topics_parent_id_fk";
    ALTER TABLE IF EXISTS "admin_help_help_topics_sections" DROP CONSTRAINT IF EXISTS "admin_help_help_topics_sections_parent_id_fk";
    ALTER TABLE IF EXISTS "admin_help_help_topics_sections_blocks_paragraph"
      DROP CONSTRAINT IF EXISTS "admin_help_help_topics_sections_blocks_paragraph_parent_id_fk";
    ALTER TABLE IF EXISTS "admin_help_help_topics_sections_blocks_note"
      DROP CONSTRAINT IF EXISTS "admin_help_help_topics_sections_blocks_note_parent_id_fk";
    ALTER TABLE IF EXISTS "admin_help_help_topics_sections_blocks_list"
      DROP CONSTRAINT IF EXISTS "admin_help_help_topics_sections_blocks_list_parent_id_fk";
    ALTER TABLE IF EXISTS "admin_help_help_topics_sections_blocks_list_items"
      DROP CONSTRAINT IF EXISTS "admin_help_help_topics_sections_blocks_list_items_parent_id_fk";
    ALTER TABLE IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid"
      DROP CONSTRAINT IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_parent_id_fk";
    ALTER TABLE IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_cards"
      DROP CONSTRAINT IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_cards_parent_id_fk";

    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid_cards";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_link_card_grid";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_list_items";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_list";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_note";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections_blocks_paragraph";
    DROP TABLE IF EXISTS "admin_help_help_topics_sections";
    DROP TABLE IF EXISTS "admin_help_help_topics";

    DROP TYPE IF EXISTS "public"."enum_admin_help_help_topics_topic_id";
    DROP TYPE IF EXISTS "public"."enum_admin_help_help_topics_sections_blocks_list_type";
  `)
}
