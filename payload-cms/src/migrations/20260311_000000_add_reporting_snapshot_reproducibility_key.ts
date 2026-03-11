import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "reporting_snapshots"
      ADD COLUMN IF NOT EXISTS "reproducibility_key" varchar;

    CREATE INDEX IF NOT EXISTS "reporting_snapshots_reproducibility_key_idx"
      ON "reporting_snapshots" USING btree ("reproducibility_key");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "reporting_snapshots_reproducibility_key_idx";

    ALTER TABLE IF EXISTS "reporting_snapshots"
      DROP COLUMN IF EXISTS "reproducibility_key";
  `)
}
