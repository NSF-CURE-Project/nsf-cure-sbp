import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "engineering_figures"
      ADD COLUMN IF NOT EXISTS "is_template" boolean DEFAULT false;

    CREATE INDEX IF NOT EXISTS "engineering_figures_is_template_idx"
      ON "engineering_figures" USING btree ("is_template");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "engineering_figures_is_template_idx";

    ALTER TABLE IF EXISTS "engineering_figures"
      DROP COLUMN IF EXISTS "is_template";
  `)
}

