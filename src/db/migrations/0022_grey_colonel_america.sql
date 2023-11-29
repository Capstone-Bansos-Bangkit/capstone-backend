ALTER TABLE "aid_event" RENAME TO "bansos_event";--> statement-breakpoint
ALTER TABLE "user_submission" DROP CONSTRAINT "user_submission_aid_id_aid_event_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submission" ADD CONSTRAINT "user_submission_aid_id_bansos_event_id_fk" FOREIGN KEY ("aid_id") REFERENCES "bansos_event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
