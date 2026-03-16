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

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk"
        FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_reporting_periods_fk"
        FOREIGN KEY ("reporting_periods_id") REFERENCES "public"."reporting_periods"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_rppr_reports_fk"
        FOREIGN KEY ("rppr_reports_id") REFERENCES "public"."rppr_reports"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_reporting_snapshots_fk"
        FOREIGN KEY ("reporting_snapshots_id") REFERENCES "public"."reporting_snapshots"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_reporting_audit_events_fk"
        FOREIGN KEY ("reporting_audit_events_id") REFERENCES "public"."reporting_audit_events"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_reporting_saved_views_fk"
        FOREIGN KEY ("reporting_saved_views_id") REFERENCES "public"."reporting_saved_views"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_reporting_evidence_links_fk"
        FOREIGN KEY ("reporting_evidence_links_id") REFERENCES "public"."reporting_evidence_links"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_organizations_fk"
        FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_reporting_periods_fk"
        FOREIGN KEY ("reporting_periods_id") REFERENCES "public"."reporting_periods"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_rppr_reports_fk"
        FOREIGN KEY ("rppr_reports_id") REFERENCES "public"."rppr_reports"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_reporting_snapshots_fk"
        FOREIGN KEY ("reporting_snapshots_id") REFERENCES "public"."reporting_snapshots"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_reporting_audit_events_fk"
        FOREIGN KEY ("reporting_audit_events_id") REFERENCES "public"."reporting_audit_events"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_reporting_saved_views_fk"
        FOREIGN KEY ("reporting_saved_views_id") REFERENCES "public"."reporting_saved_views"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_reporting_evidence_links_fk"
        FOREIGN KEY ("reporting_evidence_links_id") REFERENCES "public"."reporting_evidence_links"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

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
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_organizations_fk";
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reporting_periods_fk";
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_rppr_reports_fk";
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reporting_snapshots_fk";
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reporting_audit_events_fk";
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reporting_saved_views_fk";
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reporting_evidence_links_fk";

    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_organizations_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_reporting_periods_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_rppr_reports_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_reporting_snapshots_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_reporting_audit_events_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_reporting_saved_views_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_reporting_evidence_links_fk";

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
