import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "pages_blocks_resources_list_resources"
      ADD COLUMN IF NOT EXISTS "link_label" varchar;
    ALTER TABLE IF EXISTS "_pages_v_blocks_resources_list_resources"
      ADD COLUMN IF NOT EXISTS "link_label" varchar;
    ALTER TABLE IF EXISTS "lessons_blocks_resources_list_resources"
      ADD COLUMN IF NOT EXISTS "link_label" varchar;
    ALTER TABLE IF EXISTS "_lessons_v_blocks_resources_list_resources"
      ADD COLUMN IF NOT EXISTS "link_label" varchar;
    ALTER TABLE IF EXISTS "classes_blocks_resources_list_resources"
      ADD COLUMN IF NOT EXISTS "link_label" varchar;
    ALTER TABLE IF EXISTS "_classes_v_blocks_resources_list_resources"
      ADD COLUMN IF NOT EXISTS "link_label" varchar;
    ALTER TABLE IF EXISTS "chapters_blocks_resources_list_resources"
      ADD COLUMN IF NOT EXISTS "link_label" varchar;
    ALTER TABLE IF EXISTS "_chapters_v_blocks_resources_list_resources"
      ADD COLUMN IF NOT EXISTS "link_label" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "_chapters_v_blocks_resources_list_resources"
      DROP COLUMN IF EXISTS "link_label";
    ALTER TABLE IF EXISTS "chapters_blocks_resources_list_resources"
      DROP COLUMN IF EXISTS "link_label";
    ALTER TABLE IF EXISTS "_classes_v_blocks_resources_list_resources"
      DROP COLUMN IF EXISTS "link_label";
    ALTER TABLE IF EXISTS "classes_blocks_resources_list_resources"
      DROP COLUMN IF EXISTS "link_label";
    ALTER TABLE IF EXISTS "_lessons_v_blocks_resources_list_resources"
      DROP COLUMN IF EXISTS "link_label";
    ALTER TABLE IF EXISTS "lessons_blocks_resources_list_resources"
      DROP COLUMN IF EXISTS "link_label";
    ALTER TABLE IF EXISTS "_pages_v_blocks_resources_list_resources"
      DROP COLUMN IF EXISTS "link_label";
    ALTER TABLE IF EXISTS "pages_blocks_resources_list_resources"
      DROP COLUMN IF EXISTS "link_label";
  `)
}
