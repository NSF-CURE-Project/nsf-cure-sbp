import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "organizations_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_periods_id" integer,
      ADD COLUMN IF NOT EXISTS "rppr_reports_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_snapshots_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_audit_events_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_saved_views_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_evidence_links_id" integer;

    ALTER TABLE IF EXISTS "payload_preferences_rels"
      ADD COLUMN IF NOT EXISTS "organizations_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_periods_id" integer,
      ADD COLUMN IF NOT EXISTS "rppr_reports_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_snapshots_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_audit_events_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_saved_views_id" integer,
      ADD COLUMN IF NOT EXISTS "reporting_evidence_links_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_organizations_id_idx"
      ON "payload_locked_documents_rels" USING btree ("organizations_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reporting_periods_id_idx"
      ON "payload_locked_documents_rels" USING btree ("reporting_periods_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_rppr_reports_id_idx"
      ON "payload_locked_documents_rels" USING btree ("rppr_reports_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reporting_snapshots_id_idx"
      ON "payload_locked_documents_rels" USING btree ("reporting_snapshots_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reporting_audit_events_id_idx"
      ON "payload_locked_documents_rels" USING btree ("reporting_audit_events_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reporting_saved_views_id_idx"
      ON "payload_locked_documents_rels" USING btree ("reporting_saved_views_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reporting_evidence_links_id_idx"
      ON "payload_locked_documents_rels" USING btree ("reporting_evidence_links_id");

    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_organizations_id_idx"
      ON "payload_preferences_rels" USING btree ("organizations_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_reporting_periods_id_idx"
      ON "payload_preferences_rels" USING btree ("reporting_periods_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_rppr_reports_id_idx"
      ON "payload_preferences_rels" USING btree ("rppr_reports_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_reporting_snapshots_id_idx"
      ON "payload_preferences_rels" USING btree ("reporting_snapshots_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_reporting_audit_events_id_idx"
      ON "payload_preferences_rels" USING btree ("reporting_audit_events_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_reporting_saved_views_id_idx"
      ON "payload_preferences_rels" USING btree ("reporting_saved_views_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_reporting_evidence_links_id_idx"
      ON "payload_preferences_rels" USING btree ("reporting_evidence_links_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_organizations_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_reporting_periods_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_rppr_reports_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_reporting_snapshots_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_reporting_audit_events_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_reporting_saved_views_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_reporting_evidence_links_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_organizations_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_reporting_periods_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_rppr_reports_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_reporting_snapshots_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_reporting_audit_events_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_reporting_saved_views_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_reporting_evidence_links_id_idx";

    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "organizations_id",
      DROP COLUMN IF EXISTS "reporting_periods_id",
      DROP COLUMN IF EXISTS "rppr_reports_id",
      DROP COLUMN IF EXISTS "reporting_snapshots_id",
      DROP COLUMN IF EXISTS "reporting_audit_events_id",
      DROP COLUMN IF EXISTS "reporting_saved_views_id",
      DROP COLUMN IF EXISTS "reporting_evidence_links_id";

    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP COLUMN IF EXISTS "organizations_id",
      DROP COLUMN IF EXISTS "reporting_periods_id",
      DROP COLUMN IF EXISTS "rppr_reports_id",
      DROP COLUMN IF EXISTS "reporting_snapshots_id",
      DROP COLUMN IF EXISTS "reporting_audit_events_id",
      DROP COLUMN IF EXISTS "reporting_saved_views_id",
      DROP COLUMN IF EXISTS "reporting_evidence_links_id";
  `)
}
