ALTER TABLE "users" ADD COLUMN "desa_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_desa_id_wilayah_desa_id_fk" FOREIGN KEY ("desa_id") REFERENCES "wilayah_desa"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "desa";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "kecamatan";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "kabupaten";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "provinsi";