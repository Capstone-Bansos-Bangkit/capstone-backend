CREATE TABLE IF NOT EXISTS "dummy" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text,
	"path" text,
	"data" jsonb
);
