import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "accounts"
      ADD COLUMN IF NOT EXISTS "notification_preferences_question_answered" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "notification_preferences_new_content" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "notification_preferences_announcement" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "notification_preferences_quiz_deadline" boolean DEFAULT true;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "accounts"
      DROP COLUMN IF EXISTS "notification_preferences_question_answered",
      DROP COLUMN IF EXISTS "notification_preferences_new_content",
      DROP COLUMN IF EXISTS "notification_preferences_announcement",
      DROP COLUMN IF EXISTS "notification_preferences_quiz_deadline";
  `)
}
