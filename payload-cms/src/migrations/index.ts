import * as migration_20251220_024730_add_versions from './20251220_024730_add_versions'
import * as migration_20251220_041833_add_layout_blocks from './20251220_041833_add_layout_blocks'
import * as migration_20251225_182747 from './20251225_182747'
import * as migration_20251228_190000_lesson_feedback_nav_order from './20251228_190000_lesson_feedback_nav_order'
import * as migration_20251229_183000_user_names_theme from './20251229_183000_user_names_theme'
import * as migration_20260105_120000_add_professor_role from './20260105_120000_add_professor_role'
import * as migration_20260212_161835_add_classrooms_and_memberships from './20260212_161835_add_classrooms_and_memberships'
import * as migration_20260212_203500_add_classroom_rel_columns from './20260212_203500_add_classroom_rel_columns'
import * as migration_20260304_000000_add_lesson_bookmarks_rel_columns from './20260304_000000_add_lesson_bookmarks_rel_columns'
import * as migration_20260310_060000_add_site_branding_and_footer_nsf from './20260310_060000_add_site_branding_and_footer_nsf'
import * as migration_20260311_000000_add_reporting_snapshot_reproducibility_key from './20260311_000000_add_reporting_snapshot_reproducibility_key'
import * as migration_20260311_010000_add_reporting_rel_columns from './20260311_010000_add_reporting_rel_columns'
import * as migration_20260312_000000_create_reporting_tables from './20260312_000000_create_reporting_tables'
import * as migration_20260312_010000_repair_reporting_rel_columns from './20260312_010000_repair_reporting_rel_columns'
import * as migration_20260312_020000_create_organizations_table from './20260312_020000_create_organizations_table'
import * as migration_20260312_030000_add_accounts_reporting_columns from './20260312_030000_add_accounts_reporting_columns'
import * as migration_20260312_040000_add_reporting_product_records from './20260312_040000_add_reporting_product_records'
import * as migration_20260312_050000_expand_admin_help_portal from './20260312_050000_expand_admin_help_portal'
import * as migration_20260315_235000_add_account_streak_columns from './20260315_235000_add_account_streak_columns'
import * as migration_20260316_080657_add_problem_set_collections_v1 from './20260316_080657_add_problem_set_collections_v1'
import * as migration_20260316_081500_add_engineering_figure_templates_flag from './20260316_081500_add_engineering_figure_templates_flag'
import * as migration_20260316_084525_add_problem_set_v2_extensions from './20260316_084525_add_problem_set_v2_extensions'
import * as migration_20260316_120000_add_account_notification_preferences from './20260316_120000_add_account_notification_preferences'
import * as migration_20260316_130000_create_api_keys from './20260316_130000_create_api_keys'
import * as migration_20260317_120000_add_engineering_figure_axes from './20260317_120000_add_engineering_figure_axes'
import * as migration_20260325_120000_add_help_topic_structured_fields from './20260325_120000_add_help_topic_structured_fields'
import * as migration_20260327_070000_add_api_keys_locked_rel_column from './20260327_070000_add_api_keys_locked_rel_column'
import * as migration_20260327_130000_repair_problem_schema_drift from './20260327_130000_repair_problem_schema_drift'
import * as migration_20260402_090000_add_problem_templates_runtime from './20260402_090000_add_problem_templates_runtime'
import * as migration_20260408_120000_add_problem_attempt_scope_key from './20260408_120000_add_problem_attempt_scope_key'
import * as migration_20260417_173500_add_lesson_quiz_block_fields from './20260417_173500_add_lesson_quiz_block_fields'
import * as migration_20260417_190000_add_questions_classroom_scope from './20260417_190000_add_questions_classroom_scope'
import * as migration_20260421_120000_add_multi_format_quiz_support from './20260421_120000_add_multi_format_quiz_support'
import * as migration_20260506_120000_add_text_section_block from './20260506_120000_add_text_section_block'
import * as migration_20260506_140000_add_account_session_tracking from './20260506_140000_add_account_session_tracking'
import * as migration_20260506_160000_add_concepts from './20260506_160000_add_concepts'
import * as migration_20260506_180000_add_pre_post_assessments from './20260506_180000_add_pre_post_assessments'

