ALTER TABLE "question_choice" DROP CONSTRAINT "question_choice_question_id_question_id_fk";
--> statement-breakpoint
ALTER TABLE "question_choice" DROP COLUMN IF EXISTS "question_id";