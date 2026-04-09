import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "problem_attempts"
      ADD COLUMN IF NOT EXISTS "attempt_number" numeric,
      ADD COLUMN IF NOT EXISTS "attempt_scope_key" varchar;

    CREATE UNIQUE INDEX IF NOT EXISTS "problem_attempts_attempt_scope_key_idx"
      ON "problem_attempts" USING btree ("attempt_scope_key");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "problem_attempts_attempt_scope_key_idx";

    ALTER TABLE IF EXISTS "problem_attempts"
      DROP COLUMN IF EXISTS "attempt_scope_key",
      DROP COLUMN IF EXISTS "attempt_number";
  `)
}
