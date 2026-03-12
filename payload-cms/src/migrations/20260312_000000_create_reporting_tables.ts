import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum_reporting_periods_report_type" AS ENUM('annual', 'final', 'internal', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_reporting_periods_status" AS ENUM('draft', 'active', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_rppr_reports_report_type" AS ENUM('annual', 'final', 'internal', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_reporting_snapshots_report_type" AS ENUM('annual', 'final', 'internal', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_reporting_audit_events_event_type" AS ENUM('report_generated', 'snapshot_created', 'snapshot_reused', 'export_generated', 'drilldown_viewed', 'saved_view_created'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_reporting_audit_events_report_type" AS ENUM('annual', 'final', 'internal', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_reporting_saved_views_report_type" AS ENUM('annual', 'final', 'internal', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_reporting_evidence_links_evidence_type" AS ENUM('curriculum_change', 'intervention', 'product_resource', 'publication', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_reporting_evidence_links_rppr_section" AS ENUM('accomplishments', 'products', 'participantsOrganizations', 'impact', 'changesProblems', 'specialRequirements'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "reporting_periods" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "budget_period_name" varchar,
      "report_type" "enum_reporting_periods_report_type" DEFAULT 'annual' NOT NULL,
      "start_date" timestamp(3) with time zone NOT NULL,
      "end_date" timestamp(3) with time zone NOT NULL,
      "status" "enum_reporting_periods_status" DEFAULT 'draft',
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "rppr_reports" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "reporting_period_id" integer,
      "report_type" "enum_rppr_reports_report_type" DEFAULT 'annual' NOT NULL,
      "start_date" timestamp(3) with time zone NOT NULL,
      "end_date" timestamp(3) with time zone NOT NULL,
      "accomplishments_narrative" varchar,
      "products_narrative" varchar,
      "impact_narrative" varchar,
      "changes_problems_narrative" varchar,
      "special_requirements_narrative" varchar,
      "report_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "rppr_reports_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );

    CREATE TABLE IF NOT EXISTS "reporting_snapshots" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "report_type" "enum_reporting_snapshots_report_type" DEFAULT 'custom' NOT NULL,
      "reporting_period_id" integer,
      "period_start" timestamp(3) with time zone NOT NULL,
      "period_end" timestamp(3) with time zone NOT NULL,
      "filter_scope" jsonb NOT NULL,
      "metric_payload" jsonb NOT NULL,
      "rppr_payload" jsonb,
      "data_quality_payload" jsonb,
      "anomalies_payload" jsonb,
      "narrative_drafts" jsonb,
      "snapshot_hash" varchar NOT NULL,
      "reproducibility_key" varchar NOT NULL,
      "version_label" varchar NOT NULL,
      "created_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "reporting_audit_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "event_type" "enum_reporting_audit_events_event_type" NOT NULL,
      "report_type" "enum_reporting_audit_events_report_type",
      "reporting_period_id" integer,
      "period_start" timestamp(3) with time zone,
      "period_end" timestamp(3) with time zone,
      "filters" jsonb,
      "export_type" varchar,
      "export_format" varchar,
      "metric_key" varchar,
      "snapshot_id" integer,
      "notes" varchar,
      "created_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "reporting_saved_views" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "owner_id" integer NOT NULL,
      "is_shared" boolean DEFAULT false,
      "report_type" "enum_reporting_saved_views_report_type" DEFAULT 'custom',
      "reporting_period_id" integer,
      "start_date" timestamp(3) with time zone,
      "end_date" timestamp(3) with time zone,
      "filters" jsonb NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "reporting_saved_views_metric_keys" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "metric_key" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "reporting_evidence_links" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "evidence_type" "enum_reporting_evidence_links_evidence_type" NOT NULL,
      "rppr_section" "enum_reporting_evidence_links_rppr_section" NOT NULL,
      "summary" varchar,
      "impact_note" varchar,
      "reporting_period_id" integer,
      "linked_snapshot_id" integer,
      "linked_rppr_report_id" integer,
      "occurred_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "reporting_evidence_links_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "classes_id" integer,
      "lessons_id" integer,
      "quizzes_id" integer,
      "pages_id" integer,
      "quiz_questions_id" integer
    );

    DO $$ BEGIN
      ALTER TABLE "rppr_reports"
        ADD CONSTRAINT "rppr_reports_reporting_period_fk"
        FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "rppr_reports_rels"
        ADD CONSTRAINT "rppr_reports_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."rppr_reports"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "rppr_reports_rels"
        ADD CONSTRAINT "rppr_reports_rels_media_fk"
        FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "reporting_snapshots"
        ADD CONSTRAINT "reporting_snapshots_reporting_period_fk"
        FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_snapshots"
        ADD CONSTRAINT "reporting_snapshots_created_by_fk"
        FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "reporting_audit_events"
        ADD CONSTRAINT "reporting_audit_events_reporting_period_fk"
        FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_audit_events"
        ADD CONSTRAINT "reporting_audit_events_snapshot_fk"
        FOREIGN KEY ("snapshot_id") REFERENCES "public"."reporting_snapshots"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_audit_events"
        ADD CONSTRAINT "reporting_audit_events_created_by_fk"
        FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "reporting_saved_views"
        ADD CONSTRAINT "reporting_saved_views_owner_fk"
        FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_saved_views"
        ADD CONSTRAINT "reporting_saved_views_reporting_period_fk"
        FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "reporting_saved_views_metric_keys"
        ADD CONSTRAINT "reporting_saved_views_metric_keys_parent_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."reporting_saved_views"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "reporting_evidence_links"
        ADD CONSTRAINT "reporting_evidence_links_reporting_period_fk"
        FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_evidence_links"
        ADD CONSTRAINT "reporting_evidence_links_snapshot_fk"
        FOREIGN KEY ("linked_snapshot_id") REFERENCES "public"."reporting_snapshots"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_evidence_links"
        ADD CONSTRAINT "reporting_evidence_links_rppr_report_fk"
        FOREIGN KEY ("linked_rppr_report_id") REFERENCES "public"."rppr_reports"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "reporting_evidence_links_rels"
        ADD CONSTRAINT "reporting_evidence_links_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."reporting_evidence_links"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_evidence_links_rels"
        ADD CONSTRAINT "reporting_evidence_links_rels_classes_fk"
        FOREIGN KEY ("classes_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_evidence_links_rels"
        ADD CONSTRAINT "reporting_evidence_links_rels_lessons_fk"
        FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_evidence_links_rels"
        ADD CONSTRAINT "reporting_evidence_links_rels_quizzes_fk"
        FOREIGN KEY ("quizzes_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_evidence_links_rels"
        ADD CONSTRAINT "reporting_evidence_links_rels_pages_fk"
        FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_evidence_links_rels"
        ADD CONSTRAINT "reporting_evidence_links_rels_quiz_questions_fk"
        FOREIGN KEY ("quiz_questions_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "reporting_periods_report_type_idx" ON "reporting_periods" USING btree ("report_type");
    CREATE INDEX IF NOT EXISTS "reporting_periods_status_idx" ON "reporting_periods" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "reporting_periods_updated_at_idx" ON "reporting_periods" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "reporting_periods_created_at_idx" ON "reporting_periods" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "rppr_reports_reporting_period_id_idx" ON "rppr_reports" USING btree ("reporting_period_id");
    CREATE INDEX IF NOT EXISTS "rppr_reports_report_type_idx" ON "rppr_reports" USING btree ("report_type");
    CREATE INDEX IF NOT EXISTS "rppr_reports_updated_at_idx" ON "rppr_reports" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "rppr_reports_created_at_idx" ON "rppr_reports" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "rppr_reports_rels_order_idx" ON "rppr_reports_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "rppr_reports_rels_parent_idx" ON "rppr_reports_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "rppr_reports_rels_path_idx" ON "rppr_reports_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "rppr_reports_rels_media_idx" ON "rppr_reports_rels" USING btree ("media_id");

    CREATE INDEX IF NOT EXISTS "reporting_snapshots_reporting_period_id_idx" ON "reporting_snapshots" USING btree ("reporting_period_id");
    CREATE INDEX IF NOT EXISTS "reporting_snapshots_created_by_id_idx" ON "reporting_snapshots" USING btree ("created_by_id");
    CREATE INDEX IF NOT EXISTS "reporting_snapshots_report_type_idx" ON "reporting_snapshots" USING btree ("report_type");
    CREATE INDEX IF NOT EXISTS "reporting_snapshots_snapshot_hash_idx" ON "reporting_snapshots" USING btree ("snapshot_hash");
    CREATE INDEX IF NOT EXISTS "reporting_snapshots_reproducibility_key_idx" ON "reporting_snapshots" USING btree ("reproducibility_key");
    CREATE INDEX IF NOT EXISTS "reporting_snapshots_updated_at_idx" ON "reporting_snapshots" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "reporting_snapshots_created_at_idx" ON "reporting_snapshots" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "reporting_audit_events_event_type_idx" ON "reporting_audit_events" USING btree ("event_type");
    CREATE INDEX IF NOT EXISTS "reporting_audit_events_report_type_idx" ON "reporting_audit_events" USING btree ("report_type");
    CREATE INDEX IF NOT EXISTS "reporting_audit_events_reporting_period_id_idx" ON "reporting_audit_events" USING btree ("reporting_period_id");
    CREATE INDEX IF NOT EXISTS "reporting_audit_events_snapshot_id_idx" ON "reporting_audit_events" USING btree ("snapshot_id");
    CREATE INDEX IF NOT EXISTS "reporting_audit_events_created_by_id_idx" ON "reporting_audit_events" USING btree ("created_by_id");
    CREATE INDEX IF NOT EXISTS "reporting_audit_events_created_at_idx" ON "reporting_audit_events" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "reporting_saved_views_owner_id_idx" ON "reporting_saved_views" USING btree ("owner_id");
    CREATE INDEX IF NOT EXISTS "reporting_saved_views_reporting_period_id_idx" ON "reporting_saved_views" USING btree ("reporting_period_id");
    CREATE INDEX IF NOT EXISTS "reporting_saved_views_report_type_idx" ON "reporting_saved_views" USING btree ("report_type");
    CREATE INDEX IF NOT EXISTS "reporting_saved_views_updated_at_idx" ON "reporting_saved_views" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "reporting_saved_views_created_at_idx" ON "reporting_saved_views" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "reporting_saved_views_metric_keys_order_idx" ON "reporting_saved_views_metric_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "reporting_saved_views_metric_keys_parent_idx" ON "reporting_saved_views_metric_keys" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_reporting_period_id_idx" ON "reporting_evidence_links" USING btree ("reporting_period_id");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_linked_snapshot_id_idx" ON "reporting_evidence_links" USING btree ("linked_snapshot_id");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_linked_rppr_report_id_idx" ON "reporting_evidence_links" USING btree ("linked_rppr_report_id");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_evidence_type_idx" ON "reporting_evidence_links" USING btree ("evidence_type");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_rppr_section_idx" ON "reporting_evidence_links" USING btree ("rppr_section");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_updated_at_idx" ON "reporting_evidence_links" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_created_at_idx" ON "reporting_evidence_links" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_rels_order_idx" ON "reporting_evidence_links_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_rels_parent_idx" ON "reporting_evidence_links_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_rels_path_idx" ON "reporting_evidence_links_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_rels_classes_idx" ON "reporting_evidence_links_rels" USING btree ("classes_id");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_rels_lessons_idx" ON "reporting_evidence_links_rels" USING btree ("lessons_id");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_rels_quizzes_idx" ON "reporting_evidence_links_rels" USING btree ("quizzes_id");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_rels_pages_idx" ON "reporting_evidence_links_rels" USING btree ("pages_id");
    CREATE INDEX IF NOT EXISTS "reporting_evidence_links_rels_quiz_questions_idx" ON "reporting_evidence_links_rels" USING btree ("quiz_questions_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "rppr_reports" DROP CONSTRAINT IF EXISTS "rppr_reports_reporting_period_fk";
    ALTER TABLE IF EXISTS "rppr_reports_rels" DROP CONSTRAINT IF EXISTS "rppr_reports_rels_parent_fk";
    ALTER TABLE IF EXISTS "rppr_reports_rels" DROP CONSTRAINT IF EXISTS "rppr_reports_rels_media_fk";
    ALTER TABLE IF EXISTS "reporting_snapshots" DROP CONSTRAINT IF EXISTS "reporting_snapshots_reporting_period_fk";
    ALTER TABLE IF EXISTS "reporting_snapshots" DROP CONSTRAINT IF EXISTS "reporting_snapshots_created_by_fk";
    ALTER TABLE IF EXISTS "reporting_audit_events" DROP CONSTRAINT IF EXISTS "reporting_audit_events_reporting_period_fk";
    ALTER TABLE IF EXISTS "reporting_audit_events" DROP CONSTRAINT IF EXISTS "reporting_audit_events_snapshot_fk";
    ALTER TABLE IF EXISTS "reporting_audit_events" DROP CONSTRAINT IF EXISTS "reporting_audit_events_created_by_fk";
    ALTER TABLE IF EXISTS "reporting_saved_views" DROP CONSTRAINT IF EXISTS "reporting_saved_views_owner_fk";
    ALTER TABLE IF EXISTS "reporting_saved_views" DROP CONSTRAINT IF EXISTS "reporting_saved_views_reporting_period_fk";
    ALTER TABLE IF EXISTS "reporting_saved_views_metric_keys" DROP CONSTRAINT IF EXISTS "reporting_saved_views_metric_keys_parent_fk";
    ALTER TABLE IF EXISTS "reporting_evidence_links" DROP CONSTRAINT IF EXISTS "reporting_evidence_links_reporting_period_fk";
    ALTER TABLE IF EXISTS "reporting_evidence_links" DROP CONSTRAINT IF EXISTS "reporting_evidence_links_snapshot_fk";
    ALTER TABLE IF EXISTS "reporting_evidence_links" DROP CONSTRAINT IF EXISTS "reporting_evidence_links_rppr_report_fk";
    ALTER TABLE IF EXISTS "reporting_evidence_links_rels" DROP CONSTRAINT IF EXISTS "reporting_evidence_links_rels_parent_fk";
    ALTER TABLE IF EXISTS "reporting_evidence_links_rels" DROP CONSTRAINT IF EXISTS "reporting_evidence_links_rels_classes_fk";
    ALTER TABLE IF EXISTS "reporting_evidence_links_rels" DROP CONSTRAINT IF EXISTS "reporting_evidence_links_rels_lessons_fk";
    ALTER TABLE IF EXISTS "reporting_evidence_links_rels" DROP CONSTRAINT IF EXISTS "reporting_evidence_links_rels_quizzes_fk";
    ALTER TABLE IF EXISTS "reporting_evidence_links_rels" DROP CONSTRAINT IF EXISTS "reporting_evidence_links_rels_pages_fk";
    ALTER TABLE IF EXISTS "reporting_evidence_links_rels" DROP CONSTRAINT IF EXISTS "reporting_evidence_links_rels_quiz_questions_fk";

    DROP INDEX IF EXISTS "reporting_periods_report_type_idx";
    DROP INDEX IF EXISTS "reporting_periods_status_idx";
    DROP INDEX IF EXISTS "reporting_periods_updated_at_idx";
    DROP INDEX IF EXISTS "reporting_periods_created_at_idx";
    DROP INDEX IF EXISTS "rppr_reports_reporting_period_id_idx";
    DROP INDEX IF EXISTS "rppr_reports_report_type_idx";
    DROP INDEX IF EXISTS "rppr_reports_updated_at_idx";
    DROP INDEX IF EXISTS "rppr_reports_created_at_idx";
    DROP INDEX IF EXISTS "rppr_reports_rels_order_idx";
    DROP INDEX IF EXISTS "rppr_reports_rels_parent_idx";
    DROP INDEX IF EXISTS "rppr_reports_rels_path_idx";
    DROP INDEX IF EXISTS "rppr_reports_rels_media_idx";
    DROP INDEX IF EXISTS "reporting_snapshots_reporting_period_id_idx";
    DROP INDEX IF EXISTS "reporting_snapshots_created_by_id_idx";
    DROP INDEX IF EXISTS "reporting_snapshots_report_type_idx";
    DROP INDEX IF EXISTS "reporting_snapshots_snapshot_hash_idx";
    DROP INDEX IF EXISTS "reporting_snapshots_reproducibility_key_idx";
    DROP INDEX IF EXISTS "reporting_snapshots_updated_at_idx";
    DROP INDEX IF EXISTS "reporting_snapshots_created_at_idx";
    DROP INDEX IF EXISTS "reporting_audit_events_event_type_idx";
    DROP INDEX IF EXISTS "reporting_audit_events_report_type_idx";
    DROP INDEX IF EXISTS "reporting_audit_events_reporting_period_id_idx";
    DROP INDEX IF EXISTS "reporting_audit_events_snapshot_id_idx";
    DROP INDEX IF EXISTS "reporting_audit_events_created_by_id_idx";
    DROP INDEX IF EXISTS "reporting_audit_events_created_at_idx";
    DROP INDEX IF EXISTS "reporting_saved_views_owner_id_idx";
    DROP INDEX IF EXISTS "reporting_saved_views_reporting_period_id_idx";
    DROP INDEX IF EXISTS "reporting_saved_views_report_type_idx";
    DROP INDEX IF EXISTS "reporting_saved_views_updated_at_idx";
    DROP INDEX IF EXISTS "reporting_saved_views_created_at_idx";
    DROP INDEX IF EXISTS "reporting_saved_views_metric_keys_order_idx";
    DROP INDEX IF EXISTS "reporting_saved_views_metric_keys_parent_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_reporting_period_id_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_linked_snapshot_id_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_linked_rppr_report_id_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_evidence_type_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_rppr_section_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_updated_at_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_created_at_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_rels_order_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_rels_parent_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_rels_path_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_rels_classes_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_rels_lessons_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_rels_quizzes_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_rels_pages_idx";
    DROP INDEX IF EXISTS "reporting_evidence_links_rels_quiz_questions_idx";

    DROP TABLE IF EXISTS "reporting_evidence_links_rels" CASCADE;
    DROP TABLE IF EXISTS "reporting_saved_views_metric_keys" CASCADE;
    DROP TABLE IF EXISTS "rppr_reports_rels" CASCADE;
    DROP TABLE IF EXISTS "reporting_evidence_links" CASCADE;
    DROP TABLE IF EXISTS "reporting_saved_views" CASCADE;
    DROP TABLE IF EXISTS "reporting_audit_events" CASCADE;
    DROP TABLE IF EXISTS "reporting_snapshots" CASCADE;
    DROP TABLE IF EXISTS "rppr_reports" CASCADE;
    DROP TABLE IF EXISTS "reporting_periods" CASCADE;

    DO $$ BEGIN
      DROP TYPE "public"."enum_reporting_evidence_links_rppr_section";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
    DO $$ BEGIN
      DROP TYPE "public"."enum_reporting_evidence_links_evidence_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
    DO $$ BEGIN
      DROP TYPE "public"."enum_reporting_saved_views_report_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
    DO $$ BEGIN
      DROP TYPE "public"."enum_reporting_audit_events_report_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
    DO $$ BEGIN
      DROP TYPE "public"."enum_reporting_audit_events_event_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
    DO $$ BEGIN
      DROP TYPE "public"."enum_reporting_snapshots_report_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
    DO $$ BEGIN
      DROP TYPE "public"."enum_rppr_reports_report_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
    DO $$ BEGIN
      DROP TYPE "public"."enum_reporting_periods_status";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
    DO $$ BEGIN
      DROP TYPE "public"."enum_reporting_periods_report_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
  `)
}
