ALTER TABLE "attachment" ADD COLUMN "uploader_nik" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachment" ADD CONSTRAINT "attachment_uploader_nik_users_nik_fk" FOREIGN KEY ("uploader_nik") REFERENCES "users"("nik") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
