import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "lessons_blocks_quiz_block"
      ADD COLUMN IF NOT EXISTS "show_answers" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "max_attempts" numeric,
      ADD COLUMN IF NOT EXISTS "time_limit_sec" numeric;

    ALTER TABLE IF EXISTS "_lessons_v_blocks_quiz_block"
      ADD COLUMN IF NOT EXISTS "show_answers" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "max_attempts" numeric,
      ADD COLUMN IF NOT EXISTS "time_limit_sec" numeric;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "lessons_blocks_quiz_block"
      DROP COLUMN IF EXISTS "time_limit_sec",
      DROP COLUMN IF EXISTS "max_attempts",
      DROP COLUMN IF EXISTS "show_answers";

    ALTER TABLE IF EXISTS "_lessons_v_blocks_quiz_block"
      DROP COLUMN IF EXISTS "time_limit_sec",
      DROP COLUMN IF EXISTS "max_attempts",
      DROP COLUMN IF EXISTS "show_answers";
  `)
}
