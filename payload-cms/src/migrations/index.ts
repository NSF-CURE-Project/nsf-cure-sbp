import * as migration_20251220_024730_add_versions from './20251220_024730_add_versions';
import * as migration_20251220_041833_add_layout_blocks from './20251220_041833_add_layout_blocks';
import * as migration_20251225_182747 from './20251225_182747';
import * as migration_20251228_190000_lesson_feedback_nav_order from './20251228_190000_lesson_feedback_nav_order';
import * as migration_20251229_183000_user_names_theme from './20251229_183000_user_names_theme';
import * as migration_20260105_120000_add_professor_role from './20260105_120000_add_professor_role';
import * as migration_20260212_161835_add_classrooms_and_memberships from './20260212_161835_add_classrooms_and_memberships';
import * as migration_20260212_203500_add_classroom_rel_columns from './20260212_203500_add_classroom_rel_columns';
import * as migration_20260304_000000_add_lesson_bookmarks_rel_columns from './20260304_000000_add_lesson_bookmarks_rel_columns';
import * as migration_20260310_060000_add_site_branding_and_footer_nsf from './20260310_060000_add_site_branding_and_footer_nsf';
import * as migration_20260311_000000_add_reporting_snapshot_reproducibility_key from './20260311_000000_add_reporting_snapshot_reproducibility_key';
import * as migration_20260311_010000_add_reporting_rel_columns from './20260311_010000_add_reporting_rel_columns';

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
];
