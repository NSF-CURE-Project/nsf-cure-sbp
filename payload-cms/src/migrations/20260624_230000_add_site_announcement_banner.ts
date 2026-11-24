import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "site_branding"
      ADD COLUMN IF NOT EXISTS "announcement_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "announcement_message" varchar,
      ADD COLUMN IF NOT EXISTS "announcement_href" varchar,
      ADD COLUMN IF NOT EXISTS "announcement_link_label" varchar DEFAULT 'Learn more';

    ALTER TABLE IF EXISTS "_site_branding_v"
      ADD COLUMN IF NOT EXISTS "version_announcement_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "version_announcement_message" varchar,
      ADD COLUMN IF NOT EXISTS "version_announcement_href" varchar,
      ADD COLUMN IF NOT EXISTS "version_announcement_link_label" varchar DEFAULT 'Learn more';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "_site_branding_v"
      DROP COLUMN IF EXISTS "version_announcement_link_label",
      DROP COLUMN IF EXISTS "version_announcement_href",
      DROP COLUMN IF EXISTS "version_announcement_message",
      DROP COLUMN IF EXISTS "version_announcement_enabled";

    ALTER TABLE IF EXISTS "site_branding"
      DROP COLUMN IF EXISTS "announcement_link_label",
      DROP COLUMN IF EXISTS "announcement_href",
      DROP COLUMN IF EXISTS "announcement_message",
      DROP COLUMN IF EXISTS "announcement_enabled";
  `)
}
