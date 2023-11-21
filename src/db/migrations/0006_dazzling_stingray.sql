ALTER TABLE "user_information" ADD COLUMN "question_id" integer;--> statement-breakpoint
ALTER TABLE "user_information" ADD COLUMN "answer" text;--> statement-breakpoint
ALTER TABLE "user_information_submission" ADD COLUMN "question_id" integer;--> statement-breakpoint
ALTER TABLE "user_information_submission" ADD COLUMN "answer" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_information" ADD CONSTRAINT "user_information_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_information_submission" ADD CONSTRAINT "user_information_submission_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
