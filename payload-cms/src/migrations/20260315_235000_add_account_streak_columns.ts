import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "accounts"
      ADD COLUMN IF NOT EXISTS "current_streak" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "longest_streak" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "last_streak_date" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "accounts"
      DROP COLUMN IF EXISTS "current_streak",
      DROP COLUMN IF EXISTS "longest_streak",
      DROP COLUMN IF EXISTS "last_streak_date";
  `)
}
