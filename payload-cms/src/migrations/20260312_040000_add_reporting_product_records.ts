import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_reporting_product_records_product_type" AS ENUM(
        'publication',
        'patent',
        'dataset',
        'software',
        'educational_material',
        'other'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "reporting_product_records" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "product_type" "enum_reporting_product_records_product_type" NOT NULL,
      "citation" varchar,
      "identifier" varchar,
      "url" varchar,
      "reporting_period_id" integer,
      "linked_rppr_report_id" integer,
      "reported_at" timestamp(3) with time zone,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "reporting_product_records_rels" (
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

    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "reporting_product_records_id" integer;
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      ADD COLUMN IF NOT EXISTS "reporting_product_records_id" integer;

    DO $$ BEGIN
      ALTER TABLE "reporting_product_records"
        ADD CONSTRAINT "reporting_product_records_reporting_period_fk"
        FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_product_records"
        ADD CONSTRAINT "reporting_product_records_rppr_report_fk"
        FOREIGN KEY ("linked_rppr_report_id") REFERENCES "public"."rppr_reports"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_reporting_product_records_fk"
        FOREIGN KEY ("reporting_product_records_id") REFERENCES "public"."reporting_product_records"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels"
        ADD CONSTRAINT "payload_preferences_rels_reporting_product_records_fk"
        FOREIGN KEY ("reporting_product_records_id") REFERENCES "public"."reporting_product_records"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "reporting_product_records_rels"
        ADD CONSTRAINT "reporting_product_records_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."reporting_product_records"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_product_records_rels"
        ADD CONSTRAINT "reporting_product_records_rels_classes_fk"
        FOREIGN KEY ("classes_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_product_records_rels"
        ADD CONSTRAINT "reporting_product_records_rels_lessons_fk"
        FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_product_records_rels"
        ADD CONSTRAINT "reporting_product_records_rels_quizzes_fk"
        FOREIGN KEY ("quizzes_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_product_records_rels"
        ADD CONSTRAINT "reporting_product_records_rels_pages_fk"
        FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "reporting_product_records_rels"
        ADD CONSTRAINT "reporting_product_records_rels_quiz_questions_fk"
        FOREIGN KEY ("quiz_questions_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "reporting_product_records_product_type_idx"
      ON "reporting_product_records" USING btree ("product_type");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_reporting_period_id_idx"
      ON "reporting_product_records" USING btree ("reporting_period_id");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_linked_rppr_report_id_idx"
      ON "reporting_product_records" USING btree ("linked_rppr_report_id");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_reported_at_idx"
      ON "reporting_product_records" USING btree ("reported_at");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_updated_at_idx"
      ON "reporting_product_records" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_created_at_idx"
      ON "reporting_product_records" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "reporting_product_records_rels_order_idx"
      ON "reporting_product_records_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_rels_parent_idx"
      ON "reporting_product_records_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_rels_path_idx"
      ON "reporting_product_records_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_rels_classes_idx"
      ON "reporting_product_records_rels" USING btree ("classes_id");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_rels_lessons_idx"
      ON "reporting_product_records_rels" USING btree ("lessons_id");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_rels_quizzes_idx"
      ON "reporting_product_records_rels" USING btree ("quizzes_id");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_rels_pages_idx"
      ON "reporting_product_records_rels" USING btree ("pages_id");
    CREATE INDEX IF NOT EXISTS "reporting_product_records_rels_quiz_questions_idx"
      ON "reporting_product_records_rels" USING btree ("quiz_questions_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reporting_product_records_id_idx"
      ON "payload_locked_documents_rels" USING btree ("reporting_product_records_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_reporting_product_records_id_idx"
      ON "payload_preferences_rels" USING btree ("reporting_product_records_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reporting_product_records_fk";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP CONSTRAINT IF EXISTS "payload_preferences_rels_reporting_product_records_fk";
    ALTER TABLE IF EXISTS "reporting_product_records"
      DROP CONSTRAINT IF EXISTS "reporting_product_records_reporting_period_fk";
    ALTER TABLE IF EXISTS "reporting_product_records"
      DROP CONSTRAINT IF EXISTS "reporting_product_records_rppr_report_fk";
    ALTER TABLE IF EXISTS "reporting_product_records_rels"
      DROP CONSTRAINT IF EXISTS "reporting_product_records_rels_parent_fk";
    ALTER TABLE IF EXISTS "reporting_product_records_rels"
      DROP CONSTRAINT IF EXISTS "reporting_product_records_rels_classes_fk";
    ALTER TABLE IF EXISTS "reporting_product_records_rels"
      DROP CONSTRAINT IF EXISTS "reporting_product_records_rels_lessons_fk";
    ALTER TABLE IF EXISTS "reporting_product_records_rels"
      DROP CONSTRAINT IF EXISTS "reporting_product_records_rels_quizzes_fk";
    ALTER TABLE IF EXISTS "reporting_product_records_rels"
      DROP CONSTRAINT IF EXISTS "reporting_product_records_rels_pages_fk";
    ALTER TABLE IF EXISTS "reporting_product_records_rels"
      DROP CONSTRAINT IF EXISTS "reporting_product_records_rels_quiz_questions_fk";

    DROP INDEX IF EXISTS "reporting_product_records_product_type_idx";
    DROP INDEX IF EXISTS "reporting_product_records_reporting_period_id_idx";
    DROP INDEX IF EXISTS "reporting_product_records_linked_rppr_report_id_idx";
    DROP INDEX IF EXISTS "reporting_product_records_reported_at_idx";
    DROP INDEX IF EXISTS "reporting_product_records_updated_at_idx";
    DROP INDEX IF EXISTS "reporting_product_records_created_at_idx";

    DROP INDEX IF EXISTS "reporting_product_records_rels_order_idx";
    DROP INDEX IF EXISTS "reporting_product_records_rels_parent_idx";
    DROP INDEX IF EXISTS "reporting_product_records_rels_path_idx";
    DROP INDEX IF EXISTS "reporting_product_records_rels_classes_idx";
    DROP INDEX IF EXISTS "reporting_product_records_rels_lessons_idx";
    DROP INDEX IF EXISTS "reporting_product_records_rels_quizzes_idx";
    DROP INDEX IF EXISTS "reporting_product_records_rels_pages_idx";
    DROP INDEX IF EXISTS "reporting_product_records_rels_quiz_questions_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_reporting_product_records_id_idx";
    DROP INDEX IF EXISTS "payload_preferences_rels_reporting_product_records_id_idx";

    DROP TABLE IF EXISTS "reporting_product_records_rels" CASCADE;
    DROP TABLE IF EXISTS "reporting_product_records" CASCADE;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "reporting_product_records_id";
    ALTER TABLE IF EXISTS "payload_preferences_rels"
      DROP COLUMN IF EXISTS "reporting_product_records_id";

    DO $$ BEGIN
      DROP TYPE "public"."enum_reporting_product_records_product_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;
  `)
}
