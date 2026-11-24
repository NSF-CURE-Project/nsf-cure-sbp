import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "practice_attempts"
      ALTER COLUMN "lesson_id" DROP NOT NULL;

    CREATE INDEX IF NOT EXISTS "practice_attempts_problem_id_idx"
      ON "practice_attempts" ("problem_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "practice_attempts" WHERE "lesson_id" IS NULL;

    DROP INDEX IF EXISTS "practice_attempts_problem_id_idx";

    ALTER TABLE "practice_attempts"
      ALTER COLUMN "lesson_id" SET NOT NULL;
  `)
}
