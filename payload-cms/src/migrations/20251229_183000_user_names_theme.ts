import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_admin_theme') THEN
      CREATE TYPE "public"."enum_users_admin_theme" AS ENUM ('light', 'dark');
    END IF;
  END $$;

  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "admin_theme" "enum_users_admin_theme" DEFAULT 'light';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "users" DROP COLUMN IF EXISTS "admin_theme";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "last_name";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "first_name";
  DROP TYPE IF EXISTS "public"."enum_users_admin_theme";
  `)
}
