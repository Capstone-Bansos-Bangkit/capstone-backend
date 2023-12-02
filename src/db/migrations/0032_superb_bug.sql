ALTER TABLE "attachment" RENAME COLUMN "type" TO "mime_type";--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "created_at" timestamp DEFAULT now();