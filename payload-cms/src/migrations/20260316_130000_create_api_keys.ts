import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "api_keys" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "key" varchar NOT NULL,
      "owner_id" integer NOT NULL,
      "scopes" text[] DEFAULT ARRAY['reporting:read']::text[] NOT NULL,
      "last_used_at" timestamp(3) with time zone,
      "expires_at" timestamp(3) with time zone,
      "active" boolean DEFAULT true NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "api_keys"
        ADD CONSTRAINT "api_keys_owner_id_users_id_fk"
          FOREIGN KEY ("owner_id")
          REFERENCES "public"."users"("id")
          ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_key_idx" ON "api_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "api_keys_owner_idx" ON "api_keys" USING btree ("owner_id");
    CREATE INDEX IF NOT EXISTS "api_keys_active_idx" ON "api_keys" USING btree ("active");
    CREATE INDEX IF NOT EXISTS "api_keys_expires_at_idx" ON "api_keys" USING btree ("expires_at");
    CREATE INDEX IF NOT EXISTS "api_keys_updated_at_idx" ON "api_keys" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "api_keys_created_at_idx" ON "api_keys" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "api_keys_key_idx";
    DROP INDEX IF EXISTS "api_keys_owner_idx";
    DROP INDEX IF EXISTS "api_keys_active_idx";
    DROP INDEX IF EXISTS "api_keys_expires_at_idx";
    DROP INDEX IF EXISTS "api_keys_updated_at_idx";
    DROP INDEX IF EXISTS "api_keys_created_at_idx";

    ALTER TABLE IF EXISTS "api_keys"
      DROP CONSTRAINT IF EXISTS "api_keys_owner_id_users_id_fk";

    DROP TABLE IF EXISTS "api_keys" CASCADE;
  `)
}
