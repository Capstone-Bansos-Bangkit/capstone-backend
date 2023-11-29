ALTER TABLE "user_submission" RENAME COLUMN "aid_id" TO "bansos_event_id";--> statement-breakpoint
ALTER TABLE "user_submission" DROP CONSTRAINT "user_submission_aid_id_bansos_event_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submission" ADD CONSTRAINT "user_submission_bansos_event_id_bansos_event_id_fk" FOREIGN KEY ("bansos_event_id") REFERENCES "bansos_event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
