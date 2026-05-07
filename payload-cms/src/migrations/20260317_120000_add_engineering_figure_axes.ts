import { sql } from '@payloadcms/db-postgres'

export async function up(): Promise<void> {
  await sql`
    ALTER TABLE IF EXISTS "engineering_figures"
      ADD COLUMN IF NOT EXISTS "axes_show" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "axes_x" integer,
      ADD COLUMN IF NOT EXISTS "axes_y" integer,
      ADD COLUMN IF NOT EXISTS "axes_length" integer,
      ADD COLUMN IF NOT EXISTS "axes_x_label" varchar,
      ADD COLUMN IF NOT EXISTS "axes_y_label" varchar;
  `
}

export async function down(): Promise<void> {
  await sql`
    ALTER TABLE IF EXISTS "engineering_figures"
      DROP COLUMN IF EXISTS "axes_show",
      DROP COLUMN IF EXISTS "axes_x",
      DROP COLUMN IF EXISTS "axes_y",
      DROP COLUMN IF EXISTS "axes_length",
      DROP COLUMN IF EXISTS "axes_x_label",
      DROP COLUMN IF EXISTS "axes_y_label";
  `
}
