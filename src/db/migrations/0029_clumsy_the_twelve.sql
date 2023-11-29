ALTER TABLE "users" ADD COLUMN "no_kk" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "jenis_kelamin" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "desa" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kecamatan" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kabupaten" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provinsi" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "address";