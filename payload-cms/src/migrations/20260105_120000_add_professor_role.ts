import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
      BEGIN
        ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'professor';
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
  END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  -- No-op: removing enum values is destructive and not supported safely.
  `)
}
