import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

// Retire the Problems / ProblemSets / ProblemAttempts assessment feature.
// Quizzes are now the only assessment type; the entire problem-set surface
// was removed from the codebase in the same commit that lands this
// migration. This script drops every table, column, and enum the feature
// created so we don't leave orphaned schema behind.
//
// Drop order matters: child tables and FK-pointing tables go first, then
// the parents. We use IF EXISTS + CASCADE liberally because:
//   1. The schema is large enough that mid-migration failures need to be
//      restart-safe.
//   2. CASCADE catches any FK we missed in the explicit list (e.g.
//      future migrations adding a back-ref).
//   3. Different prod databases may have partially-applied subsets of the
//      original create migrations, so being defensive avoids surprises.
//
// This is a one-way migration. The data is gone.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- 1. Lesson-block reverse tables (problem_set_block lived inside the
    --    lessons.blocks structure; Payload generates per-block-type tables).
    DROP TABLE IF EXISTS "lessons_blocks_problem_set_block" CASCADE;
    DROP TABLE IF EXISTS "_lessons_v_blocks_problem_set_block" CASCADE;

    -- 2. payload_locked_documents_rels cleanup — drop columns + indexes
    --    + FK constraints in one shot.
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_problems_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_problem_sets_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_problem_attempts_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_problems_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_problem_sets_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_problem_attempts_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "problems_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "problem_sets_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "problem_attempts_id";

    -- 3. Problem attempts (children first, then parent).
    DROP TABLE IF EXISTS "problem_attempts_answers_parts" CASCADE;
    DROP TABLE IF EXISTS "problem_attempts_answers" CASCADE;
    DROP TABLE IF EXISTS "problem_attempts" CASCADE;

    -- 4. Problem sets (versioned shadow first, then live).
    DROP TABLE IF EXISTS "_problem_sets_v_rels" CASCADE;
    DROP TABLE IF EXISTS "_problem_sets_v" CASCADE;
    DROP TABLE IF EXISTS "problem_sets_rels" CASCADE;
    DROP TABLE IF EXISTS "problem_sets" CASCADE;

    -- 5. Problem sub-tables (live + versioned).
    DROP TABLE IF EXISTS "problems_parts_scoring_steps" CASCADE;
    DROP TABLE IF EXISTS "problems_parts_symbolic_variables" CASCADE;
    DROP TABLE IF EXISTS "problems_parts_fbd_rubric_required_forces" CASCADE;
    DROP TABLE IF EXISTS "problems_result_plots_segments" CASCADE;
    DROP TABLE IF EXISTS "problems_result_plots_critical_points" CASCADE;
    DROP TABLE IF EXISTS "problems_result_plots" CASCADE;
    DROP TABLE IF EXISTS "problems_parts" CASCADE;
    DROP TABLE IF EXISTS "problems_parameter_definitions" CASCADE;
    DROP TABLE IF EXISTS "problems_derived_values" CASCADE;
    DROP TABLE IF EXISTS "problems_texts" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_version_parts_scoring_steps" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_version_parts_symbolic_variables" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_version_parts_fbd_rubric_required_forces" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_version_result_plots_segments" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_version_result_plots_critical_points" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_version_result_plots" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_version_parts" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_version_parameter_definitions" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_version_derived_values" CASCADE;
    DROP TABLE IF EXISTS "_problems_v_texts" CASCADE;
    DROP TABLE IF EXISTS "_problems_v" CASCADE;
    DROP TABLE IF EXISTS "problems" CASCADE;

    -- 6. Enum types used only by these tables.
    DROP TYPE IF EXISTS "public"."enum_problems_parts_tolerance_type";
    DROP TYPE IF EXISTS "public"."enum_problems_parts_part_type";
    DROP TYPE IF EXISTS "public"."enum_problems_parts_scoring_mode";
    DROP TYPE IF EXISTS "public"."enum_problems_result_plots_plot_type";
    DROP TYPE IF EXISTS "public"."enum_problems_difficulty";
    DROP TYPE IF EXISTS "public"."enum_problems_status";
    DROP TYPE IF EXISTS "public"."enum__problems_v_version_parts_tolerance_type";
    DROP TYPE IF EXISTS "public"."enum__problems_v_version_parts_part_type";
    DROP TYPE IF EXISTS "public"."enum__problems_v_version_parts_scoring_mode";
    DROP TYPE IF EXISTS "public"."enum__problems_v_version_result_plots_plot_type";
    DROP TYPE IF EXISTS "public"."enum__problems_v_version_difficulty";
    DROP TYPE IF EXISTS "public"."enum__problems_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_problem_sets_status";
    DROP TYPE IF EXISTS "public"."enum__problem_sets_v_version_status";
  `)
}

// No-op down: bringing this back is a fresh creation migration.
export async function down(_args: MigrateDownArgs): Promise<void> {
  return
}
