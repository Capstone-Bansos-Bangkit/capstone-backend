CREATE TABLE IF NOT EXISTS "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aid_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"address" text,
	"start_date" date,
	"end_date" date,
	"created_at" date DEFAULT now(),
	"updated_at" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"nik" text PRIMARY KEY NOT NULL,
	"mother_name" text NOT NULL,
	"birth_date" date NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"phone_number" text,
	"email" text,
	"created_at" date DEFAULT now(),
	"updated_at" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_information" (
	"nik" text,
	"created_at" date DEFAULT now(),
	"updated_at" date DEFAULT now(),
	"salary" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_information_submission" (
	"nik" text,
	"aid_id" integer,
	"verified" boolean DEFAULT false,
	"created_at" date DEFAULT now(),
	"updated_at" date DEFAULT now(),
	"salary" integer,
	CONSTRAINT user_information_submission_nik_aid_id PRIMARY KEY("nik","aid_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_information" ADD CONSTRAINT "user_information_nik_users_nik_fk" FOREIGN KEY ("nik") REFERENCES "users"("nik") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_information_submission" ADD CONSTRAINT "user_information_submission_nik_users_nik_fk" FOREIGN KEY ("nik") REFERENCES "users"("nik") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_information_submission" ADD CONSTRAINT "user_information_submission_aid_id_aid_event_id_fk" FOREIGN KEY ("aid_id") REFERENCES "aid_event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
