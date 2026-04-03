import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "problems_parts"
      ADD COLUMN IF NOT EXISTS "correct_answer_expression" varchar;

    ALTER TABLE IF EXISTS "_problems_v_version_parts"
      ADD COLUMN IF NOT EXISTS "correct_answer_expression" varchar;

    ALTER TABLE IF EXISTS "problem_attempts_answers"
      ADD COLUMN IF NOT EXISTS "variant_seed" varchar,
      ADD COLUMN IF NOT EXISTS "variant_signature" varchar,
      ADD COLUMN IF NOT EXISTS "variant_scope" jsonb,
      ADD COLUMN IF NOT EXISTS "generated_variant" jsonb;

    ALTER TABLE IF EXISTS "_problem_attempts_v_version_answers"
      ADD COLUMN IF NOT EXISTS "variant_seed" varchar,
      ADD COLUMN IF NOT EXISTS "variant_signature" varchar,
      ADD COLUMN IF NOT EXISTS "variant_scope" jsonb,
      ADD COLUMN IF NOT EXISTS "generated_variant" jsonb;

    CREATE TABLE IF NOT EXISTS "problems_parameter_definitions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "label" varchar,
      "unit" varchar,
      "default_value" numeric,
      "min" numeric,
      "max" numeric,
      "step" numeric,
      "precision" numeric
    );

    CREATE INDEX IF NOT EXISTS "problems_parameter_definitions_order_idx"
      ON "problems_parameter_definitions" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "problems_parameter_definitions_parent_id_idx"
      ON "problems_parameter_definitions" USING btree ("_parent_id");

    DO $$ BEGIN
      ALTER TABLE "problems_parameter_definitions"
        ADD CONSTRAINT "problems_parameter_definitions_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."problems"("id")
          ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "problems_derived_values" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "label" varchar,
      "expression" varchar NOT NULL,
      "unit" varchar
    );

    CREATE INDEX IF NOT EXISTS "problems_derived_values_order_idx"
      ON "problems_derived_values" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "problems_derived_values_parent_id_idx"
      ON "problems_derived_values" USING btree ("_parent_id");

    DO $$ BEGIN
      ALTER TABLE "problems_derived_values"
        ADD CONSTRAINT "problems_derived_values_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."problems"("id")
          ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "_problems_v_version_parameter_definitions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "label" varchar,
      "unit" varchar,
      "default_value" numeric,
      "min" numeric,
      "max" numeric,
      "step" numeric,
      "precision" numeric,
      "_uuid" varchar
    );

    CREATE INDEX IF NOT EXISTS "_problems_v_version_parameter_definitions_order_idx"
      ON "_problems_v_version_parameter_definitions" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_problems_v_version_parameter_definitions_parent_id_idx"
      ON "_problems_v_version_parameter_definitions" USING btree ("_parent_id");

    DO $$ BEGIN
      ALTER TABLE "_problems_v_version_parameter_definitions"
        ADD CONSTRAINT "_problems_v_version_parameter_definitions_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."_problems_v"("id")
          ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "_problems_v_version_derived_values" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "label" varchar,
      "expression" varchar NOT NULL,
      "unit" varchar,
      "_uuid" varchar
    );

    CREATE INDEX IF NOT EXISTS "_problems_v_version_derived_values_order_idx"
      ON "_problems_v_version_derived_values" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_problems_v_version_derived_values_parent_id_idx"
      ON "_problems_v_version_derived_values" USING btree ("_parent_id");

    DO $$ BEGIN
      ALTER TABLE "_problems_v_version_derived_values"
        ADD CONSTRAINT "_problems_v_version_derived_values_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."_problems_v"("id")
          ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    ALTER TABLE IF EXISTS "problems"
      ADD COLUMN IF NOT EXISTS "parameterization_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "parameter_seed" varchar DEFAULT 'template-default';

    ALTER TABLE IF EXISTS "_problems_v"
      ADD COLUMN IF NOT EXISTS "version_parameterization_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "version_parameter_seed" varchar DEFAULT 'template-default';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "problems_parameter_definitions"
      DROP CONSTRAINT IF EXISTS "problems_parameter_definitions_parent_id_fk";
    ALTER TABLE IF EXISTS "problems_derived_values"
      DROP CONSTRAINT IF EXISTS "problems_derived_values_parent_id_fk";
    ALTER TABLE IF EXISTS "_problems_v_version_parameter_definitions"
      DROP CONSTRAINT IF EXISTS "_problems_v_version_parameter_definitions_parent_id_fk";
    ALTER TABLE IF EXISTS "_problems_v_version_derived_values"
      DROP CONSTRAINT IF EXISTS "_problems_v_version_derived_values_parent_id_fk";

    DROP INDEX IF EXISTS "problems_parameter_definitions_order_idx";
    DROP INDEX IF EXISTS "problems_parameter_definitions_parent_id_idx";
    DROP INDEX IF EXISTS "problems_derived_values_order_idx";
    DROP INDEX IF EXISTS "problems_derived_values_parent_id_idx";
    DROP INDEX IF EXISTS "_problems_v_version_parameter_definitions_order_idx";
    DROP INDEX IF EXISTS "_problems_v_version_parameter_definitions_parent_id_idx";
    DROP INDEX IF EXISTS "_problems_v_version_derived_values_order_idx";
    DROP INDEX IF EXISTS "_problems_v_version_derived_values_parent_id_idx";

    DROP TABLE IF EXISTS "problems_parameter_definitions";
    DROP TABLE IF EXISTS "problems_derived_values";
    DROP TABLE IF EXISTS "_problems_v_version_parameter_definitions";
    DROP TABLE IF EXISTS "_problems_v_version_derived_values";

    ALTER TABLE IF EXISTS "problem_attempts_answers"
      DROP COLUMN IF EXISTS "variant_seed",
      DROP COLUMN IF EXISTS "variant_signature",
      DROP COLUMN IF EXISTS "variant_scope",
      DROP COLUMN IF EXISTS "generated_variant";

    ALTER TABLE IF EXISTS "_problem_attempts_v_version_answers"
      DROP COLUMN IF EXISTS "variant_seed",
      DROP COLUMN IF EXISTS "variant_signature",
      DROP COLUMN IF EXISTS "variant_scope",
      DROP COLUMN IF EXISTS "generated_variant";

    ALTER TABLE IF EXISTS "problems_parts"
      DROP COLUMN IF EXISTS "correct_answer_expression";

    ALTER TABLE IF EXISTS "_problems_v_version_parts"
      DROP COLUMN IF EXISTS "correct_answer_expression";

    ALTER TABLE IF EXISTS "problems"
      DROP COLUMN IF EXISTS "parameterization_enabled",
      DROP COLUMN IF EXISTS "parameter_seed";

    ALTER TABLE IF EXISTS "_problems_v"
      DROP COLUMN IF EXISTS "version_parameterization_enabled",
      DROP COLUMN IF EXISTS "version_parameter_seed";
  `)
}
