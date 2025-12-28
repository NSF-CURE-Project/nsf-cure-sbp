import * as migration_20251225_182747 from './20251225_182747'
import * as migration_20251228_190000_lesson_feedback_nav_order from './20251228_190000_lesson_feedback_nav_order'
import * as migration_20251229_183000_user_names_theme from './20251229_183000_user_names_theme'

export const migrations = [
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
]
