import * as migration_20251220_024730_add_versions from './20251220_024730_add_versions';
import * as migration_20251220_041833_add_layout_blocks from './20251220_041833_add_layout_blocks';
import * as migration_20251225_182747 from './20251225_182747';

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
    name: '20251225_182747'
  },
];
