ALTER TABLE "admins" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "bansos_event" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "updated_at";