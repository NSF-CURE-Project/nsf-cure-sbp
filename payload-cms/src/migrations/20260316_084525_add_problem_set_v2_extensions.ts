import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_problems_parts_part_type" AS ENUM('numeric', 'symbolic', 'fbd-draw');
  CREATE TYPE "public"."enum_problems_parts_scoring_mode" AS ENUM('threshold', 'linear-decay', 'stepped');
  CREATE TYPE "public"."enum_problems_result_plots_plot_type" AS ENUM('shear', 'moment', 'deflection', 'custom');
  CREATE TYPE "public"."enum__problems_v_version_parts_part_type" AS ENUM('numeric', 'symbolic', 'fbd-draw');
  CREATE TYPE "public"."enum__problems_v_version_parts_scoring_mode" AS ENUM('threshold', 'linear-decay', 'stepped');
  CREATE TYPE "public"."enum__problems_v_version_result_plots_plot_type" AS ENUM('shear', 'moment', 'deflection', 'custom');
  CREATE TABLE "lessons_blocks_problem_set_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"problem_set_id" integer,
  	"title" varchar,
  	"show_title" boolean DEFAULT true,
  	"max_attempts" numeric,
  	"show_answers" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lessons_v_blocks_problem_set_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"problem_set_id" integer,
  	"title" varchar,
  	"show_title" boolean DEFAULT true,
  	"max_attempts" numeric,
  	"show_answers" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "problems_parts_scoring_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"error_bound" numeric,
  	"score" numeric
  );
  
  CREATE TABLE "problems_parts_symbolic_variables" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variable" varchar,
  	"test_min" numeric DEFAULT 1,
  	"test_max" numeric DEFAULT 10
  );
  
  CREATE TABLE "problems_parts_fbd_rubric_required_forces" (
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
  
  CREATE TABLE "problems_result_plots_segments" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"x_start" varchar,
  	"x_end" varchar,
  	"formula" varchar
  );
  
  CREATE TABLE "problems_result_plots_critical_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"x" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "problems_result_plots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"plot_type" "enum_problems_result_plots_plot_type" DEFAULT 'shear',
  	"title" varchar,
  	"x_label" varchar DEFAULT 'x (m)',
  	"y_label" varchar,
  	"x_min" numeric DEFAULT 0,
  	"x_max" varchar
  );
  
  CREATE TABLE "_problems_v_version_parts_scoring_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"error_bound" numeric,
  	"score" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_problems_v_version_parts_symbolic_variables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variable" varchar,
  	"test_min" numeric DEFAULT 1,
  	"test_max" numeric DEFAULT 10,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_problems_v_version_parts_fbd_rubric_required_forces" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"label" varchar,
  	"correct_angle" numeric DEFAULT 0,
  	"angle_tolerance" numeric DEFAULT 5,
  	"magnitude_required" boolean DEFAULT false,
  	"correct_magnitude" numeric,
  	"magnitude_tolerance" numeric DEFAULT 0.05
  );
  
  CREATE TABLE "_problems_v_version_result_plots_segments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"x_start" varchar,
  	"x_end" varchar,
  	"formula" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_problems_v_version_result_plots_critical_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"x" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_problems_v_version_result_plots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"plot_type" "enum__problems_v_version_result_plots_plot_type" DEFAULT 'shear',
  	"title" varchar,
  	"x_label" varchar DEFAULT 'x (m)',
  	"y_label" varchar,
  	"x_min" numeric DEFAULT 0,
  	"x_max" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "problems_parts" ADD COLUMN "part_type" "enum_problems_parts_part_type" DEFAULT 'numeric';
  ALTER TABLE "problems_parts" ADD COLUMN "scoring_mode" "enum_problems_parts_scoring_mode" DEFAULT 'threshold';
  ALTER TABLE "problems_parts" ADD COLUMN "symbolic_answer" varchar;
  ALTER TABLE "problems_parts" ADD COLUMN "symbolic_tolerance" numeric DEFAULT 0.000001;
  ALTER TABLE "problems_parts" ADD COLUMN "fbd_rubric_forbidden_forces" numeric DEFAULT 0;
  ALTER TABLE "_problems_v_version_parts" ADD COLUMN "part_type" "enum__problems_v_version_parts_part_type" DEFAULT 'numeric';
  ALTER TABLE "_problems_v_version_parts" ADD COLUMN "scoring_mode" "enum__problems_v_version_parts_scoring_mode" DEFAULT 'threshold';
  ALTER TABLE "_problems_v_version_parts" ADD COLUMN "symbolic_answer" varchar;
  ALTER TABLE "_problems_v_version_parts" ADD COLUMN "symbolic_tolerance" numeric DEFAULT 0.000001;
  ALTER TABLE "_problems_v_version_parts" ADD COLUMN "fbd_rubric_forbidden_forces" numeric DEFAULT 0;
  ALTER TABLE "problem_attempts_answers_parts" ADD COLUMN "student_expression" varchar;
  ALTER TABLE "problem_attempts_answers_parts" ADD COLUMN "placed_forces" jsonb;
  ALTER TABLE "lessons_blocks_problem_set_block" ADD CONSTRAINT "lessons_blocks_problem_set_block_problem_set_id_problem_sets_id_fk" FOREIGN KEY ("problem_set_id") REFERENCES "public"."problem_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_blocks_problem_set_block" ADD CONSTRAINT "lessons_blocks_problem_set_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_problem_set_block" ADD CONSTRAINT "_lessons_v_blocks_problem_set_block_problem_set_id_problem_sets_id_fk" FOREIGN KEY ("problem_set_id") REFERENCES "public"."problem_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v_blocks_problem_set_block" ADD CONSTRAINT "_lessons_v_blocks_problem_set_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problems_parts_scoring_steps" ADD CONSTRAINT "problems_parts_scoring_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."problems_parts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problems_parts_symbolic_variables" ADD CONSTRAINT "problems_parts_symbolic_variables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."problems_parts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problems_parts_fbd_rubric_required_forces" ADD CONSTRAINT "problems_parts_fbd_rubric_required_forces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."problems_parts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problems_result_plots_segments" ADD CONSTRAINT "problems_result_plots_segments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."problems_result_plots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problems_result_plots_critical_points" ADD CONSTRAINT "problems_result_plots_critical_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."problems_result_plots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "problems_result_plots" ADD CONSTRAINT "problems_result_plots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problems_v_version_parts_scoring_steps" ADD CONSTRAINT "_problems_v_version_parts_scoring_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_problems_v_version_parts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problems_v_version_parts_symbolic_variables" ADD CONSTRAINT "_problems_v_version_parts_symbolic_variables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_problems_v_version_parts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problems_v_version_parts_fbd_rubric_required_forces" ADD CONSTRAINT "_problems_v_version_parts_fbd_rubric_required_forces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_problems_v_version_parts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problems_v_version_result_plots_segments" ADD CONSTRAINT "_problems_v_version_result_plots_segments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_problems_v_version_result_plots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problems_v_version_result_plots_critical_points" ADD CONSTRAINT "_problems_v_version_result_plots_critical_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_problems_v_version_result_plots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_problems_v_version_result_plots" ADD CONSTRAINT "_problems_v_version_result_plots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_problems_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lessons_blocks_problem_set_block_order_idx" ON "lessons_blocks_problem_set_block" USING btree ("_order");
  CREATE INDEX "lessons_blocks_problem_set_block_parent_id_idx" ON "lessons_blocks_problem_set_block" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_problem_set_block_path_idx" ON "lessons_blocks_problem_set_block" USING btree ("_path");
  CREATE INDEX "lessons_blocks_problem_set_block_problem_set_idx" ON "lessons_blocks_problem_set_block" USING btree ("problem_set_id");
  CREATE INDEX "_lessons_v_blocks_problem_set_block_order_idx" ON "_lessons_v_blocks_problem_set_block" USING btree ("_order");
  CREATE INDEX "_lessons_v_blocks_problem_set_block_parent_id_idx" ON "_lessons_v_blocks_problem_set_block" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_blocks_problem_set_block_path_idx" ON "_lessons_v_blocks_problem_set_block" USING btree ("_path");
  CREATE INDEX "_lessons_v_blocks_problem_set_block_problem_set_idx" ON "_lessons_v_blocks_problem_set_block" USING btree ("problem_set_id");
  CREATE INDEX "problems_parts_scoring_steps_order_idx" ON "problems_parts_scoring_steps" USING btree ("_order");
  CREATE INDEX "problems_parts_scoring_steps_parent_id_idx" ON "problems_parts_scoring_steps" USING btree ("_parent_id");
  CREATE INDEX "problems_parts_symbolic_variables_order_idx" ON "problems_parts_symbolic_variables" USING btree ("_order");
  CREATE INDEX "problems_parts_symbolic_variables_parent_id_idx" ON "problems_parts_symbolic_variables" USING btree ("_parent_id");
  CREATE INDEX "problems_parts_fbd_rubric_required_forces_order_idx" ON "problems_parts_fbd_rubric_required_forces" USING btree ("_order");
  CREATE INDEX "problems_parts_fbd_rubric_required_forces_parent_id_idx" ON "problems_parts_fbd_rubric_required_forces" USING btree ("_parent_id");
  CREATE INDEX "problems_result_plots_segments_order_idx" ON "problems_result_plots_segments" USING btree ("_order");
  CREATE INDEX "problems_result_plots_segments_parent_id_idx" ON "problems_result_plots_segments" USING btree ("_parent_id");
  CREATE INDEX "problems_result_plots_critical_points_order_idx" ON "problems_result_plots_critical_points" USING btree ("_order");
  CREATE INDEX "problems_result_plots_critical_points_parent_id_idx" ON "problems_result_plots_critical_points" USING btree ("_parent_id");
  CREATE INDEX "problems_result_plots_order_idx" ON "problems_result_plots" USING btree ("_order");
  CREATE INDEX "problems_result_plots_parent_id_idx" ON "problems_result_plots" USING btree ("_parent_id");
  CREATE INDEX "_problems_v_version_parts_scoring_steps_order_idx" ON "_problems_v_version_parts_scoring_steps" USING btree ("_order");
  CREATE INDEX "_problems_v_version_parts_scoring_steps_parent_id_idx" ON "_problems_v_version_parts_scoring_steps" USING btree ("_parent_id");
  CREATE INDEX "_problems_v_version_parts_symbolic_variables_order_idx" ON "_problems_v_version_parts_symbolic_variables" USING btree ("_order");
  CREATE INDEX "_problems_v_version_parts_symbolic_variables_parent_id_idx" ON "_problems_v_version_parts_symbolic_variables" USING btree ("_parent_id");
  CREATE INDEX "_problems_v_version_parts_fbd_rubric_required_forces_order_idx" ON "_problems_v_version_parts_fbd_rubric_required_forces" USING btree ("_order");
  CREATE INDEX "_problems_v_version_parts_fbd_rubric_required_forces_parent_id_idx" ON "_problems_v_version_parts_fbd_rubric_required_forces" USING btree ("_parent_id");
  CREATE INDEX "_problems_v_version_result_plots_segments_order_idx" ON "_problems_v_version_result_plots_segments" USING btree ("_order");
  CREATE INDEX "_problems_v_version_result_plots_segments_parent_id_idx" ON "_problems_v_version_result_plots_segments" USING btree ("_parent_id");
  CREATE INDEX "_problems_v_version_result_plots_critical_points_order_idx" ON "_problems_v_version_result_plots_critical_points" USING btree ("_order");
  CREATE INDEX "_problems_v_version_result_plots_critical_points_parent_id_idx" ON "_problems_v_version_result_plots_critical_points" USING btree ("_parent_id");
  CREATE INDEX "_problems_v_version_result_plots_order_idx" ON "_problems_v_version_result_plots" USING btree ("_order");
  CREATE INDEX "_problems_v_version_result_plots_parent_id_idx" ON "_problems_v_version_result_plots" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lessons_blocks_problem_set_block" CASCADE;
  DROP TABLE "_lessons_v_blocks_problem_set_block" CASCADE;
  DROP TABLE "problems_parts_scoring_steps" CASCADE;
  DROP TABLE "problems_parts_symbolic_variables" CASCADE;
  DROP TABLE "problems_parts_fbd_rubric_required_forces" CASCADE;
  DROP TABLE "problems_result_plots_segments" CASCADE;
  DROP TABLE "problems_result_plots_critical_points" CASCADE;
  DROP TABLE "problems_result_plots" CASCADE;
  DROP TABLE "_problems_v_version_parts_scoring_steps" CASCADE;
  DROP TABLE "_problems_v_version_parts_symbolic_variables" CASCADE;
  DROP TABLE "_problems_v_version_parts_fbd_rubric_required_forces" CASCADE;
  DROP TABLE "_problems_v_version_result_plots_segments" CASCADE;
  DROP TABLE "_problems_v_version_result_plots_critical_points" CASCADE;
  DROP TABLE "_problems_v_version_result_plots" CASCADE;
  ALTER TABLE "problems_parts" DROP COLUMN "part_type";
  ALTER TABLE "problems_parts" DROP COLUMN "scoring_mode";
  ALTER TABLE "problems_parts" DROP COLUMN "symbolic_answer";
  ALTER TABLE "problems_parts" DROP COLUMN "symbolic_tolerance";
  ALTER TABLE "problems_parts" DROP COLUMN "fbd_rubric_forbidden_forces";
  ALTER TABLE "_problems_v_version_parts" DROP COLUMN "part_type";
  ALTER TABLE "_problems_v_version_parts" DROP COLUMN "scoring_mode";
  ALTER TABLE "_problems_v_version_parts" DROP COLUMN "symbolic_answer";
  ALTER TABLE "_problems_v_version_parts" DROP COLUMN "symbolic_tolerance";
  ALTER TABLE "_problems_v_version_parts" DROP COLUMN "fbd_rubric_forbidden_forces";
  ALTER TABLE "problem_attempts_answers_parts" DROP COLUMN "student_expression";
  ALTER TABLE "problem_attempts_answers_parts" DROP COLUMN "placed_forces";
  DROP TYPE "public"."enum_problems_parts_part_type";
  DROP TYPE "public"."enum_problems_parts_scoring_mode";
  DROP TYPE "public"."enum_problems_result_plots_plot_type";
  DROP TYPE "public"."enum__problems_v_version_parts_part_type";
  DROP TYPE "public"."enum__problems_v_version_parts_scoring_mode";
  DROP TYPE "public"."enum__problems_v_version_result_plots_plot_type";`)
}
