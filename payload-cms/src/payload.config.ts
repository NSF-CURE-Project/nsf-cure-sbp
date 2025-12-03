// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig, type PayloadComponent } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Classes } from './collections/Classes';
import { Chapters } from './collections/Chapters';
import { Lessons } from './collections/Lessons';
import { HomePage } from './globals/HomePage';
import { ResourcesPage } from './globals/ResourcesPage';
import { ContactPage } from './globals/ContactPage';
import { GettingStarted } from './globals/GettingStarted';
// Uses the generated import map entry for the dashboard view component
const StaffDashboardView: PayloadComponent = {
  path: '@/views/StaffDashboardView#default',
};
const StaffProvider: PayloadComponent = {
  path: '@/views/StaffProvider#default',
};

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,

    importMap: {
      baseDir: path.resolve(dirname),
    },

    components: {
      providers: [StaffProvider],
      views: {
        dashboard: {
          Component: StaffDashboardView,
        },
      },
    },
  },

  collections: [Classes, Chapters, Lessons, Users, Media],
  globals: [HomePage, ResourcesPage, ContactPage, GettingStarted],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    // storage-adapter-placeholder
  ],
});
