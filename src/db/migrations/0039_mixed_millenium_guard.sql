ALTER TABLE "bansos_provider" ADD COLUMN "alias" text;--> statement-breakpoint
ALTER TABLE "bansos_event" DROP COLUMN IF EXISTS "alias";