CREATE TABLE IF NOT EXISTS "question_choice" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer,
	"choice" integer,
	"value" text
);
--> statement-breakpoint
ALTER TABLE "question" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "question" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_choice" ADD CONSTRAINT "question_choice_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
