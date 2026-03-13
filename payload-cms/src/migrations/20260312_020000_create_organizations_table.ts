import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum_organizations_organization_type" AS ENUM('academic', 'industry', 'nonprofit', 'government', 'school_district', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "organizations" (
      "id" serial PRIMARY KEY NOT NULL,
      "organization_name" varchar NOT NULL,
      "organization_type" "enum_organizations_organization_type",
      "partner_role" varchar,
      "contribution_summary" varchar,
      "contact_name" varchar,
      "contact_email" varchar,
      "website" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "organizations_organization_name_idx"
      ON "organizations" USING btree ("organization_name");
    CREATE INDEX IF NOT EXISTS "organizations_organization_type_idx"
      ON "organizations" USING btree ("organization_type");
    CREATE INDEX IF NOT EXISTS "organizations_updated_at_idx"
      ON "organizations" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "organizations_created_at_idx"
      ON "organizations" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "organizations_organization_name_idx";
    DROP INDEX IF EXISTS "organizations_organization_type_idx";
    DROP INDEX IF EXISTS "organizations_updated_at_idx";
    DROP INDEX IF EXISTS "organizations_created_at_idx";

    DROP TABLE IF EXISTS "organizations" CASCADE;

    DO $$ BEGIN
      DROP TYPE "public"."enum_organizations_organization_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
  `)
}
