ALTER TABLE "user_answer_submission" RENAME TO "user_submission_answer";--> statement-breakpoint
ALTER TABLE "user_submission_answer" DROP CONSTRAINT "user_answer_submission_user_submission_id_user_submission_id_fk";
--> statement-breakpoint
ALTER TABLE "user_submission_answer" DROP CONSTRAINT "user_answer_submission_question_id_question_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submission_answer" ADD CONSTRAINT "user_submission_answer_user_submission_id_user_submission_id_fk" FOREIGN KEY ("user_submission_id") REFERENCES "user_submission"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submission_answer" ADD CONSTRAINT "user_submission_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
