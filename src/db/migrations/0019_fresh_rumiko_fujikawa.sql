CREATE TABLE IF NOT EXISTS "user_answer_submission" (
	"user_submission_id" integer,
	"question_id" text,
	"answer" integer,
	CONSTRAINT user_answer_submission_user_submission_id_question_id PRIMARY KEY("user_submission_id","question_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_submission" (
	"id" serial PRIMARY KEY NOT NULL,
	"nik" text,
	"aid_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answer_submission" ADD CONSTRAINT "user_answer_submission_user_submission_id_user_submission_id_fk" FOREIGN KEY ("user_submission_id") REFERENCES "user_submission"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answer_submission" ADD CONSTRAINT "user_answer_submission_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submission" ADD CONSTRAINT "user_submission_nik_users_nik_fk" FOREIGN KEY ("nik") REFERENCES "users"("nik") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submission" ADD CONSTRAINT "user_submission_aid_id_aid_event_id_fk" FOREIGN KEY ("aid_id") REFERENCES "aid_event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