export const migrations = [
  {
    up: migration_20251220_024730_add_versions.up,
    down: migration_20251220_024730_add_versions.down,
    name: '20251220_024730_add_versions',
  },
  {
    up: migration_20251220_041833_add_layout_blocks.up,
    down: migration_20251220_041833_add_layout_blocks.down,
    name: '20251220_041833_add_layout_blocks',
  },
  {
    up: migration_20251225_182747.up,
    down: migration_20251225_182747.down,
    name: '20251225_182747',
  },
  {
    up: migration_20251228_190000_lesson_feedback_nav_order.up,
    down: migration_20251228_190000_lesson_feedback_nav_order.down,
    name: '20251228_190000_lesson_feedback_nav_order',
  },
  {
    up: migration_20251229_183000_user_names_theme.up,
    down: migration_20251229_183000_user_names_theme.down,
    name: '20251229_183000_user_names_theme',
  },
  {
    up: migration_20260105_120000_add_professor_role.up,
    down: migration_20260105_120000_add_professor_role.down,
    name: '20260105_120000_add_professor_role',
  },
  {
    up: migration_20260212_161835_add_classrooms_and_memberships.up,
    down: migration_20260212_161835_add_classrooms_and_memberships.down,
    name: '20260212_161835_add_classrooms_and_memberships',
  },
  {
    up: migration_20260212_203500_add_classroom_rel_columns.up,
    down: migration_20260212_203500_add_classroom_rel_columns.down,
    name: '20260212_203500_add_classroom_rel_columns',
  },
  {
    up: migration_20260304_000000_add_lesson_bookmarks_rel_columns.up,
    down: migration_20260304_000000_add_lesson_bookmarks_rel_columns.down,
    name: '20260304_000000_add_lesson_bookmarks_rel_columns',
  },
  {
    up: migration_20260310_060000_add_site_branding_and_footer_nsf.up,
    down: migration_20260310_060000_add_site_branding_and_footer_nsf.down,
    name: '20260310_060000_add_site_branding_and_footer_nsf',
  },
  {
    up: migration_20260311_000000_add_reporting_snapshot_reproducibility_key.up,
    down: migration_20260311_000000_add_reporting_snapshot_reproducibility_key.down,
    name: '20260311_000000_add_reporting_snapshot_reproducibility_key',
  },
  {
    up: migration_20260311_010000_add_reporting_rel_columns.up,
    down: migration_20260311_010000_add_reporting_rel_columns.down,
    name: '20260311_010000_add_reporting_rel_columns',
  },
  {
    up: migration_20260312_000000_create_reporting_tables.up,
    down: migration_20260312_000000_create_reporting_tables.down,
    name: '20260312_000000_create_reporting_tables',
  },
  {
    up: migration_20260312_010000_repair_reporting_rel_columns.up,
    down: migration_20260312_010000_repair_reporting_rel_columns.down,
    name: '20260312_010000_repair_reporting_rel_columns',
  },
  {
    up: migration_20260312_020000_create_organizations_table.up,
    down: migration_20260312_020000_create_organizations_table.down,
    name: '20260312_020000_create_organizations_table',
  },
  {
    up: migration_20260312_030000_add_accounts_reporting_columns.up,
    down: migration_20260312_030000_add_accounts_reporting_columns.down,
    name: '20260312_030000_add_accounts_reporting_columns',
  },
  {
    up: migration_20260312_040000_add_reporting_product_records.up,
    down: migration_20260312_040000_add_reporting_product_records.down,
    name: '20260312_040000_add_reporting_product_records',
  },
  {
    up: migration_20260312_050000_expand_admin_help_portal.up,
    down: migration_20260312_050000_expand_admin_help_portal.down,
    name: '20260312_050000_expand_admin_help_portal',
  },
  {
    up: migration_20260315_235000_add_account_streak_columns.up,
    down: migration_20260315_235000_add_account_streak_columns.down,
    name: '20260315_235000_add_account_streak_columns',
  },
  {
    up: migration_20260316_080657_add_problem_set_collections_v1.up,
    down: migration_20260316_080657_add_problem_set_collections_v1.down,
    name: '20260316_080657_add_problem_set_collections_v1',
  },
  {
    up: migration_20260316_081500_add_engineering_figure_templates_flag.up,
    down: migration_20260316_081500_add_engineering_figure_templates_flag.down,
    name: '20260316_081500_add_engineering_figure_templates_flag',
  },
  {
    up: migration_20260316_084525_add_problem_set_v2_extensions.up,
    down: migration_20260316_084525_add_problem_set_v2_extensions.down,
    name: '20260316_084525_add_problem_set_v2_extensions',
  },
  {
    up: migration_20260316_120000_add_account_notification_preferences.up,
    down: migration_20260316_120000_add_account_notification_preferences.down,
    name: '20260316_120000_add_account_notification_preferences',
  },
  {
    up: migration_20260316_130000_create_api_keys.up,
    down: migration_20260316_130000_create_api_keys.down,
    name: '20260316_130000_create_api_keys',
  },
  {
    up: migration_20260317_120000_add_engineering_figure_axes.up,
    down: migration_20260317_120000_add_engineering_figure_axes.down,
    name: '20260317_120000_add_engineering_figure_axes',
  },
  {
    up: migration_20260325_120000_add_help_topic_structured_fields.up,
    down: migration_20260325_120000_add_help_topic_structured_fields.down,
    name: '20260325_120000_add_help_topic_structured_fields',
  },
  {
    up: migration_20260327_070000_add_api_keys_locked_rel_column.up,
    down: migration_20260327_070000_add_api_keys_locked_rel_column.down,
    name: '20260327_070000_add_api_keys_locked_rel_column',
  },
  {
    up: migration_20260327_130000_repair_problem_schema_drift.up,
    down: migration_20260327_130000_repair_problem_schema_drift.down,
    name: '20260327_130000_repair_problem_schema_drift',
  },
  {
    up: migration_20260402_090000_add_problem_templates_runtime.up,
    down: migration_20260402_090000_add_problem_templates_runtime.down,
    name: '20260402_090000_add_problem_templates_runtime',
  },
  {
    up: migration_20260408_120000_add_problem_attempt_scope_key.up,
    down: migration_20260408_120000_add_problem_attempt_scope_key.down,
    name: '20260408_120000_add_problem_attempt_scope_key',
  },
  {
    up: migration_20260417_173500_add_lesson_quiz_block_fields.up,
    down: migration_20260417_173500_add_lesson_quiz_block_fields.down,
    name: '20260417_173500_add_lesson_quiz_block_fields',
  },
  {
    up: migration_20260417_190000_add_questions_classroom_scope.up,
    down: migration_20260417_190000_add_questions_classroom_scope.down,
    name: '20260417_190000_add_questions_classroom_scope',
  },
  {
    up: migration_20260421_120000_add_multi_format_quiz_support.up,
    down: migration_20260421_120000_add_multi_format_quiz_support.down,
    name: '20260421_120000_add_multi_format_quiz_support',
  },
  {
    up: migration_20260506_120000_add_text_section_block.up,
    down: migration_20260506_120000_add_text_section_block.down,
    name: '20260506_120000_add_text_section_block',
  },
  {
    up: migration_20260506_140000_add_account_session_tracking.up,
    down: migration_20260506_140000_add_account_session_tracking.down,
    name: '20260506_140000_add_account_session_tracking',
  },
  {
    up: migration_20260506_160000_add_concepts.up,
    down: migration_20260506_160000_add_concepts.down,
    name: '20260506_160000_add_concepts',
  },
  {
    up: migration_20260506_180000_add_pre_post_assessments.up,
    down: migration_20260506_180000_add_pre_post_assessments.down,
    name: '20260506_180000_add_pre_post_assessments',
  },
]
