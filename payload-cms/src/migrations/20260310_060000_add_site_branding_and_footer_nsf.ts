import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_branding_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__site_branding_v_version_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "site_branding" (
      "id" serial PRIMARY KEY NOT NULL,
      "program_logo_id" integer,
      "program_logo_alt" varchar DEFAULT 'NSF CURE Summer Bridge Program logo',
      "_status" "enum_site_branding_status" DEFAULT 'draft',
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "_site_branding_v" (
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

    ALTER TABLE IF EXISTS "footer"
      ADD COLUMN IF NOT EXISTS "bottom_nsf_compliance_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "bottom_nsf_compliance_funding_acknowledgment" varchar,
      ADD COLUMN IF NOT EXISTS "bottom_nsf_compliance_disclaimer" varchar;

    ALTER TABLE IF EXISTS "_footer_v"
      ADD COLUMN IF NOT EXISTS "version_bottom_nsf_compliance_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_bottom_nsf_compliance_funding_acknowledgment" varchar,
      ADD COLUMN IF NOT EXISTS "version_bottom_nsf_compliance_disclaimer" varchar;

    DO $$ BEGIN
      ALTER TABLE "site_branding"
        ADD CONSTRAINT "site_branding_program_logo_id_media_id_fk"
        FOREIGN KEY ("program_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "_site_branding_v"
        ADD CONSTRAINT "_site_branding_v_version_program_logo_id_media_id_fk"
        FOREIGN KEY ("version_program_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "site_branding_program_logo_idx"
      ON "site_branding" USING btree ("program_logo_id");
    CREATE INDEX IF NOT EXISTS "site_branding__status_idx"
      ON "site_branding" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "_site_branding_v_version_program_logo_idx"
      ON "_site_branding_v" USING btree ("version_program_logo_id");
    CREATE INDEX IF NOT EXISTS "_site_branding_v_version__status_idx"
      ON "_site_branding_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_site_branding_v_created_at_idx"
      ON "_site_branding_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_site_branding_v_updated_at_idx"
      ON "_site_branding_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_site_branding_v_latest_idx"
      ON "_site_branding_v" USING btree ("latest");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "site_branding"
      DROP CONSTRAINT IF EXISTS "site_branding_program_logo_id_media_id_fk";
    ALTER TABLE IF EXISTS "_site_branding_v"
      DROP CONSTRAINT IF EXISTS "_site_branding_v_version_program_logo_id_media_id_fk";

    DROP INDEX IF EXISTS "site_branding_program_logo_idx";
    DROP INDEX IF EXISTS "site_branding__status_idx";
    DROP INDEX IF EXISTS "_site_branding_v_version_program_logo_idx";
    DROP INDEX IF EXISTS "_site_branding_v_version__status_idx";
    DROP INDEX IF EXISTS "_site_branding_v_created_at_idx";
    DROP INDEX IF EXISTS "_site_branding_v_updated_at_idx";
    DROP INDEX IF EXISTS "_site_branding_v_latest_idx";

    ALTER TABLE IF EXISTS "footer"
      DROP COLUMN IF EXISTS "bottom_nsf_compliance_enabled",
      DROP COLUMN IF EXISTS "bottom_nsf_compliance_funding_acknowledgment",
      DROP COLUMN IF EXISTS "bottom_nsf_compliance_disclaimer";

    ALTER TABLE IF EXISTS "_footer_v"
      DROP COLUMN IF EXISTS "version_bottom_nsf_compliance_enabled",
      DROP COLUMN IF EXISTS "version_bottom_nsf_compliance_funding_acknowledgment",
      DROP COLUMN IF EXISTS "version_bottom_nsf_compliance_disclaimer";

    DROP TABLE IF EXISTS "_site_branding_v" CASCADE;
    DROP TABLE IF EXISTS "site_branding" CASCADE;

    DROP TYPE IF EXISTS "public"."enum__site_branding_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_site_branding_status";
  `)
}
