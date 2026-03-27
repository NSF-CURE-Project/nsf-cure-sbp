import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "engineering_figures"
      ADD COLUMN IF NOT EXISTS "axes_show" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "axes_x" numeric,
      ADD COLUMN IF NOT EXISTS "axes_y" numeric,
      ADD COLUMN IF NOT EXISTS "axes_length" numeric,
      ADD COLUMN IF NOT EXISTS "axes_x_label" varchar,
      ADD COLUMN IF NOT EXISTS "axes_y_label" varchar;

    ALTER TABLE IF EXISTS "_engineering_figures_v"
      ADD COLUMN IF NOT EXISTS "version_axes_show" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "version_axes_x" numeric,
      ADD COLUMN IF NOT EXISTS "version_axes_y" numeric,
      ADD COLUMN IF NOT EXISTS "version_axes_length" numeric,
      ADD COLUMN IF NOT EXISTS "version_axes_x_label" varchar,
      ADD COLUMN IF NOT EXISTS "version_axes_y_label" varchar;

    CREATE TABLE IF NOT EXISTS "req_f" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "correct_angle" numeric DEFAULT 0,
      "angle_tolerance" numeric DEFAULT 5,
      "magnitude_required" boolean DEFAULT false,
      "correct_magnitude" numeric,
      "magnitude_tolerance" numeric DEFAULT 0.05
    );

    CREATE TABLE IF NOT EXISTS "req_m" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "direction" varchar,
      "magnitude_required" boolean DEFAULT false,
      "correct_magnitude" numeric,
      "magnitude_tolerance" numeric DEFAULT 0.05
    );

    CREATE INDEX IF NOT EXISTS "req_f_order_idx" ON "req_f" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "req_f_parent_id_idx" ON "req_f" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "req_m_order_idx" ON "req_m" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "req_m_parent_id_idx" ON "req_m" USING btree ("_parent_id");

    DO $$ BEGIN
      IF to_regclass('public.problems_parts') IS NOT NULL THEN
        ALTER TABLE "req_f"
          ADD CONSTRAINT "req_f_parent_id_fk"
            FOREIGN KEY ("_parent_id") REFERENCES "public"."problems_parts"("id")
            ON DELETE cascade ON UPDATE no action;
      END IF;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      IF to_regclass('public.problems_parts') IS NOT NULL THEN
        ALTER TABLE "req_m"
          ADD CONSTRAINT "req_m_parent_id_fk"
            FOREIGN KEY ("_parent_id") REFERENCES "public"."problems_parts"("id")
            ON DELETE cascade ON UPDATE no action;
      END IF;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      IF to_regclass('public.problems_parts_fbd_rubric_required_forces') IS NOT NULL THEN
        INSERT INTO "req_f" (
          "_order",
          "_parent_id",
          "id",
          "label",
          "correct_angle",
          "angle_tolerance",
          "magnitude_required",
          "correct_magnitude",
          "magnitude_tolerance"
        )
        SELECT
          "_order",
          "_parent_id",
          "id",
          "label",
          "correct_angle",
          "angle_tolerance",
          "magnitude_required",
          "correct_magnitude",
          "magnitude_tolerance"
        FROM "problems_parts_fbd_rubric_required_forces"
        ON CONFLICT ("id") DO NOTHING;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "_req_f" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar,
      "correct_angle" numeric DEFAULT 0,
      "angle_tolerance" numeric DEFAULT 5,
      "magnitude_required" boolean DEFAULT false,
      "correct_magnitude" numeric,
      "magnitude_tolerance" numeric DEFAULT 0.05,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_req_m" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar,
      "direction" varchar,
      "magnitude_required" boolean DEFAULT false,
      "correct_magnitude" numeric,
      "magnitude_tolerance" numeric DEFAULT 0.05,
      "_uuid" varchar
    );

    CREATE INDEX IF NOT EXISTS "_req_f_order_idx" ON "_req_f" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_req_f_parent_id_idx" ON "_req_f" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_req_m_order_idx" ON "_req_m" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_req_m_parent_id_idx" ON "_req_m" USING btree ("_parent_id");

    DO $$ BEGIN
      IF to_regclass('public._problems_v_version_parts') IS NOT NULL THEN
        ALTER TABLE "_req_f"
          ADD CONSTRAINT "_req_f_parent_id_fk"
            FOREIGN KEY ("_parent_id") REFERENCES "public"."_problems_v_version_parts"("id")
            ON DELETE cascade ON UPDATE no action;
      END IF;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      IF to_regclass('public._problems_v_version_parts') IS NOT NULL THEN
        ALTER TABLE "_req_m"
          ADD CONSTRAINT "_req_m_parent_id_fk"
            FOREIGN KEY ("_parent_id") REFERENCES "public"."_problems_v_version_parts"("id")
            ON DELETE cascade ON UPDATE no action;
      END IF;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      IF to_regclass('public._problems_v_version_parts_fbd_rubric_required_forces') IS NOT NULL THEN
        INSERT INTO "_req_f" (
          "_order",
          "_parent_id",
          "label",
          "correct_angle",
          "angle_tolerance",
          "magnitude_required",
          "correct_magnitude",
          "magnitude_tolerance",
          "_uuid"
        )
        SELECT
          "_order",
          "_parent_id",
          "label",
          "correct_angle",
          "angle_tolerance",
          "magnitude_required",
          "correct_magnitude",
          "magnitude_tolerance",
          NULL
        FROM "_problems_v_version_parts_fbd_rubric_required_forces";
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "req_f" DROP CONSTRAINT IF EXISTS "req_f_parent_id_fk";
    ALTER TABLE IF EXISTS "req_m" DROP CONSTRAINT IF EXISTS "req_m_parent_id_fk";
    ALTER TABLE IF EXISTS "_req_f" DROP CONSTRAINT IF EXISTS "_req_f_parent_id_fk";
    ALTER TABLE IF EXISTS "_req_m" DROP CONSTRAINT IF EXISTS "_req_m_parent_id_fk";

    DROP INDEX IF EXISTS "req_f_order_idx";
    DROP INDEX IF EXISTS "req_f_parent_id_idx";
    DROP INDEX IF EXISTS "req_m_order_idx";
    DROP INDEX IF EXISTS "req_m_parent_id_idx";
    DROP INDEX IF EXISTS "_req_f_order_idx";
    DROP INDEX IF EXISTS "_req_f_parent_id_idx";
    DROP INDEX IF EXISTS "_req_m_order_idx";
    DROP INDEX IF EXISTS "_req_m_parent_id_idx";

    DROP TABLE IF EXISTS "req_f";
    DROP TABLE IF EXISTS "req_m";
    DROP TABLE IF EXISTS "_req_f";
    DROP TABLE IF EXISTS "_req_m";

    ALTER TABLE IF EXISTS "engineering_figures"
      DROP COLUMN IF EXISTS "axes_show",
      DROP COLUMN IF EXISTS "axes_x",
      DROP COLUMN IF EXISTS "axes_y",
      DROP COLUMN IF EXISTS "axes_length",
      DROP COLUMN IF EXISTS "axes_x_label",
      DROP COLUMN IF EXISTS "axes_y_label";

    ALTER TABLE IF EXISTS "_engineering_figures_v"
      DROP COLUMN IF EXISTS "version_axes_show",
      DROP COLUMN IF EXISTS "version_axes_x",
      DROP COLUMN IF EXISTS "version_axes_y",
      DROP COLUMN IF EXISTS "version_axes_length",
      DROP COLUMN IF EXISTS "version_axes_x_label",
      DROP COLUMN IF EXISTS "version_axes_y_label";
  `)
}
