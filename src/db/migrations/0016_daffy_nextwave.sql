CREATE TABLE IF NOT EXISTS "question" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_answer" (
	"nik" text,
	"question_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"answer" text,
	CONSTRAINT user_answer_nik_question_id PRIMARY KEY("nik","question_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_answer_submission" (
	"nik" text,
	"aid_id" integer,
	"question_id" text,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"answer" text,
	CONSTRAINT user_answer_submission_nik_aid_id_question_id PRIMARY KEY("nik","aid_id","question_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answer" ADD CONSTRAINT "user_answer_nik_users_nik_fk" FOREIGN KEY ("nik") REFERENCES "users"("nik") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answer" ADD CONSTRAINT "user_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answer_submission" ADD CONSTRAINT "user_answer_submission_nik_users_nik_fk" FOREIGN KEY ("nik") REFERENCES "users"("nik") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answer_submission" ADD CONSTRAINT "user_answer_submission_aid_id_aid_event_id_fk" FOREIGN KEY ("aid_id") REFERENCES "aid_event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answer_submission" ADD CONSTRAINT "user_answer_submission_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
