CREATE TABLE IF NOT EXISTS "question" (
	"id" serial PRIMARY KEY NOT NULL,
	"alias" text,
	"question" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
