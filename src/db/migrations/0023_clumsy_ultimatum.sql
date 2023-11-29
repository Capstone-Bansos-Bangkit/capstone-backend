ALTER TABLE "bansos_event" ADD COLUMN "bansos_provider_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bansos_event" ADD CONSTRAINT "bansos_event_bansos_provider_id_bansos_provider_id_fk" FOREIGN KEY ("bansos_provider_id") REFERENCES "bansos_provider"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "bansos_event" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "bansos_event" DROP COLUMN IF EXISTS "address";