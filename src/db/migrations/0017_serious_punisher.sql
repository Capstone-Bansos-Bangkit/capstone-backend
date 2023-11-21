CREATE TABLE IF NOT EXISTS "question_choice" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" text,
	"value" integer,
	"alias" text
);
--> statement-breakpoint
ALTER TABLE "user_answer_submission" DROP COLUMN IF EXISTS "verified";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_choice" ADD CONSTRAINT "question_choice_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
