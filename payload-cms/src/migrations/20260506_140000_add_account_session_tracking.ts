import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accounts"
     ADD COLUMN IF NOT EXISTS "login_count" integer DEFAULT 0,
     ADD COLUMN IF NOT EXISTS "last_login_at" timestamp(3) with time zone,
     ADD COLUMN IF NOT EXISTS "last_seen_at" timestamp(3) with time zone,
     ADD COLUMN IF NOT EXISTS "total_active_seconds" integer DEFAULT 0;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accounts"
     DROP COLUMN IF EXISTS "login_count",
     DROP COLUMN IF EXISTS "last_login_at",
     DROP COLUMN IF EXISTS "last_seen_at",
     DROP COLUMN IF EXISTS "total_active_seconds";
  `)
}
