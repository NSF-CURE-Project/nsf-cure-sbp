import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "questions"
      ADD COLUMN IF NOT EXISTS "classroom_id" integer;

    DO $$ BEGIN
      ALTER TABLE "questions"
        ADD CONSTRAINT "questions_classroom_id_classrooms_id_fk"
        FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "questions_classroom_idx"
      ON "questions" USING btree ("classroom_id");

    UPDATE "questions" q
    SET "classroom_id" = matched."classroom_id"
    FROM (
      SELECT DISTINCT ON (q_inner."id")
        q_inner."id" AS "question_id",
        cm."classroom_id" AS "classroom_id"
      FROM "questions" q_inner
      JOIN "classroom_memberships" cm
        ON cm."student_id" = q_inner."user_id"
      JOIN "classrooms" c
        ON c."id" = cm."classroom_id"
      WHERE q_inner."class_id" = c."class_id"
      ORDER BY
        q_inner."id",
        cm."joined_at" DESC NULLS LAST,
        cm."created_at" DESC NULLS LAST,
        cm."classroom_id" DESC
    ) matched
    WHERE q."id" = matched."question_id"
      AND q."classroom_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "questions_classroom_idx";

    ALTER TABLE IF EXISTS "questions"
      DROP CONSTRAINT IF EXISTS "questions_classroom_id_classrooms_id_fk";

    ALTER TABLE IF EXISTS "questions"
      DROP COLUMN IF EXISTS "classroom_id";
  `)
}
