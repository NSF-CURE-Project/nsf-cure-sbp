import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "saved_views" (
     "id" serial PRIMARY KEY NOT NULL,
     "name" varchar NOT NULL,
     "scope" varchar NOT NULL,
     "state" jsonb NOT NULL,
     "shared" boolean DEFAULT false,
     "owner_id" integer NOT NULL,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE INDEX IF NOT EXISTS "saved_views_scope_idx" ON "saved_views" USING btree ("scope");
   CREATE INDEX IF NOT EXISTS "saved_views_owner_idx" ON "saved_views" USING btree ("owner_id");
   CREATE INDEX IF NOT EXISTS "saved_views_shared_idx" ON "saved_views" USING btree ("shared");
   CREATE INDEX IF NOT EXISTS "saved_views_updated_at_idx" ON "saved_views" USING btree ("updated_at");
   CREATE INDEX IF NOT EXISTS "saved_views_created_at_idx" ON "saved_views" USING btree ("created_at");

   DO $$ BEGIN
     ALTER TABLE "saved_views" ADD CONSTRAINT "saved_views_owner_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "saved_views" CASCADE;
  `)
}
