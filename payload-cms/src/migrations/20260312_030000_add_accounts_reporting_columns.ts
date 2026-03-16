import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "accounts"
      ADD COLUMN IF NOT EXISTS "participant_type" varchar,
      ADD COLUMN IF NOT EXISTS "project_role" varchar,
      ADD COLUMN IF NOT EXISTS "organization_id" integer,
      ADD COLUMN IF NOT EXISTS "organization_name" varchar,
      ADD COLUMN IF NOT EXISTS "contribution_summary" varchar,
      ADD COLUMN IF NOT EXISTS "participation_start_date" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "participation_end_date" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "first_gen_college_student" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "transfer_student" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "include_in_rppr" boolean DEFAULT true;

    DO $$ BEGIN
      ALTER TABLE "accounts"
        ADD CONSTRAINT "accounts_organization_fk"
        FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "accounts_participant_type_idx" ON "accounts" USING btree ("participant_type");
    CREATE INDEX IF NOT EXISTS "accounts_project_role_idx" ON "accounts" USING btree ("project_role");
    CREATE INDEX IF NOT EXISTS "accounts_organization_id_idx" ON "accounts" USING btree ("organization_id");
    CREATE INDEX IF NOT EXISTS "accounts_organization_name_idx" ON "accounts" USING btree ("organization_name");
    CREATE INDEX IF NOT EXISTS "accounts_participation_start_date_idx"
      ON "accounts" USING btree ("participation_start_date");
    CREATE INDEX IF NOT EXISTS "accounts_participation_end_date_idx"
      ON "accounts" USING btree ("participation_end_date");
    CREATE INDEX IF NOT EXISTS "accounts_first_gen_college_student_idx"
      ON "accounts" USING btree ("first_gen_college_student");
    CREATE INDEX IF NOT EXISTS "accounts_transfer_student_idx"
      ON "accounts" USING btree ("transfer_student");
    CREATE INDEX IF NOT EXISTS "accounts_include_in_rppr_idx"
      ON "accounts" USING btree ("include_in_rppr");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "accounts" DROP CONSTRAINT IF EXISTS "accounts_organization_fk";

    DROP INDEX IF EXISTS "accounts_participant_type_idx";
    DROP INDEX IF EXISTS "accounts_project_role_idx";
    DROP INDEX IF EXISTS "accounts_organization_id_idx";
    DROP INDEX IF EXISTS "accounts_organization_name_idx";
    DROP INDEX IF EXISTS "accounts_participation_start_date_idx";
    DROP INDEX IF EXISTS "accounts_participation_end_date_idx";
    DROP INDEX IF EXISTS "accounts_first_gen_college_student_idx";
    DROP INDEX IF EXISTS "accounts_transfer_student_idx";
    DROP INDEX IF EXISTS "accounts_include_in_rppr_idx";

    ALTER TABLE IF EXISTS "accounts"
      DROP COLUMN IF EXISTS "participant_type",
      DROP COLUMN IF EXISTS "project_role",
      DROP COLUMN IF EXISTS "organization_id",
      DROP COLUMN IF EXISTS "organization_name",
      DROP COLUMN IF EXISTS "contribution_summary",
      DROP COLUMN IF EXISTS "participation_start_date",
      DROP COLUMN IF EXISTS "participation_end_date",
      DROP COLUMN IF EXISTS "first_gen_college_student",
      DROP COLUMN IF EXISTS "transfer_student",
      DROP COLUMN IF EXISTS "include_in_rppr";
  `)
}
