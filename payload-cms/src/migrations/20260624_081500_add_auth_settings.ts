import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "auth_settings" (
      "id" serial PRIMARY KEY NOT NULL,
      "student_login_enabled" boolean DEFAULT true,
      "student_login_disabled_message" varchar DEFAULT 'Student account access is temporarily unavailable. Please check back later.',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    INSERT INTO "auth_settings" (
      "id",
      "student_login_enabled",
      "student_login_disabled_message",
      "updated_at",
      "created_at"
    )
    VALUES (
      1,
      true,
      'Student account access is temporarily unavailable. Please check back later.',
      now(),
      now()
    )
    ON CONFLICT ("id") DO NOTHING;

    SELECT setval(
      pg_get_serial_sequence('auth_settings', 'id'),
      GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "auth_settings"), 1),
      true
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "auth_settings" CASCADE;
  `)
}
