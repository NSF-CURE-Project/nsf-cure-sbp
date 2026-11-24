import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

// Adds the `hidden` field to the Pages collection so admins can pull a page
// (including a main-nav page like Resources or Contact Us) off the public
// site without deleting it. Hidden pages are filtered out of the navbar and
// 404 on direct URL access; admins still see them in /admin/pages.
//
// Mirrored on `_pages_v` as `version_hidden` because Pages has versioning
// enabled — drafts/published versions each carry their own visibility flag.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "pages"
      ADD COLUMN IF NOT EXISTS "hidden" boolean DEFAULT false;
    ALTER TABLE IF EXISTS "_pages_v"
      ADD COLUMN IF NOT EXISTS "version_hidden" boolean DEFAULT false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "pages" DROP COLUMN IF EXISTS "hidden";
    ALTER TABLE IF EXISTS "_pages_v" DROP COLUMN IF EXISTS "version_hidden";
  `)
}
