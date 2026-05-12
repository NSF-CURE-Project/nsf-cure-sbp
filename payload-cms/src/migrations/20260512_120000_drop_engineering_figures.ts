import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

// Drop the engineering-figures collection. Confirmed orphaned: no public
// renderer references it, no live collection field relates to it (the
// problems.figure_id column was left behind from an old schema but is
// stripped on the public path via `sanitizeProblem`), and the React
// components in web/ that could render figures are never imported.
//
// Order matters here:
//   1. drop FK constraints from problems + _problems_v
//   2. drop the figure_id / version_figure_id columns from problems
//   3. drop the FK + column on payload_locked_documents_rels
//   4. drop the engineering_figures table itself
//   5. drop the enum type
// Each step uses IF EXISTS so the migration is safe to re-run on databases
// where the previous attempt partially landed (or where the column was
// already dropped by a manual cleanup).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- 1. Detach problems.figure_id from engineering_figures
    ALTER TABLE "problems" DROP CONSTRAINT IF EXISTS "problems_figure_id_engineering_figures_id_fk";
    ALTER TABLE "_problems_v" DROP CONSTRAINT IF EXISTS "_problems_v_version_figure_id_engineering_figures_id_fk";

    -- 2. Drop the now-orphaned columns
    ALTER TABLE "problems" DROP COLUMN IF EXISTS "figure_id";
    ALTER TABLE "_problems_v" DROP COLUMN IF EXISTS "version_figure_id";

    -- 3. payload_locked_documents_rels reverse-rel
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_engineering_figures_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_engineering_figures_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "engineering_figures_id";

    -- 4. Indexes on the table being dropped (be explicit; some Postgres
    --    versions complain about leftover indexes pointing at a missing
    --    table, though DROP TABLE CASCADE would handle it too)
    DROP INDEX IF EXISTS "engineering_figures_updated_at_idx";
    DROP INDEX IF EXISTS "engineering_figures_created_at_idx";
    DROP TABLE IF EXISTS "engineering_figures" CASCADE;

    -- 5. Enum was only used by engineering_figures.type
    DROP TYPE IF EXISTS "public"."enum_engineering_figures_type";
  `)
}

// No-op down: restoring the table is non-trivial (we'd have to recreate the
// column FK + the locked-documents reverse-rel) and the data is gone. This
// migration is intentionally one-way; a future "add engineering figures
// back" feature would be a fresh creation migration.
export async function down(_args: MigrateDownArgs): Promise<void> {
  return
}
