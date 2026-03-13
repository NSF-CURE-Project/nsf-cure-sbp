import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "admin_help"
      ADD COLUMN IF NOT EXISTS "subtitle" varchar,
      ADD COLUMN IF NOT EXISTS "quick_actions" jsonb,
      ADD COLUMN IF NOT EXISTS "topic_chips" jsonb,
      ADD COLUMN IF NOT EXISTS "faqs" jsonb,
      ADD COLUMN IF NOT EXISTS "support_email" varchar,
      ADD COLUMN IF NOT EXISTS "support_response_target" varchar,
      ADD COLUMN IF NOT EXISTS "support_request_href" varchar,
      ADD COLUMN IF NOT EXISTS "resources" jsonb;

    ALTER TABLE IF EXISTS "_admin_help_v"
      ADD COLUMN IF NOT EXISTS "version_subtitle" varchar,
      ADD COLUMN IF NOT EXISTS "version_quick_actions" jsonb,
      ADD COLUMN IF NOT EXISTS "version_topic_chips" jsonb,
      ADD COLUMN IF NOT EXISTS "version_faqs" jsonb,
      ADD COLUMN IF NOT EXISTS "version_support_email" varchar,
      ADD COLUMN IF NOT EXISTS "version_support_response_target" varchar,
      ADD COLUMN IF NOT EXISTS "version_support_request_href" varchar,
      ADD COLUMN IF NOT EXISTS "version_resources" jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "admin_help"
      DROP COLUMN IF EXISTS "subtitle",
      DROP COLUMN IF EXISTS "quick_actions",
      DROP COLUMN IF EXISTS "topic_chips",
      DROP COLUMN IF EXISTS "faqs",
      DROP COLUMN IF EXISTS "support_email",
      DROP COLUMN IF EXISTS "support_response_target",
      DROP COLUMN IF EXISTS "support_request_href",
      DROP COLUMN IF EXISTS "resources";

    ALTER TABLE IF EXISTS "_admin_help_v"
      DROP COLUMN IF EXISTS "version_subtitle",
      DROP COLUMN IF EXISTS "version_quick_actions",
      DROP COLUMN IF EXISTS "version_topic_chips",
      DROP COLUMN IF EXISTS "version_faqs",
      DROP COLUMN IF EXISTS "version_support_email",
      DROP COLUMN IF EXISTS "version_support_response_target",
      DROP COLUMN IF EXISTS "version_support_request_href",
      DROP COLUMN IF EXISTS "version_resources";
  `)
}
